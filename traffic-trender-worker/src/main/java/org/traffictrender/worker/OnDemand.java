package org.traffictrender.worker;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;


public class OnDemand {

    public static class Tuple2 {
	private String f1;
	private Map<String, Integer> f2;
	public Tuple2(String f1, Map<String, Integer> f2) {
	    this.f1 = f1; this.f2 = f2;
	}
	public String getString() {return f1;}
	public Map<String, Integer> getMap() {return f2;}
    }

    public static Map<Location, Statistics> generatorResults(List<Location> filter){
	///Connect DB
	MysqlConnect db = new MysqlConnect();
	if (!db.dbConnect()){
	    System.err.println("Not Connected!");
	    return null;
	}

	///Prepare Filter List
	Tuple2 outTuple2  = prepareFilterClause(filter);
	if (outTuple2.getString() == null || outTuple2.getMap() == null){
	    System.err.println("The Filter list is invalid! ");
	    return null;
	}
	String constraintString = outTuple2.getString();
	Map<String, Integer> locaMap = outTuple2.getMap();
	
	///Prepared returned value
	Map<Integer, Statistics> returnedMap = new HashMap<Integer, Statistics>();

	for (int i= 0; i< filter.size(); i++) {
	    returnedMap.put(i, new Statistics());
	}

	////Get MIN
	String query = "SELECT min(impact_factor) as output, road_name, state, county, location " 
		+ " FROM " + db.getClause() 
		+ constraintString 
		+ " GROUP BY location, road_name, county, state";	
	returnedMap = runDB(query, locaMap, returnedMap, db, 0);

	////MAX
	query = "SELECT max(impact_factor) as output, road_name, state, county, location " 
		+ " FROM " + db.getClause() 
		+ constraintString 
		+ " GROUP BY location, road_name, county, state";	
	returnedMap = runDB(query, locaMap, returnedMap, db, 1);

	///Average
	query = "SELECT avg(impact_factor) as output, road_name, state, county, location " 
		+ " FROM " + db.getClause() 
		+ constraintString 
		+ " GROUP BY location, road_name, county, state";	
	returnedMap = runDB(query, locaMap, returnedMap, db, 2);

	///SD
	query = "SELECT STD(impact_factor) as output, road_name, state, county, location " 
		+ " FROM " + db.getClause() 
		+ constraintString 
		+ " GROUP BY location, road_name, county, state";	
	returnedMap = runDB(query, locaMap, returnedMap, db, 3);

	///Conclude 
	Map<Location, Statistics> finalReturnedMap = new HashMap<Location, Statistics>();
	for (int i = 0; i < filter.size(); i++) {
	    finalReturnedMap.put(filter.get(i), returnedMap.get(i));
	}
	return finalReturnedMap;	
    }    

    private static  Map<Integer, Statistics> runDB(String query, 
	    Map<String, Integer> locaMap, 
	    Map<Integer, Statistics> returnedMap,
	    MysqlConnect db, 
	    int type) {

	try {
	    System.err.println("SQL: " + query);
	    ResultSet topTwenty = db.runSQL(query);
	    if (topTwenty == null) {
		System.err.println("No Results Retrieved");
		return null;
	    }

	    while (topTwenty.next()) {
		String constraintsString = " (road_name = \'" + topTwenty.getString("road_name") + "\' "
			+ "and state = \'" + topTwenty.getString("state")+"\' "
			+ "and county = \'" + topTwenty.getString("county") + "\' "
			+ "and location = \'" + topTwenty.getString("location")+ "\') ";		
		int index = locaMap.get(constraintsString);
		if (type == 0){
		    System.out.println("MIN "+index+" "+topTwenty.getFloat("output"));
		    returnedMap.get(index).setMin(topTwenty.getFloat("output"));
		} else if (type == 1) {
		    System.out.println("MAX "+index+" "+topTwenty.getFloat("output"));
		    returnedMap.get(index).setMax(topTwenty.getFloat("output"));		    
		} else if (type == 2) {
		    System.out.println("AVG "+index+" "+topTwenty.getFloat("output"));
		    returnedMap.get(index).setAverage(topTwenty.getFloat("output"));
		} else {
		    System.out.println("SD "+index+" "+topTwenty.getFloat("output"));
		    returnedMap.get(index).setSD(topTwenty.getFloat("output"));
		}
	    }
	} catch (SQLException e) {
	    e.printStackTrace();
	    return null;
	}

	return returnedMap;
    }

    private static Tuple2 prepareFilterClause(List<Location> filter) {
	///Get common clause!
	Map<String, Integer> locaMap = new HashMap<String, Integer>();
	String whereClause = ""; 
	int counter = 0;
	int flag = 0;
	if (filter == null){
	    System.err.println("The filter list is empty");
	    return null;
	}

	///Get all items in the filtered list
	for (int i = 0; i< filter.size(); i++) {
	    Location filteredLocation = filter.get(i);
	    if (filteredLocation.getRoad() == null
		    || filteredLocation.getState() == null 
		    || filteredLocation.getCounty() == null 
		    || filteredLocation.getLocation() == null){
		System.err.println("The values in the filter list are invalid.");
		return null;
	    }
	    if (counter == 0) {
		whereClause += " where (";
		flag = 1;
	    } else {
		whereClause += " or ";
	    }
	    String constraintsString = " (road_name = \'" + filteredLocation.getRoad() + "\' "
		    + "and state = \'" + filteredLocation.getState()+"\' "
		    + "and county = \'" + filteredLocation.getCounty()+ "\' "
		    + "and location = \'" + filteredLocation.getLocation()+ "\') ";
	    whereClause += constraintsString;
	    locaMap.put(constraintsString, i);
	    counter++;
	}

	if (flag == 1){
	    whereClause += ")";
	}
	Tuple2 returnValTuple2 = new OnDemand.Tuple2(whereClause, locaMap); 
	return returnValTuple2;
    }

    /*public static void main(String[] args) {
	List<Location> inputFilter = new LinkedList<Location>(); //Input Argument
	inputFilter.add(new Location("SC", "GREENVILLE", "I-185", "I-185 @ East Toll Plaza"));
	inputFilter.add(new Location("MD", "ALLEGANY", "I-68", "I-68 @ Hillcrest Dr/Exit 45"));
	inputFilter.add(new Location("SC", "GREENVILLE", "I-185", "I-385 @ End of Freeway"));
	inputFilter.add(new Location("SC", "GREENVILLE", "I-185", "I-185 @ SC-20/Piedmont Hwy/Exit 10"));
	inputFilter.add(new Location("SC", "GREENVILLE", "I-185", "I-185 @ Henrydale Ave/Mills Ave"));
	inputFilter.add(new Location("SC", "GREENVILLE", "I-185", "I-185 @ Henrydale Ave/Mills Ave"));
	inputFilter.add(new Location("SC", "GREENVILLE", "I-185", "I-185 @ Henrydale Ave/Mills Ave"));
	OnDemand.generatorResults(inputFilter);
    }*/

}
