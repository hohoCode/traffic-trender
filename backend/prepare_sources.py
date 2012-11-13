#!/usr/bin/python
#Written by: Chris Musialek

import csv
import json
from datetime import timedelta

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
def prepare_aggregates_treemap():
	#TODO: This will be re-done
	'''Aggregate the multiple month,year rows per unique location, adding
occurrences, impact factor, and re-averaging duration and length'''
	h = {}
	#This file is just a sampling of the data which will change later
	csvoutfile = open('sources/treemap_ready_for_json_creation.csv', 'wb')
	csvwriter = csv.writer(csvoutfile)
	with open('sources/aggregated_bottlenecks_2010-2011_NC_SC_VA_MD_prepared.csv', 'rb') as csvfile:
		reader = csv.reader(csvfile)
		for row in reader:	
			#uniqueness is location,county,state
			key = ",".join([row[2],row[11],row[10]])
			if not h.has_key(key):
				h[key] = ""
				csvwriter.writerow([row[2],row[6],row[7],row[8],row[9],row[10],row[11],row[13]])
def prepare_treemap_json():
	jsonfilename = 'sources/treemap_source_data.json'
	csvfile = open('sources/treemap_ready_for_json_creation.csv', 'rb')
	reader = csv.reader(csvfile)
	h = {}
	master = {'name': "States", 'children': []}
	states = []
	for row in reader:
		print row
		stateName = row[5]
		countyName = row[6]
		roadName = row[7]
		location = row[0]
		(hours,minutes,seconds) = row[1].split(":")
		duration = timedelta(hours=int(hours),minutes=int(minutes),seconds=int(seconds)).total_seconds()
		#size=duration, impact factor=color
		#key is state-county-roadname
		countyState = stateName + "-" + countyName
		countyStateRoad = countyState + "-" + roadName
		cur = {'name': location, 'size': duration, 'color': row[4]}
		if not h.has_key(stateName):
			#create state object container
			curstate = {'name': stateName, 'children': []}
			states.append(curstate)
			h[stateName] = len(states) - 1
		if not h.has_key(countyState):
			#create county object container
			curcounty = {'name': countyName, 'children': []}
			sid = h[stateName]
			states[sid]['children'].append(curcounty)
			h[countyState] = len(states[sid]['children']) - 1
		if not h.has_key(countyStateRoad):
			#create road object container
			curroad = {'name': roadName, 'children': []}
			sid = h[stateName]
			cid = h[countyState]
			states[sid]['children'][cid]['children'].append(curroad)
			h[countyStateRoad] = len(states[sid]['children'][cid]['children']) - 1
		sid = h[stateName]
		cid = h[countyState]
		rid = h[countyStateRoad]
		states[sid]['children'][cid]['children'][rid]['children'].append(cur)
	with open(jsonfilename, 'wb') as outfile:
		master['children'] = states
		json.dump(master, outfile)
def prepare_linechart_csv():
	pass
if __name__ == "__main__":
	#prepare_basic_source_data_csv()
	#prepare_filter_menu_bigO_json()
	#prepare_aggregates_treemap()
	prepare_treemap_json()
