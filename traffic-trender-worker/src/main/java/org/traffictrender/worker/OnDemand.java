package org.traffictrender.worker;

//package org.traffictrender.worker;

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

    public static Map<Location, Map<String, String>> generatorResults(List<Location> filter){
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

	////Get MIN
	List<String> querieStrings = new LinkedList<String>();
	/*String query = "SELECT min(impact_factor) as output, road_name, state, county, location " 
		+ " FROM " + db.getClause() 
		+ constraintString 
		+ " GROUP BY location, road_name, county, state";*/

	///Average - 0
	String queryAVE = "SELECT avg(impact_factor) as output, road_name, state, county, location " 
		+ " FROM " + db.getClause() 
		+ constraintString 
		+ " GROUP BY location, road_name, county, state";	
	querieStrings.add(queryAVE);

	///SD - 1
	String querySD = "SELECT STD(impact_factor) as output, road_name, state, county, location " 
		+ " FROM " + db.getClause() 
		+ constraintString 
		+ " GROUP BY location, road_name, county, state";	
	querieStrings.add(querySD);

	////MAX - 2
	String queryMax = "SELECT max(impact_factor) as output, road_name, state, county, location, year, month " 
		+ " FROM " + db.getClause() 
		+ constraintString 
		+ " GROUP BY location, road_name, county, state";	
	//returnedMap = runDB(query, locaMap, returnedMap, db, 1);
	querieStrings.add(queryMax);

	return runDB(querieStrings, locaMap, filter, db);		
    }    

    private static  Map<Location, Map<String, String>> runDB(List<String> queries, 
                    	    Map<String, Integer> locaMap, 
                    	    List<Location> filter,
                    	    MysqlConnect db) {
	Map<Location, Map<String, String>> returnedMap = new HashMap<Location, Map<String,String>>();
	try {
	    for (int i = 0; i < queries.size(); i++) {
		System.err.println("SQL: " + queries.get(i));
		ResultSet topTwenty = db.runSQL(queries.get(i));
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
		    System.out.println("INDEX: "+index);
		    
		    if (i == 0){//AVG
			//System.out.println("MIN "+index+" "+topTwenty.getFloat("output"));
			Map<String, String> innerMap = new HashMap<String, String>(); 
			innerMap.put("AVG", Float.toString(topTwenty.getFloat("output")));
			returnedMap.put(filter.get(index), innerMap);
		    } else if (i == 1) {///SD
			//System.out.println("MAX "+index+" "+topTwenty.getFloat("output"));
			Map<String, String> innerMap = new HashMap<String, String>(); 
			innerMap.put("SD", Float.toString(topTwenty.getFloat("output")));
			returnedMap.put(filter.get(index), innerMap);
			//returnedMap.get(index).setMax(topTwenty.getFloat("output"));		    
		    } else if (i == 2) {///MAX
			//System.out.println("AVG "+index+" "+topTwenty.getFloat("output"));
			Map<String, String> innerMap = new HashMap<String, String>(); 
			innerMap.put("MAX", Float.toString(topTwenty.getFloat("output")));
			returnedMap.put(filter.get(index), innerMap);
			Map<String, String> innerMap2 = new HashMap<String, String>();
			String yearString = topTwenty.getString("year");
			String monString = topTwenty.getString("month");	
			innerMap.put("DATE", yearString+"/"+monString);
			returnedMap.put(filter.get(index), innerMap);			
		    } else {
			System.err.println("Outcome Not POSSIBLE!");
			return null;
		    }
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
	inputFilter.add(new Location("SC", "GREENVILLE", "I-385", "I-385 @ End of Freeway"));
	inputFilter.add(new Location("SC", "GREENVILLE", "I-185", "I-185 @ SC-20/Piedmont Hwy/Exit 10"));
	//inputFilter.add(new Location("SC", "GREENVILLE", "I-185", "I-185 @ Henrydale Ave/Mills Ave"));
	//inputFilter.add(new Location("SC", "GREENVILLE", "I-185", "I-185 @ Henrydale Ave/Mills Ave"));
	//inputFilter.add(new Location("SC", "GREENVILLE", "I-185", "I-185 @ Henrydale Ave/Mills Ave"));
	OnDemand.generatorResults(inputFilter);
    }*/

}
