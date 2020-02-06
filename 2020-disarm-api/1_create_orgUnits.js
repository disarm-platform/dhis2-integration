const fs = require('fs');
const fetch = require('node-fetch');
const { cloneDeep } = require('lodash');

// CONFIG
const static_period = '201912';
const root_url = 'http://localhost:8080';
// const root_url = 'https://ppls.ngrok.io';
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

  const dataSetId = metadata.dataSets[0].id;
  const userId = metadata.users[0].id;
  const top_level_orgUnit = metadata.organisationUnits.filter(i => i.level === 1)[0];
  const top_level_orgUnitId = top_level_orgUnit.id;
  console.log('top_level_orgUnitId', top_level_orgUnitId);
  console.log('userId', userId);

  const target_orgUnits = source_features.map((f, index) => {
    const facility_id = index + 1;
    return {
      "code": `Facility_${facility_id}`,
      "level": 2,
      "name": `Facility_${facility_id}`,
      "shortName": `Facility_${facility_id}`,
      "geometry": {
        "type": "Point",
        "coordinates": f.geometry.coordinates
      },
      "openingDate": "2017-01-31T00:00:00.000",
      "parent": {
        "id": top_level_orgUnitId
      },
      "user": {
        "id": userId
      },
      "attributeValues": [],
      "translations": []
    }
  });

  console.log('target_orgUnits', target_orgUnits);

  const data_for_dhis2 = {
    organisationUnits: target_orgUnits
  };

  // Write back to DHIS2
  const post_data_to_dhis2_url = `${root_url}/api/metadata.json?importStrategy=CREATE`;
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

}

async function write_file(content, filename) {
  return await fs.writeFileSync(`data/1_create_orgUnits/${file_count++}_${filename}.json`, JSON.stringify(content, null, 2));
}

main()

