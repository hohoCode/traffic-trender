create table if not exists bottlenecks (
  year int,
  month int,
  location varchar(255),
  direction varchar(255),
  latitude double(10,7),
  longitude double(10,7),
  average_duration time,
  average_max_length double(10,8),
  occurrences int,
  impact_factor int,
  state varchar(2),
  county varchar(255),
  road_class varchar(255),
  road_name varchar(255)
);
