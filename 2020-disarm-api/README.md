## Preparation (could be pre-OpenFn)

1. Download metadata: `http ':8080/api/metadata.json?assumeTrue=false&dataElements=true&organisationUnits=true' -a admin:district`
2. Create GeoJSON of orgUnits with properties including the `id` and `name`
3. Create a lookup function between dataElements `id` and `name`


## Live function (prob inside OpenFn)

1. Get array of all orgUnit ids
1. Request dataElements: `http ':8080/api/dataValueSets.json?dataSet=CNM7hjjV4Dg&period=20200201&orgUnit=b9KzF3yT6vF&orgUnit=pLgoeZTqSAc&orgUnit=VcAEdFIy823&orgUnit=MFfuE2fPk31' -a admin:district` (insert orgUnit ids)
1. Map out the values: `data.dataValues.map(i => {return {[i.dataElement]: parseFloat(i.value), orgUnit: i.orgUnit}})`
1. Convert each value from a dataElement id to a dataElement name (using lookup function): e.g `Qrt....` --> `n_positive`
1. Attach each converted value onto the related orgUnit
1. Done


## Env variables

- `DHIS2_ROOT_URL`: defaults to `https://ppls.ngrok.io`
- `DHIS_AUTH`: base64-encoded `Basic <user:password>`
- `DISARM_FN_URL`: defaults to DiSARM API `fn-prev-pred` function
- `DEBUG`: defaults to nothing, options are 'file' or 'log'


## Reset the data

`DHIS2_ROOT_URL=http://dhis2.disarm.io:8080 DEBUG=file node 2_create_initial_data.js`


## DHIS2-app

1. From the `src` folder, run : `zip -r ../app.zip index.html manifest.webapp assets/*`
2. Upload the created ZIP file into the DHIS2 App management.