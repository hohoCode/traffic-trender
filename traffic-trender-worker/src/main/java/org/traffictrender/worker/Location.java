package org.traffictrender.worker;

import com.google.common.base.Joiner;


public class Location {
	private String state, county, road, location;

	public String getState() {
		return state;
	}

	public void setState(String state) {
		this.state = state;
	}

	public String getCounty() {
		return county;
	}

	public void setCounty(String county) {
		this.county = county;
	}

	public String getRoad() {
		return road;
	}

	public void setRoad(String road) {
		this.road = road;
	}

	public String getLocation() {
		return location;
	}

	public void setLocation(String location) {
		this.location = location;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((county == null) ? 0 : county.hashCode());
		result = prime * result
				+ ((location == null) ? 0 : location.hashCode());
		result = prime * result + ((road == null) ? 0 : road.hashCode());
		result = prime * result + ((state == null) ? 0 : state.hashCode());
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}
		if (obj == null) {
			return false;
		}
		if (!(obj instanceof Location)) {
			return false;
		}
		Location other = (Location) obj;
		if (county == null) {
			if (other.county != null) {
				return false;
			}
		} else if (!county.equals(other.county)) {
			return false;
		}
		if (location == null) {
			if (other.location != null) {
				return false;
			}
		} else if (!location.equals(other.location)) {
			return false;
		}
		if (road == null) {
			if (other.road != null) {
				return false;
			}
		} else if (!road.equals(other.road)) {
			return false;
		}
		if (state == null) {
			if (other.state != null) {
				return false;
			}
		} else if (!state.equals(other.state)) {
			return false;
		}
		return true;
	}

	public Location(String state, String county, String road, String location) {
		super();
		this.state = state;
		this.county = county;
		this.road = road;
		this.location = location;		
	}
	
	public Location() {
		super();
	}

	public String getQueryString() {
		Joiner joiner = Joiner.on(" and ").skipNulls();
		String state = (this.state != null ? ("state = \'" + this.state + "\'"):null),
				county = (this.county != null ? ("county = \'" + this.county + "\'"):null),
				roadName = (this.getRoad() != null ? ("road_name = \'" + this.getRoad() + "\'"):null);
		if (state == null && county == null && roadName == null){
			System.err.println("The values in the filter list are invalid.");
		}
		return joiner.join(state, county, roadName);
	}
}
