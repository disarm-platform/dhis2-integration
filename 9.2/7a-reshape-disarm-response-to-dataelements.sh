#!/bin/bash
# Create JSON file ready for manual import into DHIS2
# Start with DiSARM result JSON, result.json

echo -e '\033[0;31m!!! This will break - it is just copied from another file as a placeholder !!!\x1B[0m'

cat result.json | jq '[ .[] | {
  "program": "programid",
  "orgUnit": ."location.selection.id",
  "eventDate": .recorded_on,
  "status": "COMPLETED",
  "completedDate": .recorded_on,
  "storedBy": "admin",
  "coordinate": {
    "latitude": ."location.coords.latitude",
    "longitude": ."location.coords.longitude"
  },
  "dataValues": [
    { "dataElement": "dataelementid", "value": ."form_data.sprayed_count" }
  ]
}]'
