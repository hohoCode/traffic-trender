/**
 * @authors Chris Musialek, Chenglin Chen, Richard B. Johnson
 * @date 11/25/12
 * TODO: This is unfortunately a copy of linechart.js, and a bad way to implement
 * this. We needed a quick way to run this code on two different line charts,
 * and the placement on the canvas is hardcoded. In the future, we want to consolidate
 * the code to allow a div parameter to tell d3 where to add the linechart.
 */

var linechartAgg = linechartAgg || {}; // namespace

linechartAgg.initialize = function() {
	linechartAgg.requesting = false;
	linechartAgg.update();
}

/*
 * Currently, we are simply deleting the linechart and recreating the svg, but we
 * should use the update() function within d3 to update these lines instead. Will
 * need a new transition function for that.
 */
linechartAgg.update = function(yvalue) {
	if (linechartAgg.requesting)
		return;
			
    //get current zoom
    var zoom = $(".grandparent").text();
    var zoomarr = zoom.split(".");
    var curzoom;
    
    if (zoomarr.length == 1) {
        curzoom = zoomarr.pop();
    } else {
        zoomarr.shift();
        curzoom = zoomarr.join("@");
    }
    
    //console.log(curzoom);
    
    //get filtermenu - should be based on current zoom
    var filtermenu = uiTreeMap.getFilterSelections();

    if (filtermenu.length == 0) {
	    $("#linechart-aggregate svg").remove();
	    console.log("No filter menu selections.");
		return
    }
    
	linechartAgg.requesting = true;
	
    var yvalue = uiLineChart.getSelection();

    var url = backendurl + "/traffic-trender/worker";
    var linedata = "type=linechart&aggregated=true&y=" + yvalue + "&zoomlevel=" + curzoom + "&" + filtermenu;

    //d3.json(url, runLinechart);
    $.ajax({
        url: url,
        type: 'POST',
        data: linedata,
        dataType: 'json',
        success: function(trends) {
		    $("#linechart-aggregate svg").remove();
			linechart.run(trends, "#linechart-aggregate");
			linechartAgg.requesting = false;
		}
    });
}
