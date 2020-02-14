/* This function is designed to be run as a serverless function. 
 * Check the README.md for configurable environment variables
 * 
 * The `main` function contains the outline.
 * The `handler` function is responsible for CORS and handling the cloud function request
 * The `disarm` file contains functionality related to preparing data and running DiSARM function
 * The `dhis2` file contains functionality that reads and writes data from DHIS2
 */
import Express from 'express';
import { prepare_request_for_disarm, run_disarm_algorithm, shape_result_for_dhis2 } from './disarm';
import { get_data_from_dhis2, write_result_to_dhis2, trigger_dhis2_analytics } from './dhis2';

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

main()

