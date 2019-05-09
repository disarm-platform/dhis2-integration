#!/bin/bash
echo "Sending request to DiSARM API for fn-raster-vector-summary-stats"

# Prepare and execute `curl` command
# Sends the `geodata.json` file 
# Write response to `result.json`

# No need to handle errors automatically, just need to not swallow them.

# The response only needs to contain IDs and values. 
# Need to find out if the format of the response keeps those together, or if they're just in an array.
# Determines how we handle the processing in 7a


echo "{\"raster\":\"https://ds-faas.storage.googleapis.com/algo_test_data/general/worldpop/AFR_PPP_2020_adj_v2.tif\",\"stats\": \"sum\", \"subject\": $(cat geodata.json)}" |\
  curl https://faas.srv.disarm.io/function/fn-raster-vector-summary-stats \
    --header 'Content-Type: application/json' \
    --data @- \
    -o result.json