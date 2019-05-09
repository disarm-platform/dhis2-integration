#!/bin/bash
# Create JSON file ready for manual import into DHIS2
# Start with DiSARM result JSON, result.json

echo -e '\033[0;31m!!! TODO: Change programid and dataelementid !!!\x1B[0m'
echo -e '\033[0;31m!!! TODO: Check if dataelements is correct top-level !!!\x1B[0m'
echo -e '\033[0;31m!!! TODO: Not sure if dates are correct !!!\x1B[0m'
echo -e '\033[0;31m!!! TODO: Not sure if fine to remove coordinates !!!\x1B[0m'

cat data/9.2/result.json | jq '{dataElements: [ .result.features[] | .properties | {
  "program": "<programid>",
  "orgUnit": .id,
  "eventDate": 2018,
  "status": "COMPLETED",
  "completedDate": 2018,
  "storedBy": "admin",
  "dataValues": [
    { "dataElement": "<dataelementid>", "value": .sum }
  ]
}]}' > data/9.2/dataelements.json
