package org.traffictrender.worker;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class LineChart {

    private static int yearStart = 2010;
    private static int yearEnd = 2011;
    private static int monthStart = 1;
    private static int monthEnd = 12;
    private static String selectionClauseIF = "SELECT location, sum(impact_factor)/count(*) as output FROM ";
    private static String selectionClauseDuration =  "SELECT location, sum(time_to_sec(average_duration)*occurrences)/sum(occurrences) as output FROM ";
    private static String selectionClauseLength = "SELECT location, sum(average_max_length*occurrences)/sum(occurrences) as output FROM ";
    
    public static Map<String,Map<Integer, Map<Integer, Object>>> generatorResults(Location zoom, List<Location> filter, MeasurementType threeGuy){
	///Connect DB
	MysqlConnect db = new MysqlConnect();
	if (!db.dbConnect()){
	    System.err.println("Not Connected!");
	    return null;
	}
	///Prepare SQL Statement
	String sqlString = null;
	if (threeGuy == MeasurementType.impactFactor) {
	    sqlString = selectionClauseIF + db.getClause();
	} else if (threeGuy == MeasurementType.duration) {
	    sqlString = selectionClauseDuration + db.getClause();
	} else if (threeGuy == MeasurementType.length) {
	    sqlString = selectionClauseLength + db.getClause();
	} else {
	    System.err.println("Input MeasurementType is invalid!");
	    return null;
	}
	
	
	if (zoom.getState() == null && zoom.getCounty() == null) {
	    sqlString = prepareFilterClause(filter, sqlString);	    
	} else if (zoom.getState() != null && zoom.getCounty() == null) {
	    sqlString = prepareFilterClause(filter, sqlString);
	    if (sqlString == null) {
		return null;
	    }
	    if (!sqlString.contains("where")) {
		sqlString += " where state = \'" + zoom.getState() + "\' ";
	    } else {
		sqlString += " and state = \'" + zoom.getState() + "\' "; 
	    }		    
	} else if  (zoom.getState() != null && zoom.getCounty() != null) {
	    sqlString = prepareFilterClause(filter, sqlString);
	    if (sqlString == null) {
		return null;
	    }
	    if (!sqlString.contains("where")) {
		sqlString += " where state = \'" + zoom.getState() + "\'" + 
			    " and county = \'" + zoom.getCounty() + "\'";
	    } else {
		sqlString += " and state = \'" + zoom.getState() + "\'" + 
			    " and county = \'" + zoom.getCounty() + "\'"; 
	    }	        
	} else {
	    System.err.println("Input Argument: zoom level invalid!");
	    return null;
	}
	
	if (sqlString == null) {
	    return null;
	}
	
	///Run SQL
	return yearMonthIteration(sqlString, threeGuy, db);	
    }
    
    private static String getColumnName(MeasurementType threeguy) {
	if (threeguy == MeasurementType.duration) {
	    return "average_duration"; 
	} else if (threeguy == MeasurementType.length) {
	    return "average_max_length";
	} else {
	    return "impact_factor";
	}	
    }
    
    private static Map<String,Map<Integer, Map<Integer, Object>>> yearMonthIteration(String sql, MeasurementType threeGuy, MysqlConnect db) {
	Map<String,Map<Integer, Map<Integer, Object>>> outputMap = new HashMap<String,Map<Integer, Map<Integer, Object>>>();
	
	for (int i = yearStart; i <= yearEnd; i++) {	
	    for (int j = monthStart; j <= monthEnd; j++) {
		String query = null;
		if (sql.contains("where")) {
		    query = sql + " and year = "+ i + " and month = "+ j + " group by year, month, location, direction order by output desc limit 20";
		} else {
		    query = sql + " where year = "+ i + " and month = "+ j + " group by year, month, location, direction order by output desc limit 20";
		}
		
		try {
		    System.err.println("SQL: " + query);
		    ResultSet topTwenty = db.runSQL(query);
		    if (topTwenty == null) {
			System.err.println("Database Retrieval Failed");
			return null;			
		    }
		    
		    while (topTwenty.next()) {	
			Map<Integer, Object> m1 = new HashMap<Integer, Object>();
			Map<Integer, Map<Integer, Object>> m2 = new HashMap<Integer, Map<Integer, Object>>();
			String roadString = topTwenty.getString("location"); ///Location	
			if (threeGuy == MeasurementType.length) {
			    double measureDouble = topTwenty.getDouble("output");
			    m1.put(j, (Object)measureDouble);
			    System.out.println("Year:"+i + " Month:" +j + " road:" +roadString+" "+ threeGuy +":"+measureDouble);
			} else {
			    int measureInt = topTwenty.getInt("output");
			    m1.put(j, (Object)measureInt);
			    System.out.println("Year:"+i + " Month:" +j + " road:" +roadString+" "+ threeGuy +":"+measureInt);
			}
			m2.put(i, m1);
			outputMap.put(roadString, m2);			
		    }
		} catch (SQLException e) {
		    e.printStackTrace();
		    return null;
		}
	    }
	}	
	return outputMap;
    }

    private static String prepareFilterClause(List<Location> filter, String sqlString) {
	///Get common clause!
	String whereClause = sqlString; 
	int counter = 0;
	int flag = 0;
	if (filter == null){
	    System.err.println("The filter list is empty");
	    return whereClause;
	}
	
	///Get all items in the filtered list
	for (Location filteredLocation : filter) {
	    if (filteredLocation.getLocation() == null 
		    || filteredLocation.getState() == null 
		    || filteredLocation.getCounty() == null 
		    || filteredLocation.getDirection() == null){
		System.err.println("The values in the filter list are invalid.");
		return null;
	    }
	    if (counter == 0) {
		whereClause += " where (";
		flag = 1;
	    } else {
		whereClause += " or ";
	    }
	    whereClause += " (location = \'" + filteredLocation.getLocation() + "\' "
		    + "and state = \'" + filteredLocation.getState()+"\' "
		    + "and county = \'" + filteredLocation.getCounty()+"\' "
		    + "and direction = \'" + filteredLocation.getDirection()+"\') ";
	    counter++;
	}
	
	if (flag == 1){
	    whereClause += ")";
	}
	return whereClause; 
    }
    
    /*public static void main(String[] args) {
	List<Location> inputFilter = new LinkedList<Location>(); //Input Argument
	//inputFilter.add(new Location("SC", "GREENVILLE", "I-185 @ I-385/Exit 1B"));
	//inputFilter.add(new Location("SC", "GREENVILLE", "I-385 @ SC-49/Exit 5"));
	LineChart.generatorResults(new Location("NC", null, null, "NORTHBOUND"), inputFilter, MeasurementType.length);
    }*/
}
