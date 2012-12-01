/**
 * @authors Chris Musialek, Chenglin Chen, Richard B. Johnson
 * @date 11/25/12
 *
 */
 
var linechart = linechart || {}; // namespace

linechart.addLinePopup = function(d) {
    //var xy = d3.mouse(this);
    $("#popup").text(d.name);
    d3.select(this).style("stroke-width", "3.5px");
}

linechart.run = function (trends, id) {

    var format = d3.time.format("%Y-%m");
    var minY = Number.MAX_VALUE, maxY = Number.MIN_VALUE;
    var minX = new Date("2100-01-01T00:00"), maxX = new Date("2000-01-01T00:00");

    trends.locations.forEach(function (d) {
        d.bottlenecks.forEach(function (e) {
            e.date = format.parse(e.date);

            if(e.value>maxY){
                maxY = e.value;
            } else if(e.value<minY) {
                minY = e.value;
            }

            if(e.date>maxX){
                maxX = e.date;
            } else if(e.date<minX) {
                minX = e.date;
            }
        })
    });

    if(maxY>minY){
        maxY = Math.round(maxY+1);
        minY = Math.round(minY-1);
    } else {
        maxY = 100;
        minY = 0;
    }
    if(maxX<minX){
        minX = new Date("2010-01-01T00:00");
        maxX = new Date("2011-12-01T00:00");
    }

    var color = d3.scale.category10();

    var margin = {top: 0, right: 60, bottom: 20, left: 80},
        width = 1100 - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom;

    var x = d3.time.scale()
        .domain([minX, maxX])
        .range([0, width]);

    var y = d3.scale.linear()
        .domain([minY, maxY])
        .range([height, 0]);

    var svg = d3.select(id).append("svg")
        .attr("width", width + margin.left + margin.right + 180)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickFormat(d3.time.format("%b-%Y"));

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".91em")
        .style("text-anchor", "end")
        .text(trends.type);

    var line = d3.svg.line()
        .x(function(d) { return x(d.date);  })
        .y(function(d) { return y(d.value); });

    var location = svg.selectAll(".location")
        .data(trends.locations)
        .enter().append("g")
        .attr("class", "location");

    var path = location.append("path")
        .attr("class", "line")
        .attr("d", function(d) { return line(d.bottlenecks); })
        .style("stroke", function(d) { return color(d.name); })
        .on("mouseover", linechart.addLinePopup)
        .on("mouseout", function() { $("#popup").text(""); d3.select(this).style("stroke-width", "1.5px");});

    path.attr("stroke-dasharray", function(d){
        return  d3.select(this).node().getTotalLength() + "," +  d3.select(this).node().getTotalLength();
    })
        .attr("stroke-dashoffset", function(d){
            return d3.select(this).node().getTotalLength();
        })
        .transition()
        .duration(500)
        .ease("linear")
        .attr("stroke-dashoffset", 0);

    location.append("text")
        .datum(function(d) { return {name: d.name, bottlenecks: d.bottlenecks[d.bottlenecks.length - 1]}; })
        .attr("transform", function(d) { return "translate(" + x(d.bottlenecks.date) + "," + y(d.bottlenecks.value) + ")"; })
        .attr("x", 3)
        .attr("dy", ".35em")
        .style("fill", function(d) { return color(d.name); })
        .text(function(d) { return d.name; });

}

linechart.initialize = function() {
	linechart.requesting = false;
	
	//Set some reasonable defaults
	var defaultY = "impactFactor";
	uiLineChart.setSelection(defaultY);
	
	linechart.update();
}

/*
 * Currently, we are simply deleting the linechart and recreating the svg, but we
 * should use the update() function within d3 to update these lines instead. Will
 * need a new transition function for that.
 */
linechart.update = function() {
	if (linechart.requesting)
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
	    $("#linechart svg").remove();
	    console.log("No filter menu selections.");
		return
    }

	linechart.requesting = true;

    var yvalue = uiLineChart.getSelection();

    var url = backendurl + "/traffic-trender/worker";
    var linedata = "type=linechart&y=" + yvalue + "&zoomlevel=" + curzoom + "&" + filtermenu;

    //d3.json(url, runLinechart);
    $.ajax({
        url: url,
        type: 'POST',
        data: linedata,
        dataType: 'json',
        success: function(trends) {
		    $("#linechart svg").remove();
			linechart.run(trends, "#linechart");
			linechart.requesting = false;
        }
    });
}
