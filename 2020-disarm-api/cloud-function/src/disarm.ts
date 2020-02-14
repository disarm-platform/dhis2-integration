import fetch from 'node-fetch';
import { FnRequest, DataValueSets, DataElementLookup, OrgUnitsFeature, PointDataFields, DataValue, FnResponse, RunResult, CombinedFeature } from './types';
import { write_debug_file } from './write_debug_file';
import config from './config';

export async function prepare_request_for_disarm(dataValueSets: DataValueSets, orgUnitsFeatures: OrgUnitsFeature[], dataElementLookup: DataElementLookup): Promise<FnRequest> {
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
      }
      else {
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

export async function run_disarm_algorithm(fn_request: FnRequest): Promise<FnResponse> {
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

export async function shape_result_for_dhis2(run_response: FnResponse, dataElementLookup: DataElementLookup): Promise<DataValueSets> {
  if (run_response.function_status === 'error') {
    throw { name: 'FnError', message: 'Something wrong with DiSARM function' };
  }
  const result = run_response.result as RunResult;
  const dataValues: DataValue[] = result.features.reduce((acc: DataValue[], f) => {
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
