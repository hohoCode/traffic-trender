package org.traffictrender.worker;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.codehaus.jackson.map.ObjectMapper;

@SuppressWarnings("serial")
public class TrafficTrenderWorker extends HttpServlet{
	@SuppressWarnings("unchecked")
	public void doGet(final HttpServletRequest request, final HttpServletResponse response) throws ServletException, IOException {
		
		// Initialize inputs/outputs
		PrintWriter out = response.getWriter();
		Map<String, String[]> map = request.getParameterMap();
		
		// type
		String type = request.getParameter("type");
		assert(StringUtils.isNotBlank(type));
		type = type.toLowerCase();
		
		// Jackson magic
		ObjectMapper mapper = new ObjectMapper();
		Map<String, Object> marshalledMap = null;
		
		if (type.equals("treemap")) {
			
			String size = map.get("size")[0], color = map.get("color")[0];
			assert(StringUtils.isNotBlank(size));
			assert(StringUtils.isNotBlank(color));
			Map<MeasurementType, Map<Location, Object>> result = getTreemapRequest(map);
			marshalledMap = marshallTreemapResult(result, MeasurementType.valueOf(size), MeasurementType.valueOf(color));
			
		} else if (type.equals("linechart")) {
			
			String y = map.get("y")[0];
			assert(StringUtils.isNotBlank(y));
			Map<String,Map<Integer, Map<Integer, Object>>> result = getLinechartRequest(map);
			marshalledMap = marshallLinechartResult(result, MeasurementType.valueOf(y));
			
		}
		
		mapper.writeValue(out, marshalledMap);
		
		out.flush();
		out.close();
	}
	
	public static Map<MeasurementType, Map<Location, Object>> dummyTreemap() {
		Map<MeasurementType, Map<Location, Object>> result = new HashMap<MeasurementType, Map<Location, Object>>();
		Map<Location, Object> iF = new HashMap<Location, Object>();
		result.put(MeasurementType.impactFactor, iF);
		return result;
	}
	
	public static Map<String,Map<Integer, Map<Integer, Object>>> dummyLinechart() {
		Map<String, Map<Integer, Map<Integer, Object>>> result = new HashMap<String, Map<Integer, Map<Integer, Object>>>();
		Map<Integer,Map<Integer, Object>> loc1 = new HashMap<Integer, Map<Integer, Object>>();
		result.put("Location_1", loc1);
		Map<Integer, Object> loc1MonthMap = new HashMap<Integer, Object>();
		
		loc1MonthMap.put(1, Double.valueOf(40.34));
		loc1MonthMap.put(2, Double.valueOf(80.34));
		loc1MonthMap.put(3, Double.valueOf(60.34));
		loc1MonthMap.put(4, Double.valueOf(180.34));
		loc1MonthMap.put(6, Double.valueOf(100.34));
		loc1.put(2010, loc1MonthMap);
		
		Map<Integer,Map<Integer, Object>> loc2 = new HashMap<Integer, Map<Integer, Object>>();
		result.put("Location_2", loc2);
		Map<Integer, Object> loc2MonthMap = new HashMap<Integer, Object>();
		loc2MonthMap.put(1, Double.valueOf(10.34));
		loc2MonthMap.put(2, Double.valueOf(15.34));
		loc2MonthMap.put(3, Double.valueOf(12.34));
		loc2.put(2010, loc2MonthMap);
		
		return result;
	}
	
	public static Map<MeasurementType, Map<Location, Object>> getTreemapRequest(final Map<String, String[]> paramMap) {
		MeasurementType size = MeasurementType.valueOf(paramMap.get("size")[0]);
		MeasurementType color = MeasurementType.valueOf(paramMap.get("color")[0]);
		
		List<Location> filterLocations = new ArrayList<Location>();
		String[] locs = paramMap.get("filtermenu");
		assert(locs != null);
		
		for (String loc : locs) {
			filterLocations.add(stringToLocation(loc));
		}

		return TreeMap.generatorResults(filterLocations, size, color);
	}

	
	public static Map<String,Map<Integer, Map<Integer, Object>>> getLinechartRequest(final Map<String, String[]> paramMap) {
		MeasurementType y = MeasurementType.valueOf(paramMap.get("y")[0]);
		Location zoomLevel = stringToLocation(paramMap.get("zoomlevel")[0]);
		
		List<Location> filterLocations = new ArrayList<Location>();
		String[] locs = paramMap.get("filtermenu");
		assert(locs != null);
		
		for (String loc : locs) {
			filterLocations.add(stringToLocation(loc));
		}

		return LineChart.generatorResults(zoomLevel, filterLocations, y);
	}
	
	// TODO get rid of twice mapping
	public static Map<String, Object> marshallTreemapResult(final Map<MeasurementType, Map<Location, Object>> resultMap, final MeasurementType size, final MeasurementType color) {
		Map<String, Object> result = new HashMap<String, Object>();
		result.put("name", "States");
		
		Map<Location, Object> sizeMap = resultMap.get(size);
		Map<Location, Object> colorMap = resultMap.get(color);
		Map<String, Map<String, Map<String, Map<String, Object>>>> tempResult = new HashMap<String, Map<String, Map<String, Map<String, Object>>>>();
		
		for (Location l : sizeMap.keySet()) {
			Map<String, Map<String, Map<String, Object>>> stateMap = tempResult.get(l.getState());
			if (stateMap == null) {
				stateMap = new HashMap<String, Map<String, Map<String, Object>>>();
				tempResult.put(l.getState(), stateMap);
			}
			
			Map<String, Map<String, Object>> countyMap = stateMap.get(l.getCounty());
			if (countyMap == null) {
				countyMap = new HashMap<String, Map<String, Object>>();
				stateMap.put(l.getCounty(), countyMap);
			}
			
			Map<String, Object> locationMap = countyMap.get(l.getLocation());
			if (locationMap == null) {
				locationMap = new HashMap<String, Object>();
				countyMap.put(l.getLocation(), locationMap);
			}
			
			locationMap.put("size", sizeMap.get(l));
		}
		
		for (Location l : colorMap.keySet()) {
			Map<String, Map<String, Map<String, Object>>> stateMap = tempResult.get(l.getState());
			Map<String, Map<String, Object>> countyMap = stateMap.get(l.getCounty());
			Map<String, Object> locationMap = countyMap.get(l.getLocation());
			
			locationMap.put("color", colorMap.get(l));
		}
		
		List<Map<String, Object>> statesChildren = new ArrayList<Map<String, Object>>();
		result.put("children", statesChildren);
		for (String state : tempResult.keySet()) {
			Map<String, Object> stateMap = new HashMap<String, Object>();
			statesChildren.add(stateMap);
			
			stateMap.put("name", state);
			List<Map<String,Object>> countiesChildren = new ArrayList<Map<String, Object>>();
			stateMap.put("children", countiesChildren);
			for (String county : tempResult.get(state).keySet()) {
				Map<String, Object> countyMap = new HashMap<String, Object>();
				countiesChildren.add(countyMap);
				
				countyMap.put("name", county);
				List<Map<String,Object>> locationsChildren = new ArrayList<Map<String, Object>>();
				countyMap.put("children", locationsChildren);
				for (String location : tempResult.get(state).get(county).keySet()) {
					Map<String, Object> locationMap = new HashMap<String, Object>();
					locationsChildren.add(locationMap);
					
					locationMap.put("name", location);
					locationMap.putAll(tempResult.get(state).get(county).get(location));
				}
			}
		}
		
		return result;
	}
	
	public static Map<String, Object> marshallLinechartResult(final Map<String, Map<Integer, Map<Integer, Object>>> resultMap, final MeasurementType y) {
		Map<String, Object> result = new HashMap<String, Object>();
		result.put("type", y.toString());
		List<Map<String, Object>> locations = new ArrayList<Map<String, Object>>();
		result.put("locations", locations);
		
		for (String l : resultMap.keySet()) {
			Map<String, Object> loc = new HashMap<String, Object>();
			locations.add(loc);
			loc.put("name", l);
			List<Map<String, Object>> locBottlenecks = new ArrayList<Map<String, Object>>();
			loc.put("bottlenecks", locBottlenecks);
			for (Integer year : resultMap.get(l).keySet())
				for (Integer month : resultMap.get(l).get(year).keySet()) {
					Map<String, Object> entry = new HashMap<String, Object>();
					Object value = resultMap.get(l).get(year).get(month);
					String date = String.format("%4d-%02d", year, month);
					entry.put("date", date);
					entry.put("value", value);
					locBottlenecks.add(entry);
				}
		}
		
		return result;
	}
	
	public static Location stringToLocation(final String loc) {
		if (loc == null)
			return new Location();
		String[] arr = loc.split("@");
		if (arr.length == 3)
			return new Location(arr[0], arr[1], arr[2]);
		else if (arr.length == 2)
			return new Location(arr[0], arr[1], null);
		else if (arr.length == 1)
			return new Location(arr[0], null, null);
		else
			return new Location();
	}
}
