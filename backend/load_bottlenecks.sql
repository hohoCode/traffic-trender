load data infile '/Users/chris/School/UMCP/CMSC734 - F12/term_project/traffic-trender/backend/sources/aggregated_bottlenecks_2010-2011_NC_SC_VA_MD_prepared.csv' into table bottlenecks 
  fields terminated by ','
  lines terminated by '\r\n'
  ignore 1 lines;
