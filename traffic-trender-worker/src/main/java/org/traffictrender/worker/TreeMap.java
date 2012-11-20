package org.traffictrender.worker;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

public class TreeMap {

    private static String selectionClauseIF = "SELECT sum(impact_factor)/count(*) as output FROM traffic.bottlenecks where ";
    private static String selectionClauseDuration = "SELECT sum(time_to_sec(average_duration)*occurrences)/sum(occurrences) as output FROM traffic.bottlenecks where ";
    private static String selectionClauseLength = "SELECT sum(average_max_length*occurrences)/sum(occurrences) as output FROM traffic.bottlenecks where ";

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
	    m1 = dbRetriveal(filter, selectionClauseIF, db);
	} else if (threeGuy == MeasurementType.duration) {
	    m1 = dbRetriveal(filter, selectionClauseLength, db);
	} else if (threeGuy == MeasurementType.length) {
	    m1 = dbRetriveal(filter, selectionClauseDuration, db);
	} else {
	    System.err.println("The MeasurementType is invalid!");
	    return null;
	}

	return m1;
    }

    private static Map<Location, Object> dbRetriveal(List<Location> filter, String selectionClause, MysqlConnect db) {
	Map<Location, Object> m1 = new HashMap<Location, Object>();
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
		query += " (location = \'" + filteredLocation.getLocation() + "\' "
			+ "and state = \'" + filteredLocation.getState()+"\' "
			+ "and county = \'" + filteredLocation.getCounty()+"\') ";
		System.err.println("SQL: " + query);
		m1.put(filteredLocation, dbWorker(query, db));		
	    } else if (filteredLocation.getLocation() == null 
		    && filteredLocation.getState() != null 
		    && filteredLocation.getCounty() != null ){
		String query = selectionClause;
		query +=  " ( state = \'" + filteredLocation.getState()+"\' "
			+ "and county = \'" + filteredLocation.getCounty()+"\') ";
		System.err.println("SQL: " + query);
		m1.put(filteredLocation, dbWorker(query, db));
	    } else if (filteredLocation.getLocation() == null 
		    && filteredLocation.getState() != null 
		    && filteredLocation.getCounty() == null ){
		String query = selectionClause;
		query +=  " ( state = \'" + filteredLocation.getState()+"\')";
		System.err.println("SQL: " + query);
		m1.put(filteredLocation, dbWorker(query, db));
	    } else {
		System.err.println("The values in the filter list are invalid.");
		m1.put(filteredLocation, -1);
	    }
	}	
	return m1; 
    }

    private static double dbWorker(String query, MysqlConnect db) {
	double output = 0.0;
	try {
	    ResultSet topTwenty = db.runSQL(query);
	    boolean flag = true;
	    while (topTwenty.next()) {
		if (!flag) {
		    System.err.println("WARNING: The returned results from DB are not expected!");
		    break;
		}
		output = topTwenty.getDouble("output");
		System.out.println("Results" + output);		
		flag = false;
	    }
	} catch (SQLException e) {
	    System.err.println("Database Retrieval Failed");		    
	    e.printStackTrace();
	    return 0.0;
	}

	return output;
    }

    /*public static void main(String[] args) {
	List<Location> inputFilter = new LinkedList<Location>(); //Input Argument
	//inputFilter.add(new Location("SC", "GREENVILLE", "I-185 @ I-385/Exit 1B"));
	//inputFilter.add(new Location("SC", "GREENVILLE", "I-385 @ SC-49/Exit 5"));
	inputFilter.add(new Location("SC", "GREENVILLE", null, null));
	inputFilter.add(new Location("VA", "FAIRFAX", null, null));
	inputFilter.add(new Location("NC", "WAKE", null, null));
	TreeMap.generatorResults(inputFilter, MeasurementType.impactFactor, MeasurementType.length);
    }*/
}