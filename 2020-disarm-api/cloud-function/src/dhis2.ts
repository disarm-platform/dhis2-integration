import fetch from 'node-fetch';
import { DataValueSets, RawOrgUnit, DataElementLookup, OrgUnitsFeature, RawDataElement } from './types';
import { write_debug_file } from './write_debug_file';
import config from './config';

export async function get_data_from_dhis2() {
  const metadata = await get_metadata();

  const dataSetId = metadata.dataSets[0].id;
  const orgUnitIds: string[] = (metadata.organisationUnits as RawOrgUnit[]).filter(i => i.hasOwnProperty('parent')).map(i => i.id);
  const orgUnitParams = orgUnitIds.map(i => `&orgUnit=${i}`).join('');
  
  const dataValueSets: DataValueSets = await get_dataValueSets(dataSetId, orgUnitParams);
  
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

async function get_metadata() {
  const metadata_url = `${config.dhis2_root_url}/api/metadata.json?assumeTrue=false&dataElements=true&organisationUnits=true&dataSets=true&users=true`;
  const metadata_res = await fetch(metadata_url, { headers: config.dhis2_headers });
  const metadata = await metadata_res.json();
  await write_debug_file(metadata, 'metadata');
  return metadata;
}

async function get_dataValueSets(dataSetId: any, orgUnitParams: string) {
  const dataValueSetsUrl = `${config.dhis2_root_url}/api/dataValueSets.json?dataSet=${dataSetId}&period=${config.static_period}${orgUnitParams}`;
  const dataValueSetsUrl_res = await fetch(dataValueSetsUrl, { headers: config.dhis2_headers });
  const dataValueSets: DataValueSets = await dataValueSetsUrl_res.json();
  await write_debug_file(dataValueSets, 'dataValueSets');
  return dataValueSets;
}

export async function write_result_to_dhis2(data_for_dhis2: DataValueSets): Promise<void> {
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

export async function trigger_dhis2_analytics(delay = 2000): Promise<void> {
  // Include a delay, to be certain DB writing has finished inside DHIS2
  await new Promise((resolve, _) => {
    setTimeout(() => {
      console.log('Trigger analytics');
      resolve();
    }, delay);
  });
  const dhis2_trigger_analytics_url = `${config.dhis2_root_url}/api/resourceTables/analytics`;
  const dhis2_trigger_analytics_res = await fetch(dhis2_trigger_analytics_url, {
    method: 'post',
    headers: config.dhis2_headers
  });
  const dhis2_trigger_analytics = await dhis2_trigger_analytics_res.json();
  await write_debug_file(dhis2_trigger_analytics, 'response_from_dhis2_analytics_bump');
}
