echo "Sending request to DiSARM API for fn-raster-vector-summary-stats"

# Prepare and execute `curl` command
# Write response to e.g. `result.json`
# No need to handle errors automatically, just need to not swallow them.

# The response only needs to contain IDs and values. 
# Need to find out if the format of the response keeps those together, or if they're just in an array.
# Determines how we handle the processing in 7a