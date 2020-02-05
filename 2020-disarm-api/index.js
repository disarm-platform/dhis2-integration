const fs = require('fs');
const fetch = require('node-fetch');
const { cloneDeep } = require('lodash');

// CONFIG
const static_period = '20200201';
const root_url = 'http://localhost:8080';
const headers = {
  Authorization: 'Basic YWRtaW46ZGlzdHJpY3Q='
};
let file_count = 0;

async function main() {
  const metadata_url = `${root_url}/api/metadata.json?assumeTrue=false&dataElements=true&organisationUnits=true`;
  const metadata_res = await fetch(metadata_url, { headers });
  const metadata = await metadata_res.json();
  await write_file(metadata, 'metadata');

  const orgUnitIds = metadata.organisationUnits.filter(i => i.hasOwnProperty('parent')).map(i => i.id);

  const orgUnitParams = orgUnitIds.map(i => `&orgUnit=${i}`).join('');

  const dataValueSetsUrl = `${root_url}/api/dataValueSets.json?dataSet=CNM7hjjV4Dg&period=20200201${orgUnitParams}`;
  const dataValueSetsUrl_res = await fetch(dataValueSetsUrl, { headers });
  const dataValueSets = await dataValueSetsUrl_res.json();
  await write_file(dataValueSets, 'dataValueSets');

  const rawOrgUnits = metadata.organisationUnits;
  await write_file(rawOrgUnits, 'rawOrgUnits');

  const rawDataElements = metadata.dataElements;
  await write_file(rawDataElements, 'rawDataElements');

  // Create GeoJSON of OrgUnits
  const orgUnitsFeatures = rawOrgUnits.filter(i => i.hasOwnProperty('parent')).map(i => {
    return {
      type: 'Feature',
      properties: {
        orgUnit_id: i.id,
        orgUnit_name: i.name,
      },
      geometry: {
        type: 'Point',
        coordinates: i.coordinates.replace(/\[|\]/g, '').split(',').map(i => parseFloat(i))
      }
    };
  });

  const orgUnitsGeoJSON = {
    type: 'FeatureCollection',
    features: orgUnitsFeatures,
  };

  await write_file(orgUnitsGeoJSON, 'orgUnitsGeoJSON');

  // Create lookup for dataElement renaming
  const dataElementLookup = rawDataElements.reduce((acc, i) => {
    acc[i.id] = i.name;
    acc[i.name] = i.id;
    return acc;
  }, {});

  await write_file(dataElementLookup, 'dataElementLookup');

  // Reshape for DiSARM
  dataValueSets.dataValues.forEach((d) => {
    const found_orgUnit = orgUnitsFeatures.find(o => o.properties.orgUnit_id === d.orgUnit);
    if (!found_orgUnit) {
      console.error('Cannot find orgUnit for', d);
    }
    const found_dataElement = dataElementLookup[d.dataElement];
    if (!found_dataElement) {
      console.error('Cannot find dataElement for', d);
    }
    found_orgUnit.properties[found_dataElement] = parseFloat(d.value);
  });

  await write_file(orgUnitsGeoJSON, 'send_to_disarm');

  // Simulate DiSARM function - randomly add prevalence
  const output_geojson = cloneDeep(orgUnitsGeoJSON);
  output_geojson.features.forEach(f => {
    f.properties.prevalence = Math.random();
  })
  await write_file(output_geojson, 'disarm_output');

  // reshape back from DiSARM for DHIS2
  const dataValues = output_geojson.features.reduce((acc, f) => {
    for (const field_name of ['n_trials', 'n_positive', 'prevalence']) {
      const properties = f.properties;
      const dataElement = dataElementLookup[field_name];
      const value = properties[field_name];
      const orgUnit = properties.orgUnit_id;
      const lastUpdated = new Date;
      acc.push({
        dataElement,
        value,
        period: static_period,
        orgUnit,
        lastUpdated,
      })
    }
    return acc;

  }, [])

  const data_for_dhis2 = {
    dataValues,
  };

  await write_file(data_for_dhis2, 'data_for_dhis2')

  // Write back to DHIS2
  const post_data_to_dhis2_url = `${root_url}/api/dataValueSets.json?importStrategy=UPDATE`;
  const post_data_to_dhis2_res = await fetch(post_data_to_dhis2_url, { 
    method: 'post', 
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    }, 
    body: JSON.stringify(data_for_dhis2) 
  });
  const post_data_to_dhis2 = await post_data_to_dhis2_res.json();
  await write_file(post_data_to_dhis2, 'response_from_dhis2');
  
  // Force update of DHIS2 analytics tables
  const dhis2_trigger_analytics_url = `${root_url}/api/resourceTables/analytics.json`;
  const dhis2_trigger_analytics_res = await fetch(dhis2_trigger_analytics_url, { 
    method: 'post', 
    headers
  });
  const dhis2_trigger_analytics = await dhis2_trigger_analytics_res.text(); // bug in DHIS2 returns broken JSON
  await write_file(dhis2_trigger_analytics, 'response_from_dhis2_analytics_bump');
}

async function write_file(content, filename) {
  return await fs.writeFileSync(`data/${file_count++}_${filename}.json`, JSON.stringify(content, null, 2));
}

main()

