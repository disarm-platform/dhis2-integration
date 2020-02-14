/* This function is designed to be run as a serverless function. 
 * Check the README.md for configurable environment variables
 * 
 * The `main` function contains the outline.
 * The `handler` function is responsible for CORS and handling the cloud function request
 */
import fetch from 'node-fetch';
import Express from 'express';
import {
  FnRequest,
  DataValueSets,
  RawOrgUnit,
  DataElementLookup,
  OrgUnitsFeature,
  PointDataFields,
  DataValue,
  FnResponse,
  RunResult,
  RawDataElement,
  CombinedFeature
} from './types';
import { write_debug_file } from './write_debug_file';
import config from './config';


async function main(): Promise<boolean> {
  const { dataValueSets, orgUnitsFeatures, dataElementLookup } = await get_data_from_dhis2();
  const fn_request = await prepare_request_for_disarm(dataValueSets, orgUnitsFeatures, dataElementLookup);
  const run_result = await run_disarm_algorithm(fn_request);
  const data_for_dhis2 = await shape_result_for_dhis2(run_result, dataElementLookup);
  await write_result_to_dhis2(data_for_dhis2);
  await trigger_dhis2_analytics();
  return true;
}

exports.handler = async (req: Express.Request, res: Express.Response) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'content-type');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }

  const ran_ok = await main();
  if (ran_ok) {
    res.sendStatus(200);
  } else {
    res.sendStatus(502);
  }
}

async function get_data_from_dhis2() {
  const metadata_url = `${config.dhis2_root_url}/api/metadata.json?assumeTrue=false&dataElements=true&organisationUnits=true&dataSets=true&users=true`;
  const metadata_res = await fetch(metadata_url, { headers: config.dhis2_headers });
  const metadata = await metadata_res.json();
  await write_debug_file(metadata, 'metadata');

  const dataSetId = metadata.dataSets[0].id;
  const orgUnitIds: string[] = (metadata.organisationUnits as RawOrgUnit[]).filter(i => i.hasOwnProperty('parent')).map(i => i.id);
  const orgUnitParams = orgUnitIds.map(i => `&orgUnit=${i}`).join('');

  const dataValueSetsUrl = `${config.dhis2_root_url}/api/dataValueSets.json?dataSet=${dataSetId}&period=${config.static_period}${orgUnitParams}`;
  const dataValueSetsUrl_res = await fetch(dataValueSetsUrl, { headers: config.dhis2_headers });
  const dataValueSets: DataValueSets = await dataValueSetsUrl_res.json();
  await write_debug_file(dataValueSets, 'dataValueSets');

  const rawOrgUnits: RawOrgUnit[] = metadata.organisationUnits;
  await write_debug_file(rawOrgUnits, 'rawOrgUnits');

  const rawDataElements = metadata.dataElements;
  await write_debug_file(rawDataElements, 'rawDataElements');

  // Create GeoJSON of OrgUnits
  const orgUnitsFeatures: OrgUnitsFeature[] = rawOrgUnits.filter(i => i.hasOwnProperty('parent')).map(i => {
    return {
      type: 'Feature',
      properties: {
        id: i.id,
        orgUnit_id: i.id,
        orgUnit_name: i.name,
      },
      geometry: {
        type: 'Point',
        coordinates: i.geometry.coordinates,
      }
    };
  });

  // Create lookup for dataElement renaming
  const dataElementLookup: DataElementLookup = (rawDataElements as RawDataElement[]).reduce((acc: DataElementLookup, i) => {
    acc[i.id] = i.name;
    acc[i.name] = i.id;
    return acc;
  }, {});
  await write_debug_file(dataElementLookup, 'dataElementLookup');

  return { dataValueSets, orgUnitsFeatures, dataElementLookup };
}

async function prepare_request_for_disarm(
  dataValueSets: DataValueSets,
  orgUnitsFeatures: OrgUnitsFeature[],
  dataElementLookup: DataElementLookup,
): Promise<FnRequest> {

  const dataValues = dataValueSets.dataValues;

  const features: CombinedFeature[] = orgUnitsFeatures.map(feature => {
    const interim_feature = feature as CombinedFeature;

    for (const field in PointDataFields) {
      const looked_up_field = dataElementLookup[field];
      const found_dataValue = dataValues.find((dv) => {
        return (dv.orgUnit === feature.properties.orgUnit_id) && (dv.dataElement === looked_up_field);
      });
      if (found_dataValue) {
        interim_feature.properties[field as PointDataFields] = parseFloat(found_dataValue.value);
      } else {
        console.error('Cannot find dataValue for', field, 'in', interim_feature);
      }
    }

    return interim_feature;
  });

  const fn_request: FnRequest = {
    point_data: {
      type: 'FeatureCollection',
      features,
    }
  };
  await write_debug_file(fn_request, 'send_to_disarm');

  return fn_request;
}

async function run_disarm_algorithm(fn_request: FnRequest): Promise<FnResponse> {
  const run_url = `${config.disarm_fn_url}`;
  const run_res = await fetch(run_url, {
    method: 'post',
    headers: config.dhis2_headers,
    body: JSON.stringify(fn_request)
  });
  const result = await run_res.json();
  await write_debug_file(result, 'disarm_output');
  return (result as FnResponse);
}

async function shape_result_for_dhis2(run_response: FnResponse, dataElementLookup: DataElementLookup): Promise<DataValueSets> {
  if (run_response.function_status === 'error') {
    throw { name: 'FnError', message: 'Something wrong with DiSARM function' };
  }

  const result = run_response.result as RunResult;

  const dataValues: DataValue[] = result.features.reduce((acc, f) => {
    for (const field in PointDataFields) {
      const properties = f.properties;
      const dataElement = dataElementLookup[field];
      const value = properties[field];
      const orgUnit = properties.orgUnit_id;
      const lastUpdated = (new Date).toISOString();
      acc.push({
        dataElement,
        value,
        period: config.static_period,
        orgUnit,
        lastUpdated,
      });
    }
    return acc;
  }, [] as DataValue[]);

  const data_for_dhis2: DataValueSets = {
    dataValues,
  };
  await write_debug_file(data_for_dhis2, 'data_for_dhis2');

  return data_for_dhis2;
}

async function write_result_to_dhis2(data_for_dhis2: DataValueSets): Promise<void> {
  const post_data_to_dhis2_url = `${config.dhis2_root_url}/api/dataValueSets.json?importStrategy=UPDATE`;
  const post_data_to_dhis2_res = await fetch(post_data_to_dhis2_url, {
    method: 'post',
    headers: {
      ...config.dhis2_headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data_for_dhis2)
  });
  const post_data_to_dhis2 = await post_data_to_dhis2_res.json();
  await write_debug_file(post_data_to_dhis2, 'response_from_dhis2');
}

async function trigger_dhis2_analytics(delay = 2000): Promise<void> {
  await new Promise((resolve, _) => {
    setTimeout(() => {
      console.log('Trigger analytics')
      resolve();
    }, delay);
  })

  const dhis2_trigger_analytics_url = `${config.dhis2_root_url}/api/resourceTables/analytics`;
  const dhis2_trigger_analytics_res = await fetch(dhis2_trigger_analytics_url, {
    method: 'post',
    headers: config.dhis2_headers
  });
  const dhis2_trigger_analytics = await dhis2_trigger_analytics_res.json();
  await write_debug_file(dhis2_trigger_analytics, 'response_from_dhis2_analytics_bump');
}

main()

