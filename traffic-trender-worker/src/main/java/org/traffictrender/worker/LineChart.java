package org.traffictrender.worker;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class LineChart {

	private static int yearStart = 2010;
	private static int yearEnd = 2011;
	private static int monthStart = 1;
	private static int monthEnd = 12;
	private static String selectionClauseIF = "SELECT target, sum(impact_factor)/count(*) as output, year, month FROM ";
	private static String selectionClauseDuration = "SELECT target, sum(time_to_sec(average_duration)*occurrences)/sum(occurrences) as output, year, month FROM ";
	private static String selectionClauseLength = "SELECT target, sum(average_max_length*occurrences)/sum(occurrences) as output, year, month FROM ";

	public static Map<String, Map<Integer, Map<Integer, Object>>> generatorResults(
			Location zoom, List<Location> filter, MeasurementType threeGuy, boolean aggregated) {
		// Connect DB
		MysqlConnect db = new MysqlConnect();
		if (!db.dbConnect()) {
			System.err.println("Not Connected!");
			return null;
		}

		if (zoom.getLocation() != null 
				|| ((zoom.getState() == null || zoom.getCounty() == null) && zoom.getRoad() != null)
				|| (zoom.getState() == null && zoom.getCounty() != null)) {
			System.err.println("Input Argument: zoom level invalid!");
			return null;
		}
		String sqlString = null;

		if (threeGuy == MeasurementType.impactFactor) {
			sqlString = selectionClauseIF;
		} else if (threeGuy == MeasurementType.duration) {
			sqlString = selectionClauseDuration;
		} else if (threeGuy == MeasurementType.length) {
			sqlString = selectionClauseLength;
		} else {
			System.err.println("Input MeasurementType is invalid!");
			return null;
		}

		sqlString += db.getClause();

		String zoomFilter = zoom.getQueryString();

		String filterWhereClause = prepareFilterClause(filter);
		if (zoomFilter != null && !zoomFilter.isEmpty()) {
			if (filterWhereClause.isEmpty()) {
				sqlString += " where ";
			} else {
				sqlString += filterWhereClause + " and ";
			}
			sqlString += zoomFilter;
		}

		// Run SQL
		return yearMonthIteration(sqlString, threeGuy, db, aggregated, zoom);
	}

	private static Map<String, Map<Integer, Map<Integer, Object>>> yearMonthIteration(
			String sql, MeasurementType threeGuy, MysqlConnect db, boolean aggregated, Location zoom) {
		Map<String, Map<Integer, Map<Integer, Object>>> outputMap = new HashMap<String, Map<Integer, Map<Integer, Object>>>();

		String top10SqlString = sql
				+ " group by target order by output desc limit 10";

		top10SqlString = top10SqlString.replaceAll("target", aggregated?zoom.getNextLevel():"location");

		Set<String> targetSet = new HashSet<String>();

		try {
			System.err.println("SQL1: " + top10SqlString);
			ResultSet topTen = db.runSQL(top10SqlString);
			if (topTen == null) {
				System.err.println("No Results Retrieved");
				return null;
			}

			while (topTen.next()) {
				targetSet.add(topTen.getString(aggregated?zoom.getNextLevel():"location"));
			}

		} catch (SQLException e) {
			e.printStackTrace();
			return null;
		}

		String query = null;
		if (threeGuy == MeasurementType.impactFactor) {
			query = selectionClauseIF;
		} else if (threeGuy == MeasurementType.duration) {
			query = selectionClauseDuration;
		} else if (threeGuy == MeasurementType.length) {
			query = selectionClauseLength;
		} else {
			System.err.println("Input MeasurementType is invalid!");
			return null;
		}
		query += db.getClause();

		for (String target : targetSet) {
			Map<Integer, Map<Integer, Object>> yearMap = new HashMap<Integer, Map<Integer, Object>>();
			outputMap.put(target, yearMap);
			for (int i = yearStart; i <= yearEnd; i++) {
				Map<Integer, Object> monthMap = new HashMap<Integer, Object>();
				yearMap.put(i, monthMap);
				for (int j = monthStart; j <= monthEnd; j++) {
					monthMap.put(j, Double.valueOf(0));
				}
			}
		}

		for (String target : targetSet) {
			String newQuery = query;
			newQuery += " where target = \"" + target
					+ "\" group by year, month, target";

			newQuery = newQuery.replaceAll("target", aggregated?zoom.getNextLevel() : "location");

			System.err.println("SQL2: " + newQuery);
			try {
				ResultSet locationNumber = db.runSQL(newQuery);
				if (locationNumber == null) {
					System.err.println("Not possible outcome!");
					return null;
				}

				while (locationNumber.next()) {
					int year = locationNumber.getInt("year");
					int month = locationNumber.getInt("month");
					Object value = null;
					if (threeGuy == MeasurementType.length) {
						value = locationNumber
								.getDouble("output");
					} else {
						value = locationNumber.getInt("output");
					}
					outputMap.get(target).get(year).put(month, value);
				}
			} catch (SQLException e) {
				e.printStackTrace();
				return null;
			}

		} 

		return outputMap;
	}

	private static String prepareFilterClause(List<Location> filter) {
		// Get common clause!
		String whereClause = "";

		if (filter == null || filter.isEmpty()) {
			System.err.println("The filter list is empty");
			return whereClause;
		}

		// Get all items in the filtered list
		for (Location filteredLocation : filter) {
			if (whereClause.isEmpty()) {
				whereClause += " where (";
			} else {
				whereClause += " or ";
			}
			whereClause += " (" + filteredLocation.getQueryString() + ") ";
		}

		if (!whereClause.isEmpty()) {
			whereClause += ")";
		}
		return whereClause;
	}

}
