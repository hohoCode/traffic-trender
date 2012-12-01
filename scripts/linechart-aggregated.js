/**
 * @authors Chris Musialek, Chenglin Chen, Richard B. Johnson
 * @date 11/25/12
 * TODO: This is unfortunately a copy of linechart.js, and a bad way to implement
 * this. We needed a quick way to run this code on two different line charts,
 * and the placement on the canvas is hardcoded. In the future, we want to consolidate
 * the code to allow a div parameter to tell d3 where to add the linechart.
 */

var linechartAgg = linechartAgg || {}; // namespace

linechartAgg.run = function (trends) {
	linechart.run(trends, "#linechart-aggregate");
}

linechartAgg.initialize = function() {
	linechartAgg.update();
}

/*
 * Currently, we are simply deleting the linechart and recreating the svg, but we
 * should use the update() function within d3 to update these lines instead. Will
 * need a new transition function for that.
 */
linechartAgg.update = function(yvalue) {
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
    
    console.log(curzoom);
    
    //get filtermenu - should be based on current zoom
    var filtermenu = uiFilter.getSelections();
    var yvalue = uiLineGraph.getSelection();

    var url = backendurl + "/traffic-trender/worker";
    var linedata = "type=linechart&aggregated=true&y=" + yvalue + "&zoomlevel=" + curzoom + "&" + filtermenu;

    $("#linechart-aggregate svg").remove();
    //d3.json(url, runLinechart);
    $.ajax({
        url: url,
        type: 'POST',
        data: linedata,
        dataType: 'json',
        success: linechartAgg.run
    });
}
