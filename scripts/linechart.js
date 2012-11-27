/**
 * @authors Chris Musialek, Chenglin Chen
 * @date 11/25/12
 *
 */

var runLinechart = function (trends) {

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

    var margin = {top: 10, right: 60, bottom: 20, left: 80},
        width = 1250 - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom;

    var x = d3.time.scale()
        .domain([minX, maxX])
        .range([0, width]);

    var y = d3.scale.linear()
        .domain([minY, maxY])
        .range([height, 0]);

    var svg = d3.select("#linechart").append("svg")
        .attr("width", width + margin.left + margin.right)
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
        .attr("dy", ".71em")
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
        .style("stroke", function(d) { return color(d.name); });

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

//Set some reasonable defaults
var defaultY = "impactFactor";
var defaultZoom = "MD";
var defaultFilters = "filtermenu=DC@DISTRICT OF COLUMBIA@I-395&filtermenu=DC@DISTRICT OF COLUMBIA@I-395 HOV&filtermenu=DC@DISTRICT OF COLUMBIA@I-66&filtermenu=MD@ALLEGANY@I-68&filtermenu=MD@ANNE ARUNDEL@I-195&filtermenu=MD@ANNE ARUNDEL@I-695&filtermenu=MD@ANNE ARUNDEL@I-895&filtermenu=MD@ANNE ARUNDEL@I-895 Spur&filtermenu=MD@ANNE ARUNDEL@I-97&filtermenu=MD@ANNE ARUNDEL@US-50&filtermenu=MD@BALTIMORE@I-195&filtermenu=MD@BALTIMORE@I-695&filtermenu=MD@BALTIMORE@I-70&filtermenu=MD@BALTIMORE@I-795&filtermenu=MD@BALTIMORE@I-83&filtermenu=MD@BALTIMORE@I-895&filtermenu=MD@BALTIMORE@I-95&filtermenu=MD@CARROLL@I-70&filtermenu=MD@CECIL@I-95&filtermenu=MD@DORCHESTER@US-50&filtermenu=MD@FREDERICK@I-270&filtermenu=MD@FREDERICK@I-70&filtermenu=MD@GARRETT@I-68&filtermenu=MD@HARFORD@I-95&filtermenu=MD@HOWARD@I-70&filtermenu=MD@HOWARD@I-895&filtermenu=MD@HOWARD@I-95&filtermenu=MD@MONTGOMERY@I-270&filtermenu=MD@MONTGOMERY@I-270 Spur&filtermenu=MD@MONTGOMERY@I-370&filtermenu=MD@MONTGOMERY@I-495&filtermenu=MD@TALBOT@US-50&filtermenu=MD@WASHINGTON@I-68&filtermenu=MD@WASHINGTON@I-70&filtermenu=MD@WASHINGTON@I-81&filtermenu=MD@WICOMICO@US-50&filtermenu=MD@WORCESTER@US-50&filtermenu=VA@ALEXANDRIA@I-395&filtermenu=VA@ALEXANDRIA@I-395 HOV&filtermenu=VA@ALEXANDRIA@I-495&filtermenu=VA@ARLINGTON@I-395&filtermenu=VA@ARLINGTON@I-395 HOV&filtermenu=VA@ARLINGTON@I-66&filtermenu=VA@CAROLINE@I-95&filtermenu=VA@CHESAPEAKE@I-264&filtermenu=VA@CHESAPEAKE@I-464&filtermenu=VA@CHESAPEAKE@I-64&filtermenu=VA@CHESAPEAKE@I-664&filtermenu=VA@CHESTERFIELD@I-295&filtermenu=VA@CHESTERFIELD@I-95&filtermenu=VA@COLONIAL HEIGHTS@I-95&filtermenu=VA@EMPORIA@I-95&filtermenu=VA@FAIRFAX@I-395&filtermenu=VA@FAIRFAX@I-395 HOV&filtermenu=VA@FAIRFAX@I-495&filtermenu=VA@FAIRFAX@I-66&filtermenu=VA@FAIRFAX@I-95&filtermenu=VA@FAIRFAX@I-95 HOV&filtermenu=VA@FREDERICKSBURG@I-95&filtermenu=VA@GOOCHLAND@I-64&filtermenu=VA@GREENSVILLE@I-95&filtermenu=VA@HAMPTON@I-64&filtermenu=VA@HAMPTON@I-664&filtermenu=VA@HANOVER@I-295&filtermenu=VA@HANOVER@I-95&filtermenu=VA@HENRICO@I-295&filtermenu=VA@HENRICO@I-64&filtermenu=VA@HENRICO@I-95&filtermenu=VA@HOPEWELL@I-295&filtermenu=VA@JAMES CITY@I-64&filtermenu=VA@MECKLENBURG@I-85&filtermenu=VA@NEW KENT@I-64&filtermenu=VA@NEWPORT NEWS@I-64&filtermenu=VA@NEWPORT NEWS@I-664&filtermenu=VA@NORFOLK@I-264&filtermenu=VA@NORFOLK@I-464&filtermenu=VA@NORFOLK@I-564&filtermenu=VA@NORFOLK@I-64&filtermenu=VA@PETERSBURG@I-95&filtermenu=VA@PORTSMOUTH@I-264&filtermenu=VA@PRINCE GEORGE@I-295&filtermenu=VA@PRINCE GEORGE@I-95&filtermenu=VA@PRINCE WILLIAM@I-66&filtermenu=VA@PRINCE WILLIAM@I-95&filtermenu=VA@PRINCE WILLIAM@I-95 HOV&filtermenu=VA@RICHMOND@I-195&filtermenu=VA@RICHMOND@I-64&filtermenu=VA@RICHMOND@I-95&filtermenu=VA@SPOTSYLVANIA@I-95&filtermenu=VA@STAFFORD@I-95&filtermenu=VA@SUFFOLK@I-664&filtermenu=VA@SUSSEX@I-95&filtermenu=VA@VIRGINIA BEACH@I-264&filtermenu=VA@VIRGINIA BEACH@I-64&filtermenu=VA@YORK@I-64";
var defaulturl = backendurl + "/traffic-trender/worker?type=linechart&y=" + defaultY + "&zoomlevel=" + defaultZoom + "&" + defaultFilters;

d3.json(defaulturl, runLinechart);


/*
 * Currently, we are simply deleting the linechart and recreating the svg, but we
 * should use the update() function within d3 to update these lines instead. Will
 * need a new transition function for that.
 */
var updateLinechart = function() {
    //get current zoom
    var zoom = $(".grandparent").text();
    //var curzoom = zoom.split(".").pop();
    var curzoom = 'MD'; //TODO: Hard coded for now until backend works
    var yvalue = uiLineGraph.translate(uiLineGraph.selected);
    //get filtermenu - should be based on current zoom
    var filtermenu = uiFilter.getFilterSelections();

    var url = backendurl + "/traffic-trender/worker?type=linechart&y=" + yvalue + "&zoomlevel=" + curzoom + "&" + filtermenu;

    $("#linechart svg").remove();
    d3.json(url, runLinechart);

}
