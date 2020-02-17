
# Packing and deploying  

## Packaging cloud function
1. Run command `npm run build` to build project.
1. Run command `zip -r fn.zip lib/ package.json` to zip code and package.json for deploy on cloud functions.


## Deploying cloud function in google cloud function.
1. Navigate to cloud function in the google cloud console.
1. Select the option `CREATE FUNCTION`.
1. On the name input enter the name `dhis2-integration` for cloud function name.
1. Leave the `Memory allocated` and `Trigger` options as is.
1. Under `Source code` select the the `ZIP upload` option.
1. On the `ZIP file` input, upload the zip folder generated.
1. On the `Stage bucket` input, enter the name of your project bucket.
1. On the `Function to execute` input, enter the name `handler`.
1. Set the following environment variables:
    - `DHIS2_ROOT_URL` to  `http://<dhis2_instance_url>:8080`
    - `DHIS_AUTH` to `Base <base64_string>`
    - `DISARM_FN_URL` to `https://faas.srv.disarm.io/function/<fn_name>`
    - `DEBUG` to `log`
1. Set timeout of atleast `120 seconds`
1. Click the button `CREATE` to deploy the function.

