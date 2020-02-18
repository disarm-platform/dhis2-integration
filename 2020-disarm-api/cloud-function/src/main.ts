import { prepare_request_for_disarm, run_disarm_algorithm, shape_result_for_dhis2 } from './disarm';
import { get_data_from_dhis2, write_result_to_dhis2, trigger_dhis2_analytics } from './dhis2';

export async function main(): Promise<boolean> {
  const { dataValueSets, orgUnitsFeatures, dataElementLookup } = await get_data_from_dhis2();
  const fn_request = await prepare_request_for_disarm(dataValueSets, orgUnitsFeatures, dataElementLookup);
  const run_result = await run_disarm_algorithm(fn_request);
  const data_for_dhis2 = await shape_result_for_dhis2(run_result, dataElementLookup);

  await write_result_to_dhis2(data_for_dhis2);
  await trigger_dhis2_analytics();

  return true;
}
