## Package and deploy

- `npm run build`
- `zip -r fn.zip lib/ package.json`
- Upload and deploy to Google Cloud Function:
  - configure the envVars on the way if you want
  - set timeout to be a few minutes
  - add `DEBUG`: `log` to get it to print file contents into the logs

