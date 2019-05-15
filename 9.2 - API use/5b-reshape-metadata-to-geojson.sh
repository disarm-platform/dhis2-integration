#!/bin/bash
# Is a weird format. Needs to be passed to DiSARM as a GeoJSON FeatureCollection. Hello turf.js?

# Start with `metajson.json`
cat data/9.2/metadata.json |
  jq \
    '{type: "FeatureCollection", features: [.organisationUnits[] |
    {"type": "Feature", "properties": {"id": .id},
    "geometry": {"type": "Polygon","coordinates": 
    (.coordinates | sub("^\\["; "") | sub("\\]$"; "") | fromjson)  }} ]}' > data/9.2/geodata.json
