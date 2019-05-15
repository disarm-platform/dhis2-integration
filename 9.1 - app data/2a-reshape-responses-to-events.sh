#!/bin/bash
# Reshape the exported CSV data into the DHIS2 import format (e.g. like sample-3.json in Twist)

# Start with records.csv file

cat data/9.1/records.csv | csvjson | jq '{events: [ .[] | {
  "program": "RuGS1IGoh2W",
  "orgUnit": ."location.selection.id",
  "eventDate": .recorded_on[0:23],
  "coordinate": {
    "latitude": ."location.coords.latitude",
    "longitude": ."location.coords.longitude"
  },
  "dataValues": [
    { 
      "dataElement": "ZjqhC7hueSJ", "value": ."form_data.sprayed_count" 
    }
  ]
}]}' > data/9.1/events.json
   