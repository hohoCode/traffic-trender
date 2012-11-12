#!/usr/bin/python

import csv
import json

def prepare_basic_source_data_csv():
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
def prepare_filter_menu_bigO_json():
	jsonfilename = 'sources/filter_menu_data.json'
	csvroads = open('sources/unique_state_county_roadname', 'rb')
	roadreader = csv.reader(csvroads, delimiter='\t')
	h = {}
	states = []
	for row in roadreader:
		key = ",".join(row)
		stateName = row[0]
		countyName = row[1]
		roadName = row[2]
		cur = {'title': roadName, 'select': 'true', 'key': key}
		countyState = stateName + "-" + countyName
		if not h.has_key(stateName):
			#create state object container
			curstate = {'title': stateName, 'key': stateName, 'children': []}
			states.append(curstate)
			#store id where state is kept
			h[stateName] = len(states) - 1
		if not h.has_key(countyState):
			#create county object container
			curcounty = {'title': countyState, 'key': countyState, 'children': []}
			sid = h[stateName]
			states[sid]['children'].append(curcounty)
			h[countyState] = len(states[sid]['children']) - 1
		sid = h[stateName]
		cid = h[countyState]
		states[sid]['children'][cid]['children'].append(cur)
	with open(jsonfilename, 'wb') as outfile:
		json.dump(states, outfile)
def prepare_treemap_json():
	pass
def prepare_linechart_csv():
	pass
if __name__ == "__main__":
	#prepare_basic_source_data_csv()
	prepare_filter_menu_bigO_json()
