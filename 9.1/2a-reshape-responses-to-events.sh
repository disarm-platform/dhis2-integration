#!/bin/bash
# Reshape the exported CSV data into the DHIS2 import format (e.g. like sample-3.json in Twist)

# Start with records.csv file

cat records.csv | csvjson | jq '[ .[] | {
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
