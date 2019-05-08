#!/bin/bash
# Reshape the exported CSV data into the DHIS2 import format (e.g. like sample-3.json in Twist)

# Optionally use #!/bin/node # or something, so it can be run direct as a script

head records.csv | csvjson | jq '[ .[] | {
  "program": ._id,
  "orgUnit": ."location.selection.id",
  "eventDate": "2018-05-17",
  "status": "COMPLETED",
  "completedDate": "2018-05-18",
  "storedBy": "admin",
  "coordinate": {
    "latitude": 59.8,
    "longitude": 10.9
  },
  "dataValues": [
    { "dataElement": "fkkQRHF6UrW", "value": "22" }
  ]
}]'