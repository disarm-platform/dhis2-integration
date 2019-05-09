- Works using a DHIS2-Live instance, running v 2.29.
- Included in the repo is a SQL dump at some stage of usefulness/completeness (see `disarm-dhis2-gis-2.sql.zip`)

Needs to have at least the following config, for each stage. 

If we do both 9.1 and 9.2 together, then 9.1 can benefit from maps on the dashboard, etc.

for 9.1:
- orgunits w/ hierarchy
- dataelements etc for `sprayed_count`
- program etc
- users (incl a user who can see all orgunits)
- chart + table for `sprayed_count`

for 9.2:
- orgunits w/ hierarchy (incl. GIS)
- dataelement for `worldpop` or other denominator
- indicator for coverage, etc