package org.traffictrender.worker;

import java.sql.*;

import org.apache.commons.lang.StringEscapeUtils;

public class MysqlConnect {
	private Connection conn = null; 
	private String dbUrl =  "jdbc:mysql://localhost:3306/";
	private String dbName = "traffic";
	private String dbUser = "root";
	private String dbPass = "root";
	private String dbTable = "bottlenecks";

	public boolean dbConnect()
	{
		try
		{
			Class.forName("com.mysql.jdbc.Driver").newInstance();
			conn = DriverManager.getConnection(
					dbUrl + dbName, dbUser, dbPass);
			System.err.println("Database connected");
			return true;
		}
		catch (Exception e)
		{
			e.printStackTrace();
			return false;
		}
	}

	public ResultSet runSQL(String sqlString) {
		ResultSet resultSet = null;
		sqlString = StringEscapeUtils.escapeSql(sqlString);
		try
		{
			Statement statement = conn.createStatement();
			// Result set get the result of the SQL query
			resultSet = statement.executeQuery(sqlString);
			//readResultSet(resultSet);
		}
		catch (Exception e)
		{
			e.printStackTrace();
			return null;
		}	
		return resultSet;	
	}

	public String getClause() {
		return dbName+"."+dbTable;
	}

	public void readMetaData(ResultSet resultSet) throws SQLException {
		System.out.println("The columns in the table are: ");
		System.out.println("Table: " + resultSet.getMetaData().getTableName(1));
		for  (int i = 1; i<= resultSet.getMetaData().getColumnCount(); i++){
			System.out.println("Column " +i  + " "+ resultSet.getMetaData().getColumnName(i));
		}
	}

	@SuppressWarnings("unused")
	private void readResultSet(ResultSet resultSet) throws SQLException {
		// TEST: TBD
		// ResultSet is initially before the first data set
		while (resultSet.next()) {
			String user = resultSet.getString("year");
			String website = resultSet.getString("location");
			String summery = resultSet.getString("month");
			String comment = resultSet.getString("direction");
			String comment2 = resultSet.getString("state");
			System.out.println("Year: " + user);
			System.out.println("Location: " + website);
			System.out.println("Month: " + summery);
			System.out.println("Direction: " + comment);
			System.out.println("ST: " + comment2);
		}
	}
}
