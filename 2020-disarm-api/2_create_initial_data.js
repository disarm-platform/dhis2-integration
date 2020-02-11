const fs = require('fs');
const fetch = require('node-fetch');
const { cloneDeep } = require('lodash');

// CONFIG
const static_period = '201912';
// const root_url = 'http://localhost:8080';
// const root_url = 'https://ppls.ngrok.io';
const root_url = 'http://dhis2.disarm.io:8080';

const headers = {
  Authorization: 'Basic YWRtaW46ZGlzdHJpY3Q='
};
let file_count = 0;

async function main() {
  const source_features = JSON.parse(fs.readFileSync('./swz_points.geojson')).features;

  const metadata_url = `${root_url}/api/metadata.json?assumeTrue=false&dataElements=true&organisationUnits=true&dataSets=true&users=true`;
  const metadata_res = await fetch(metadata_url, { headers });
  const metadata = await metadata_res.json();
  await write_file(metadata, 'metadata');


  const rawOrgUnits = metadata.organisationUnits;
  await write_file(rawOrgUnits, 'rawOrgUnits');

  const rawDataElements = metadata.dataElements;
  await write_file(rawDataElements, 'rawDataElements');

  // Create lookup for dataElement renaming
  const dataElementLookup = rawDataElements.reduce((acc, i) => {
    acc[i.id] = i.name;
    acc[i.name] = i.id;
    return acc;
  }, {});

  await write_file(dataElementLookup, 'dataElementLookup');

  const dataValues = rawOrgUnits.reduce((acc, u, index) => {
    const found_feature = source_features.find(f => f.properties.code === u.name);
    if (!found_feature) {
      console.log('No feature found for', u.name);
      return acc;
    }

    for (const field_name of ['n_trials', 'n_positive', 'prevalence_prediction']) {
      const dataElementId = dataElementLookup[field_name];

      let value;
      if (field_name === 'prevalence_prediction') {
        value = 0;
      } else {
        value = found_feature.properties[field_name];
      }
      // console.log('value', value);

      acc.push({
        "dataElement": dataElementId,
        "period": static_period,
        "orgUnit": u.id,
        "value": value,
        "storedBy": "admin",
        "followup": false
      })
    }
    return acc;
  }, [])

  const data_for_dhis2 = {
    dataValues,
  };

  await write_file(data_for_dhis2, 'data_for_dhis2')

  // Write back to DHIS2
  const post_data_to_dhis2_url = `${root_url}/api/dataValueSets.json?importStrategy=CREATE_AND_UPDATE`;
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
  await new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('Trigger analytics')
      resolve();
    }, 2000);
  })

  const dhis2_trigger_analytics_url = `${root_url}/api/resourceTables/analytics`;
  const dhis2_trigger_analytics_res = await fetch(dhis2_trigger_analytics_url, {
    method: 'post',
    headers
  });
  const dhis2_trigger_analytics = await dhis2_trigger_analytics_res.json();
  await write_file(dhis2_trigger_analytics, 'response_from_dhis2_analytics_bump');
}

async function write_file(content, filename) {
  return await fs.writeFileSync(`data/2_create_initial_data/${file_count++}_${filename}.json`, JSON.stringify(content, null, 2));
}

main()

