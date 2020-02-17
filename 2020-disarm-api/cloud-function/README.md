
# Packing and deploying  

## Packaging cloud function
1. Run command `npm run build` to build project.
1. Run command `zip -r fn.zip lib/ package.json` to zip code and package.json for deploy on cloud functions.


## Deploying cloud function in google cloud function.
1. Navigate to Cloud Function in the Google Cloud Console.
1. Select the option `CREATE FUNCTION`.
1. Enter a name for the function
1. Make sure `Trigger` is set to `HTTP`
1. Under `Source code` select the the `ZIP upload` option.
1. On the `ZIP file` input, upload the zip folder generated.
1. On the `Stage bucket` input, enter the name of any Cloud Storage bucket you can write to.
1. On the `Function to execute` input, enter the name `handler`.
1. Set the following environment variables:
    - `DHIS2_ROOT_URL` to  `http://<dhis2_instance_url>:8080`
    - `DHIS_AUTH` to `Base <base64_string>`
    - `DISARM_FN_URL` to `https://faas.srv.disarm.io/function/<fn_name>`
    - `DEBUG` to `log`
1. Set timeout of atleast `120 seconds`
1. Click the button `CREATE` to deploy the function.
1. Copy the trigger URL and edit the DHIS2 app to point to it.

