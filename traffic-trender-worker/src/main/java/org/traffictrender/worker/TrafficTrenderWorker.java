package org.traffictrender.worker;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Arrays;
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

	private static Map<ServletCacheKey, Map<String, Object>> treemapCache;
	private static Map<ServletCacheKey, Map<String, Object>> linechartCache;
	/*
	private static Map<ServletCacheKey, Map<String, Object>> detailCache;
	 */

	static {
		treemapCache = new HashMap<ServletCacheKey, Map<String, Object>>();
		linechartCache = new HashMap<ServletCacheKey, Map<String, Object>>();
		/*
		detailCache = new HashMap<ServletCacheKey, Map<String, Object>>();
		 */
	}

	@SuppressWarnings("unchecked")
	public void doGet(final HttpServletRequest request, final HttpServletResponse response) throws ServletException, IOException {

		// Initialize inputs/outputs
		response.addHeader("Access-Control-Allow-Origin", "*");
		PrintWriter out = response.getWriter();
		Map<String, String[]> map = request.getParameterMap();

		// type
		String type = request.getParameter("type");
		if (StringUtils.isBlank(type))
			throw new ServletException("type must be specified");
		type = type.toLowerCase();

		// Jackson magic
		ObjectMapper mapper = new ObjectMapper();
		Map<String, Object> marshalledMap = null;

		ServletCacheKey key = new ServletCacheKey(map);

		if (type.equals("treemap")) {

			if (treemapCache.containsKey(key)) {
				marshalledMap = treemapCache.get(key);
			} else {
				String size = map.get("size")[0], color = map.get("color")[0];
				if (StringUtils.isBlank(size))
					throw new ServletException("size must be specified for treemap");
				if (StringUtils.isBlank(color))
					throw new ServletException("color must be specified for treemap");
				Map<MeasurementType, Map<Location, Object>> result = getTreemapRequest(map);
				marshalledMap = marshallTreemapResult(result, MeasurementType.valueOf(size), MeasurementType.valueOf(color));
				if (marshalledMap != null && marshalledMap.isEmpty())
					treemapCache.put(key, marshalledMap);
			}
		} else if (type.equals("linechart")) {

			if (linechartCache.containsKey(key)) {
				marshalledMap = linechartCache.get(key);
			} else {
				String y = map.get("y")[0];
				if (StringUtils.isBlank(y))
					throw new ServletException("y must be specified for linechart");
				Map<String,Map<Integer, Map<Integer, Object>>> result = getLinechartRequest(map);
				marshalledMap = marshallLinechartResult(result, MeasurementType.valueOf(y));
				if (marshalledMap != null && marshalledMap.isEmpty())
					linechartCache.put(key, marshalledMap);
			}
		} /* else if (type.equals("detail")) {
			// TODO adding cache
			Map<Location, Map<String, Object>> result = getDetailsRequest(map);
			marshalledMap = marshallDetailsResult(result);

		} */

		mapper.writeValue(out, marshalledMap);

		out.flush();
		out.close();
	}

	public void doPost(final HttpServletRequest request, final HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}
	/*
	private static Map<Location, Map<String, Object>> getDetailsRequest(final Map<String, String[]> paramMap) {

		List<Location> filterLocations = new ArrayList<Location>();
		String[] locs = paramMap.get("fm");

		return OnDemand.generatorResults(filterLocations);
	}
	 */

	private static Map<MeasurementType, Map<Location, Object>> getTreemapRequest(final Map<String, String[]> paramMap) {
		MeasurementType size = MeasurementType.valueOf(paramMap.get("size")[0]);
		MeasurementType color = MeasurementType.valueOf(paramMap.get("color")[0]);

		List<Location> filterLocations = new ArrayList<Location>();
		String[] locs = paramMap.get("fm");

		if (locs != null && locs.length != 0)
			for (String loc : locs) {
				filterLocations.add(stringToLocation(loc));
			}

		return TreeMap.generatorResults(filterLocations, size, color);
	}


	private static Map<String,Map<Integer, Map<Integer, Object>>> getLinechartRequest(final Map<String, String[]> paramMap) {
		MeasurementType y = MeasurementType.valueOf(paramMap.get("y")[0]);
		Location zoomLevel = stringToLocation(paramMap.get("zoomlevel")[0]);
		boolean aggregated = false; 
		String[] aggre = paramMap.get("aggregated");
		if (aggre != null && aggre.length > 0 && aggre[0].toLowerCase().equals("true"))
			aggregated = true;

		List<Location> filterLocations = new ArrayList<Location>();
		String[] locs = paramMap.get("fm");

		if (locs != null && locs.length != 0)
			for (String loc : locs) {
				filterLocations.add(stringToLocation(loc));
			}

		return LineChart.generatorResults(zoomLevel, filterLocations, y, aggregated);
	}

	/*
	private static Map<String, Object> marshallDetailsResult(
			final Map<Location, Map<String, Object>> result) {
		// TODO Auto-generated method stub
		return null;
	}
	 */

	// TODO get rid of twice mapping
	private static Map<String, Object> marshallTreemapResult(final Map<MeasurementType, Map<Location, Object>> resultMap, final MeasurementType size, final MeasurementType color) {
		Map<String, Object> result = new HashMap<String, Object>();
		result.put("name", "States");

		Map<Location, Object> sizeMap = resultMap.get(size);
		Map<Location, Object> colorMap = resultMap.get(color);
		Map<String, Map<String, Map<String, Map<String, Map<String, Object>>>>> tempResult = new HashMap<String, Map<String, Map<String, Map<String, Map<String, Object>>>>>();

		for (Location l : sizeMap.keySet()) {
			Map<String, Map<String, Map<String, Map<String, Object>>>> stateMap = tempResult.get(l.getState());
			if (stateMap == null) {
				stateMap = new HashMap<String, Map<String, Map<String, Map<String, Object>>>>();
				tempResult.put(l.getState(), stateMap);
			}

			Map<String, Map<String, Map<String, Object>>> countyMap = stateMap.get(l.getCounty());
			if (countyMap == null) {
				countyMap = new HashMap<String, Map<String, Map<String, Object>>>();
				stateMap.put(l.getCounty(), countyMap);
			}

			Map<String, Map<String, Object>> roadMap = countyMap.get(l.getRoad());
			if (roadMap == null) {
				roadMap = new HashMap<String, Map<String, Object>>();
				countyMap.put(l.getRoad(), roadMap);
			}

			Map<String, Object> locationMap = roadMap.get(l.getLocation());
			if (locationMap == null) {
				locationMap = new HashMap<String, Object>();
				roadMap.put(l.getLocation(), locationMap);
			}

			locationMap.put("size", sizeMap.get(l));
		}

		for (Location l : colorMap.keySet()) {
			Map<String, Map<String, Map<String, Map<String, Object>>>> stateMap = tempResult.get(l.getState());
			Map<String, Map<String, Map<String, Object>>> countyMap = stateMap.get(l.getCounty());
			Map<String, Map<String, Object>> roadMap = countyMap.get(l.getRoad());
			Map<String, Object> locationMap = roadMap.get(l.getLocation());

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
				List<Map<String,Object>> roadsChildren = new ArrayList<Map<String, Object>>();
				countyMap.put("children", roadsChildren);
				for (String road : tempResult.get(state).get(county).keySet()) {
					Map<String, Object> roadMap = new HashMap<String, Object>();
					roadsChildren.add(roadMap);

					roadMap.put("name", road);
					List<Map<String,Object>> locationsChildren = new ArrayList<Map<String, Object>>();
					roadMap.put("children", locationsChildren);
					for (String location : tempResult.get(state).get(county).get(road).keySet()) {
						Map<String, Object> locationMap = new HashMap<String, Object>();
						locationsChildren.add(locationMap);

						locationMap.put("name", location);
						locationMap.putAll(tempResult.get(state).get(county).get(road).get(location));
					}
				}
			}
		}

		return result;
	}

	private static Map<String, Object> marshallLinechartResult(final Map<String, Map<Integer, Map<Integer, Object>>> resultMap, final MeasurementType y) {
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
					locBottlenecks.add(entry);
					Object value = resultMap.get(l).get(year).get(month);
					String date = String.format("%04d-%02d", year, month);
					entry.put("date", date);
					entry.put("value", value);
				}
		}

		return result;
	}

	private static Location stringToLocation(final String loc) {
		if (loc == null || loc.isEmpty() || loc.toLowerCase().equals("states"))
			return new Location();
		String[] arr = loc.split("@");
		if (arr.length == 4)
			return new Location(arr[0], arr[1], arr[2].trim(), StringUtils.join(Arrays.asList(arr[2], arr[3]), "@"));
		else if (arr.length == 3)
			return new Location(arr[0], arr[1], arr[2], null);
		else if (arr.length == 2)
			return new Location(arr[0], arr[1], null, null);
		else if (arr.length == 1)
			return new Location(arr[0], null, null, null);
		else
			return new Location();
	}
}
