package org.traffictrender.worker;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

public class TreeMap {

    private static String selectionClauseIF = "SELECT state, county, location, sum(impact_factor)/count(*) as output FROM ";
    private static String selectionClauseDuration = "SELECT state, county, location, sum(time_to_sec(average_duration)*occurrences)/sum(occurrences) as output FROM ";
    private static String selectionClauseLength = "SELECT state, county, location, sum(average_max_length*occurrences)/sum(occurrences) as output FROM ";

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
	    m1 = dbRetriveal(filter, selectionClauseIF + db.getClause() + " where ", db);
	} else if (threeGuy == MeasurementType.duration) {
	    m1 = dbRetriveal(filter, selectionClauseLength + db.getClause() + " where ", db);
	} else if (threeGuy == MeasurementType.length) {
	    m1 = dbRetriveal(filter, selectionClauseDuration + db.getClause() + " where ", db);
	} else {
	    System.err.println("The MeasurementType is invalid!");
	    return null;
	}

	return m1;
    }

    private static Map<Location, Object> dbRetriveal(List<Location> filter, String selectionClause, MysqlConnect db) {
	Map<Location, Object> m1 = null; //new HashMap<Location, Object>();
	if (filter == null){
	    System.err.println("The filter list is empty");
	    return null;
	}

	///Get all items in the filtered list
	for (Location filteredLocation : filter) {
	    if (filteredLocation.getLocation() != null 
		    && filteredLocation.getState() != null 
		    && filteredLocation.getCounty() != null ){
		String query = selectionClause;
		query += " (road_name = \'" + filteredLocation.getLocation() + "\' "
			+ "and state = \'" + filteredLocation.getState()+"\' "
			+ "and county = \'" + filteredLocation.getCounty()+"\') ";
		query += " group by location";
		System.err.println("SQL: " + query);
		m1 = dbWorker(query, db);
		//m1.put(filteredLocation, dbWorker(query, db));
	    } else if (filteredLocation.getLocation() == null 
		    && filteredLocation.getState() != null 
		    && filteredLocation.getCounty() != null ){
		String query = selectionClause;
		query +=  " ( state = \'" + filteredLocation.getState()+"\' "
			+ "and county = \'" + filteredLocation.getCounty()+"\') ";
		query += " group by location";
		System.err.println("SQL: " + query);
		m1 = dbWorker(query, db);
		//m1.put(filteredLocation, dbWorker(query, db));
	    } else if (filteredLocation.getLocation() == null 
		    && filteredLocation.getState() != null 
		    && filteredLocation.getCounty() == null ){
		String query = selectionClause;
		query +=  " ( state = \'" + filteredLocation.getState()+"\')";
		query += " group by location";
		System.err.println("SQL: " + query);
		m1 = dbWorker(query, db);
		//m1.put(filteredLocation, dbWorker(query, db));
	    } else {
		System.err.println("The values in the filter list are invalid.");
		//m1.put(filteredLocation, -1);
	    }
	}	
	return m1; 
    }

    private static Map<Location, Object> dbWorker(String query, MysqlConnect db) {
	Map<Location, Object> m1 = new HashMap<Location, Object>();
	
	try {
	    ResultSet topTwenty = db.runSQL(query);
	    while (topTwenty.next()) {
		double output = topTwenty.getDouble("output");
		String locaString = topTwenty.getString("location");
		String stateString = topTwenty.getString("state");
		String countyString = topTwenty.getString("county");
		//System.out.println("Results: " + output+ " loca:"+locaString+ " state: "+stateString + " cou:"+countyString);		
		m1.put(new Location(stateString, countyString, locaString), output);
	    }
	} catch (SQLException e) {
	    System.err.println("Database Retrieval Failed");		    
	    e.printStackTrace();
	    return null;
	}

	return m1;
    }

    /*public static void main(String[] args) {
	List<Location> inputFilter = new LinkedList<Location>(); //Input Argument
	inputFilter.add(new Location("SC", null, null));
	//inputFilter.add(new Location("SC", "GREENVILLE", "I-185"));
	//inputFilter.add(new Location("SC", "GREENVILLE", "I-385 @ SC-49/Exit 5"));
	//inputFilter.add(new Location("SC", "GREENVILLE", null));
	//inputFilter.add(new Location("VA", "FAIRFAX", null));
	//inputFilter.add(new Location("NC", "WAKE", null));
	TreeMap.generatorResults(inputFilter, MeasurementType.impactFactor, MeasurementType.duration);
    }*/
}