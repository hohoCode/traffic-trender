#!/usr/bin/python

import csv

if __name__ == "__main__":
	csvfileout = open('sources/aggregated_bottlenecks_2010-2011_NC_SC_VA_MD_prepared.csv', 'wb')
	csvwriter = csv.writer(csvfileout)
	with open('sources/aggregated_bottlenecks_2010-2011_NC_SC_VA_MD.csv', 'rb') as csvfile:
		reader = csv.reader(csvfile)
		for row in reader:
			row6orig = row[6]
			row6new = ""
			timearr = row[6].split('.')
			if len(timearr) is 1:
				#no ., don't need to do anything
				row6new = timearr[0]
			else:
				row6new = "00:" + timearr[0]
			row[6] = row6new
			road_name = row[2].split('@')[0].strip()
			row.append(road_name)
			csvwriter.writerow(row)

