#!/bin/bash
# Create JSON file ready for manual import into DHIS2
# Start with DiSARM result JSON, result.json

echo -e '\033[0;31m!!! TODO: Set correct dataelementid !!!\x1B[0m'

cat data/9.2/result.json | jq '{dataValues: [ .result.features[] | .properties | {
  "dataElement": "<dataelementid>",
  "period": "2018",
  "orgUnit": .id,

  "value": .sum,
  "storedBy": "admin",
  "created": (now | todate),
  "lastUpdated": (now | todate),
  "followUp": false
}]}' > data/9.2/datavalues.json
