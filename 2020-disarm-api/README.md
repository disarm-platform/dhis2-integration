## Getting DHIS2 running

What worked for us: use the Docker instances, with the `docker-compose.yml`.

See [Running DHIS2 locally](#Running-DHIS2-locally) for our notes on running a local DHIS2-Live instance.


## Configure DHIS2 instance

1. Navigate to system settings and set analytics cache to zero. **MOST IMPORTANT BEFORE ANYTHING ELSE!!**

### Organization units creation.
1. Create top level Organisation unit - _Eswatini_, and set its level to 1.
1. Run script `1_create_orgUnits.js` to create orgUnits.
1. Navigate back to the GUI under OrgUnits and delete the orgUnit Village_100.


### Data elements.
1. Create the following data elements `n_trial`, `n_positive`, `prevelance_prediction` . Each must have _Record zero values_ checked.
1. Create a data set called `data_set` and set the properties:
    1. `Days after period to qualify for timely submission` to `1`:
    1. `Period  type` to `Yearly`.
1. Create a data element group named `data_element_group`.
1. Run script `2_create_initial_data.js` to create the initial data.

### Dashboard.
1. Create a pivot table, chart and map and add them to the dashboard.
1. Run the script `3_simulate_run_function.js` to send data to DISARM API and populate DHIS2 with returned data.


## COnfiguring as a Cloud Function

Instructions for deploying as a Google Cloud Function.

- respond to HTTP trigger
- use Node10 as runtime 
- point to `handler` as the function to invoke

## Live function outline

1. Get array of all orgUnit ids
1. Request dataElements: `http ':8080/api/dataValueSets.json?dataSet=CNM7hjjV4Dg&period=20200201&orgUnit=b9KzF3yT6vF&orgUnit=pLgoeZTqSAc&orgUnit=VcAEdFIy823&orgUnit=MFfuE2fPk31' -a admin:district` (insert orgUnit ids)
1. Map out the values: `data.dataValues.map(i => {return {[i.dataElement]: parseFloat(i.value), orgUnit: i.orgUnit}})`
1. Convert each value from a dataElement id to a dataElement name (using lookup function): e.g `Qrt....` --> `n_positive`
1. Attach each converted value onto the related orgUnit
1. Done


## Env variables

- `DHIS2_ROOT_URL`: defaults to `http://dhis2.disarm.io:8080`
- `DHIS_AUTH`: base64-encoded `Basic <user:password>`
- `DISARM_FN_URL`: defaults to DiSARM API `fn-prevalence-prediction-mgcv` function
- `DEBUG`: defaults to nothing, options are 'file' or 'log'


## Reset the data

`DHIS2_ROOT_URL=http://dhis2.disarm.io:8080 DEBUG=file node 2_create_initial_data.js`


## DHIS2-app

1. From the `src` folder, run : `zip -r ../app.zip index.html manifest.webapp assets/*`
2. Upload the created ZIP file into the DHIS2 App management.


## Running DHIS2-Live locally

It seems that DHIS2 requires version 8 of Java (docs say “current version”, but it’s currently 13).

There’s a way to install Java JDK 8 using homebrew: `brew cask install adoptopenjdk8`.

Assuming you’ve got the following:

•	Postgres installed,
•	a database and user configured,
•	the `dhis.conf` edited to match the Postgres settings

You should be able to start with the magic command: 
```
JAVA_HOME=/Library/Java/JavaVirtualMachines/adoptopenjdk-8.jdk/Contents/Home java -jar dhis2-live.jar
```
