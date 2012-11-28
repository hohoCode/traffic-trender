package org.traffictrender.worker;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class LineChartAggregate {

	private static int yearStart = 2010;
	private static int yearEnd = 2011;
	private static int monthStart = 1;
	private static int monthEnd = 12;
	private static String selectionClauseIF = "sum(impact_factor)/count(*) as output, year, month ";
	private static String selectionClauseDuration = "sum(time_to_sec(average_duration)*occurrences)/sum(occurrences) as output, year, month ";
	private static String selectionClauseLength = "sum(average_max_length*occurrences)/sum(occurrences) as output, year, month ";

	public static Map<String, Map<Integer, Map<Integer, Object>>> generatorResults(
			Location zoom, List<Location> filter, MeasurementType threeGuy) {
		// Connect DB
		MysqlConnect db = new MysqlConnect();
		if (!db.dbConnect()) {
			System.err.println("Not Connected!");
			return null;
		}

		String sqlString = null;
		String whichLevel = null;
		if (zoom.getState() == null && zoom.getCounty() == null
				&& zoom.getRoad() == null) { // /All State
			sqlString = "FROM " + db.getClause();
			sqlString = prepareFilterClause(filter, sqlString);
			whichLevel = "state";
		} else if (zoom.getState() != null && zoom.getCounty() == null
				&& zoom.getRoad() == null) { // //All County
			sqlString = "FROM " + db.getClause();
			sqlString = prepareFilterClause(filter, sqlString);
			if (!sqlString.contains("where")) {
				sqlString += " where state = \'" + zoom.getState() + "\' ";
			} else {
				sqlString += " and state = \'" + zoom.getState() + "\' ";
			}
			whichLevel = "county";
		} else if (zoom.getState() != null && zoom.getCounty() != null
				&& zoom.getRoad() == null) { // /All Road
			sqlString = "FROM " + db.getClause();
			sqlString = prepareFilterClause(filter, sqlString);

			if (!sqlString.contains("where")) {
				sqlString += " where state = \'" + zoom.getState() + "\'"
						+ " and county = \'" + zoom.getCounty() + "\'";
			} else {
				sqlString += " and state = \'" + zoom.getState() + "\'"
						+ " and county = \'" + zoom.getCounty() + "\'";
			}
			whichLevel = "road_name";
		} else if (zoom.getState() != null && zoom.getCounty() != null
				&& zoom.getRoad() != null) { // All Locations
			sqlString = "FROM " + db.getClause();
			sqlString = prepareFilterClause(filter, sqlString);

			if (!sqlString.contains("where")) {
				sqlString += " where state = \'" + zoom.getState() + "\'"
						+ " and county = \'" + zoom.getCounty() + "\'"
						+ " and road_name  = \'" + zoom.getRoad() + "\'";
			} else {
				sqlString += " and state = \'" + zoom.getState() + "\'"
						+ " and county = \'" + zoom.getCounty() + "\'"
						+ " and road_name = \'" + zoom.getRoad() + "\'";
			}
			whichLevel = "location";
		} else {
			System.err.println("Input Argument: zoom level invalid!");
			return null;
		}

		// /Run
		return yearMonthIteration(sqlString, threeGuy, db, whichLevel);
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

	private static Map<String, Map<Integer, Map<Integer, Object>>> yearMonthIteration(
			String sql, MeasurementType threeGuy, MysqlConnect db,
			String whichLevel) {
		Map<String, Map<Integer, Map<Integer, Object>>> outputMap = new HashMap<String, Map<Integer, Map<Integer, Object>>>();

		try {
			String query = "SELECT " + whichLevel + " " + sql + " group by "
					+ whichLevel;
			System.err.println("SQL11: " + query);
			ResultSet topTwenty = db.runSQL(query);
			if (topTwenty == null) {
				System.err.println("No Results Retrieved");
				return null;
			}

			HashMap<String, Integer> gapChecker = new HashMap<String, Integer>();
			for (int i = yearStart; i <= yearEnd; i++) {
				for (int j = monthStart; j <= monthEnd; j++) {
					gapChecker.put(i + " " + j, 1);
				}
			}

			while (topTwenty.next()) {
				HashMap<String, Integer> gapCheckerNew = (HashMap<String, Integer>) gapChecker
						.clone();

				String targetString = topTwenty.getString(whichLevel); // /Location

				query = "";
				if (!sql.contains("where")) {
					query = sql + " where " + whichLevel + " = \'"
							+ targetString + "\' group by year, month, "
							+ whichLevel;
				} else {
					query = sql + " and " + whichLevel + " = \'" + targetString
							+ "\' group by year, month, " + whichLevel;
				}

				// /Prepare SQL Statement
				if (threeGuy == MeasurementType.impactFactor) {
					query = selectionClauseIF + query;
				} else if (threeGuy == MeasurementType.duration) {
					query = selectionClauseDuration + query;
				} else if (threeGuy == MeasurementType.length) {
					query = selectionClauseLength + query;
				} else {
					System.err.println("Input MeasurementType is invalid!");
					return null;
				}

				query = "SELECT " + whichLevel + ", " + query;

				System.err.println("SQL2: " + query);
				ResultSet locationNumber = db.runSQL(query);
				if (locationNumber == null) {
					System.err.println("Not possible outcome!");
					return null;
				}

				while (locationNumber.next()) {
					Map<Integer, Object> m1 = new HashMap<Integer, Object>();
					Map<Integer, Map<Integer, Object>> m2 = new HashMap<Integer, Map<Integer, Object>>();
					int yea = locationNumber.getInt("year");
					int monn = locationNumber.getInt("month");
					gapCheckerNew.put(yea + " " + monn, 0);
					if (threeGuy == MeasurementType.length) {
						double measureDouble = locationNumber
								.getDouble("output");
						m1.put(monn, (Object) measureDouble);
						// System.out.println("Year:"+yea + " Month:" + monn +
						// " TARGET:" +targetString+" "+ threeGuy
						// +":"+measureDouble);
					} else {
						int measureInt = locationNumber.getInt("output");
						m1.put(monn, (Object) measureInt);
						// System.out.println("Year:"+yea + " Month:" + monn +
						// " TARGET:" +targetString+" "+ threeGuy
						// +":"+measureInt);
					}
					m2.put(yea, m1);
					outputMap.put(targetString, m2);
				}

				int left = 0;
				for (int i = yearStart; i <= yearEnd; i++) {
					for (int j = monthStart; j <= monthEnd; j++) {
						if (gapCheckerNew.get(i + " " + j) == 1) {
							left++;
							Map<Integer, Object> m1 = new HashMap<Integer, Object>();
							Map<Integer, Map<Integer, Object>> m2 = new HashMap<Integer, Map<Integer, Object>>();
							m1.put(j, (Object) 0);
							m2.put(j, m1);
							outputMap.put(targetString, m2);
						}
					}
				}
				// System.out.println("PAY"+left);
			}
		} catch (SQLException e) {
			e.printStackTrace();
			return null;
		}

		return outputMap;
	}

	private static String prepareFilterClause(List<Location> filter,
			String sqlString) {
		// /Get common clause!
		String whereClause = sqlString;
		int counter = 0;
		int flag = 0;
		if (filter == null) {
			System.err.println("The filter list is empty");
			return whereClause;
		}

		// /Get all items in the filtered list
		for (Location filteredLocation : filter) {
			if (filteredLocation.getRoad() == null
					|| filteredLocation.getState() == null
					|| filteredLocation.getCounty() == null) {
				System.err
						.println("The values in the filter list are invalid.");
				return null;
			}
			if (counter == 0) {
				whereClause += " where (";
				flag = 1;
			} else {
				whereClause += " or ";
			}
			whereClause += " (road_name = \'" + filteredLocation.getRoad()
					+ "\' " + "and state = \'" + filteredLocation.getState()
					+ "\' " + "and county = \'" + filteredLocation.getCounty()
					+ "\') ";
			counter++;
		}

		if (flag == 1) {
			whereClause += ")";
		}
		return whereClause;
	}

	/*
	 * public static void main(String[] args) { List<Location> inputFilter = new
	 * LinkedList<Location>(); //Input Argument inputFilter.add(new
	 * Location("SC", "GREENVILLE", "I-185", null)); inputFilter.add(new
	 * Location("SC", "GREENVILLE", "I-385", null));
	 * LineChartAggregate.generatorResults(new Location("SC", "GREENVILLE",
	 * "I-185", null), inputFilter, MeasurementType.length); }
	 */
}
