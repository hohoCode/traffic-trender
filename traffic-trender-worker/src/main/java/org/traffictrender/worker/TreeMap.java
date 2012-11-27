package org.traffictrender.worker;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class TreeMap {

	private static String selectionClauseIF = "SELECT state, county, road_name, location, sum(impact_factor)/count(*) as output FROM ";
	private static String selectionClauseDuration = "SELECT state, county, road_name, location, sum(time_to_sec(average_duration)*occurrences)/sum(occurrences) as output FROM ";
	private static String selectionClauseLength = "SELECT state, county, road_name, location, sum(average_max_length*occurrences)/sum(occurrences) as output FROM ";

	public static Map<MeasurementType, Map<Location, Object>> generatorResults(List<Location> filter, MeasurementType first, MeasurementType second){
		Map<MeasurementType, Map<Location, Object>> outputMap = new HashMap<MeasurementType, Map<Location, Object>>();
		///Connect DB
		MysqlConnect db = new MysqlConnect();
		if (!db.dbConnect()){
			System.err.println("Not Connected!");
			return null;
		}
		outputMap.put(first, valueSelection(filter, first, db));
		outputMap.put(second, valueSelection(filter, second, db));
		return outputMap;
	}

	private static Map<Location, Object> valueSelection(List<Location> filter, MeasurementType threeGuy, MysqlConnect db) {
		Map<Location, Object> m1 = null;

		if (threeGuy == MeasurementType.impactFactor) {
			m1 = dbRetrieval(filter, selectionClauseIF + db.getClause() + " where ", db);
		} else if (threeGuy == MeasurementType.duration) {
			m1 = dbRetrieval(filter, selectionClauseDuration + db.getClause() + " where ", db);
		} else if (threeGuy == MeasurementType.length) {
			m1 = dbRetrieval(filter, selectionClauseLength + db.getClause() + " where ", db);
		} else {
			System.err.println("The MeasurementType is invalid!");
			return null;
		}

		return m1;
	}

	private static Map<Location, Object> dbRetrieval(List<Location> filter, String selectionClause, MysqlConnect db) {
		Map<Location, Object> m1 = null;
		if (filter == null || filter.isEmpty()){
			System.err.println("The filter list is empty");
			return null;
		}

		///Get all items in the filtered list
		for (Location filteredLocation : filter) {
			String query = selectionClause + "(" + filteredLocation.getQueryString() + ") group by location";
			if (m1 == null) {
				m1 = dbWorker(query, db);
			} else {
				m1.putAll(dbWorker(query, db));
			}
		}	
		return m1; 
	}

	private static Map<Location, Object> dbWorker(String query, MysqlConnect db) {
		Map<Location, Object> m1 = new HashMap<Location, Object>();

		try {
			ResultSet result = db.runSQL(query);
			while (result.next()) {
				double output = result.getDouble("output");
				String roadString = result.getString("road_name");
				String locaString = result.getString("location");
				String stateString = result.getString("state");
				String countyString = result.getString("county");
				//System.out.println("Results: " + output+ " loca:"+locaString+ " state: "+stateString + " cou:"+countyString);		
				m1.put(new Location(stateString, countyString, roadString, locaString), output);
			}
		} catch (SQLException e) {
			System.err.println("Database Retrieval Failed");		    
			e.printStackTrace();
			return null;
		}

		return m1;
	}

}
