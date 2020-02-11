# Setting up a new DHIS2 instance

1. Navigate to system settings and set cache to zero.

## Organization units creation.
1. Create top level Organisation unit - Eswatini, and set its level to 2.
1. Run script `1_create_orgUnits.js` to create orgUnits.
1. Navigate back to the GUI under OrgUnits ad delete the orgUnit facility_100.


## Data elements.
1. Create the following data elements `n_trial`, `n_positive`, `prevelance_prediction`  .
1. Create a data set called `data_set` and set the properties:
    1. `Days after period to qualify for timely submission` to `1`:
    1. `Period  type` to `Yearly`.
1. Create a data element group named `data_element_group`.
1. Run script `2_create_initial_data.js` to create the initial data.

## Dashboard.
1. Create a pivot table, chart and map and add them to the dashboard.
1. Run the script `3_simulate_run_function.js` to send data to DISARM API and populate DHIS2 with returned data.
