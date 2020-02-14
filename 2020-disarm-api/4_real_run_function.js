const fs = require('fs');
const fetch = require('node-fetch');

// CONFIG
const static_period = '201912';
const dhis2_root_url = process.env.DHIS2_ROOT_URL || "http://dhis2.disarm.io:8080";
const dhis2_headers = {
  Authorization: process.env.DHIS2_AUTH || 'Basic YWRtaW46ZGlzdHJpY3Q='
};
const disarm_fn_url = process.env.DISARM_FN_URL || 'https://faas.srv.disarm.io/function/fn-prevalence-predictor';
const DEBUG = process.env.DEBUG;

let debug_file_count = 0;

async function main() {
  const { dataValueSets, orgUnitsFeatures, dataElementLookup } = await get_data_from_dhis2();
  const orgUnitsGeoJSON = await shape_data_for_disarm(dataValueSets, orgUnitsFeatures, dataElementLookup);
  const run_result = await run_disarm_algorithm(orgUnitsGeoJSON);
  const data_for_dhis2 = await shape_result_for_dhis2(run_result, dataElementLookup);
  await write_result_to_dhis2(data_for_dhis2);
  await trigger_dhis2_analytics();
}

exports.handler = async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'content-type');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }

  const worked = await main();
  if (worked) {
    res.sendStatus(200);
  } else {
    res.sendStatus(502);
  }
}

async function get_data_from_dhis2() {
  const metadata_url = `${dhis2_root_url}/api/metadata.json?assumeTrue=false&dataElements=true&organisationUnits=true&dataSets=true&users=true`;
  const metadata_res = await fetch(metadata_url, { headers: dhis2_headers });
  const metadata = await metadata_res.json();
  await write_debug_file(metadata, 'metadata');

  const dataSetId = metadata.dataSets[0].id;
  const orgUnitIds = metadata.organisationUnits.filter(i => i.hasOwnProperty('parent')).map(i => i.id);
  const orgUnitParams = orgUnitIds.map(i => `&orgUnit=${i}`).join('');

  const dataValueSetsUrl = `${dhis2_root_url}/api/dataValueSets.json?dataSet=${dataSetId}&period=${static_period}${orgUnitParams}`;
  const dataValueSetsUrl_res = await fetch(dataValueSetsUrl, { headers: dhis2_headers });
  const dataValueSets = await dataValueSetsUrl_res.json();
  await write_debug_file(dataValueSets, 'dataValueSets');
  
  const rawOrgUnits = metadata.organisationUnits;
  await write_debug_file(rawOrgUnits, 'rawOrgUnits');
  
  const rawDataElements = metadata.dataElements;
  await write_debug_file(rawDataElements, 'rawDataElements');
  
  // Create GeoJSON of OrgUnits
  const orgUnitsFeatures = rawOrgUnits.filter(i => i.hasOwnProperty('parent')).map(i => {
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
  const dataElementLookup = rawDataElements.reduce((acc, i) => {
    acc[i.id] = i.name;
    acc[i.name] = i.id;
    return acc;
  }, {});
  await write_debug_file(dataElementLookup, 'dataElementLookup');

  return { dataValueSets, orgUnitsFeatures, dataElementLookup };
}

async function shape_data_for_disarm(dataValueSets, orgUnitsFeatures, dataElementLookup) {
  const iterate_this = dataValueSets.dataValues; //.slice(0, 9);

  iterate_this.forEach((d) => {
    const found_orgUnit = orgUnitsFeatures.find(o => o.properties.orgUnit_id === d.orgUnit);
    if (!found_orgUnit) {
      console.error('Cannot find orgUnit for', d);
      return;
    }
    const found_dataElement = dataElementLookup[d.dataElement];
    if (!found_dataElement) {
      console.error('Cannot find dataElement for', d);
      return;
    }
    const value = parseFloat(d.value);
    found_orgUnit.properties[found_dataElement] = value;
  });

  const orgUnitsGeoJSON = {
    type: 'FeatureCollection',
    features: orgUnitsFeatures,
  };

  await write_debug_file(orgUnitsGeoJSON, 'send_to_disarm');
  return orgUnitsGeoJSON;
}

async function run_disarm_algorithm(orgUnitsGeoJSON) {
  const real_run_Url = `${disarm_fn_url}`;
  const real_run_Url_res = await fetch(real_run_Url, {
    method: 'post',
    headers: dhis2_headers,
    body: JSON.stringify({ point_data: orgUnitsGeoJSON })
  });
  const real_run_result = await real_run_Url_res.json();
  await write_debug_file(real_run_result, 'disarm_output');
  return real_run_result;
}

async function shape_result_for_dhis2(real_run_result, dataElementLookup) {
  const dataValues = real_run_result.result.features.reduce((acc, f) => {
    for (const field_name of ['n_trials', 'n_positive', 'prevalence_prediction']) {
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
      });
    }
    return acc;
  }, []);
  const data_for_dhis2 = {
    dataValues,
  };
  await write_debug_file(data_for_dhis2, 'data_for_dhis2');
  return data_for_dhis2;
}

async function write_result_to_dhis2(data_for_dhis2) {
  const post_data_to_dhis2_url = `${dhis2_root_url}/api/dataValueSets.json?importStrategy=UPDATE`;
  const post_data_to_dhis2_res = await fetch(post_data_to_dhis2_url, {
    method: 'post',
    headers: {
      ...dhis2_headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data_for_dhis2)
  });
  const post_data_to_dhis2 = await post_data_to_dhis2_res.json();
  await write_debug_file(post_data_to_dhis2, 'response_from_dhis2');
}

async function trigger_dhis2_analytics(delay = 2000) {
  await new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('Trigger analytics')
      resolve();
    }, delay);
  })

  const dhis2_trigger_analytics_url = `${dhis2_root_url}/api/resourceTables/analytics`;
  const dhis2_trigger_analytics_res = await fetch(dhis2_trigger_analytics_url, {
    method: 'post',
    headers: dhis2_headers
  });
  const dhis2_trigger_analytics = await dhis2_trigger_analytics_res.json();
  await write_debug_file(dhis2_trigger_analytics, 'response_from_dhis2_analytics_bump');
}

async function write_debug_file(content, filename) {
  if (DEBUG ===  'file') {
    // console.log(filename, content);
    return await fs.writeFileSync(`data/4_real_run_function/${debug_file_count++}_${filename}.json`, JSON.stringify(content, null, 2));
  } else if (DEBUG === 'log') {
    console.log(content);
  }
}

main()

