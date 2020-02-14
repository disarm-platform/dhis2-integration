// // CONFIG
// export const static_period = '201912';
// export const dhis2_root_url = process.env.DHIS2_ROOT_URL || "http://dhis2.disarm.io:8080";
// export const dhis2_headers = {
//   Authorization: process.env.DHIS2_AUTH || 'Basic YWRtaW46ZGlzdHJpY3Q='
// };
// export const disarm_fn_url = process.env.DISARM_FN_URL || 'https://faas.srv.disarm.io/function/fn-prevalence-predictor';
// export const DEBUG = process.env.DEBUG;

// CONFIG
export default {
  static_period: '201912',
  dhis2_root_url: process.env.DHIS2_ROOT_URL || "http://dhis2.disarm.io:8080",
  dhis2_headers: {
    Authorization: process.env.DHIS2_AUTH || 'Basic YWRtaW46ZGlzdHJpY3Q='
  },
  disarm_fn_url: process.env.DISARM_FN_URL || 'https://faas.srv.disarm.io/function/fn-prevalence-predictor',
  DEBUG: process.env.DEBUG,
}
