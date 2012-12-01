/*
 * javascript to create and update the treemap
 * @author Chris Musialek, Richard B. Johnson
 * @date 11/25/12
 * */
 
var treemap = treemap || {}; // namespace

//TODO: recreate using a recursive function or something innate to js, this is hardcoded to our hierarchy
var getMinMaxColors = function(root) {
    var minColor = Number.MAX_VALUE, maxColor = Number.MIN_VALUE, avgColor = Number.MIN_VALUE;

    var colorSum = 0, colorNum = 0;
    root.children.forEach(function (d) {
        d.children.forEach(function (e) {
            e.children.forEach(function (f) {
                f.children.forEach(function (g) {
                    cur = parseInt(g.color, 10);
                    colorSum += cur;
                    colorNum += 1;
                    if(cur > maxColor){
                        maxColor = cur;
                    } else if(cur<minColor) {
                        minColor = cur;
                    }
                })
            })
        })
    });

    avgColor = colorSum/colorNum;

    return [minColor, avgColor, maxColor];
}

/*
 * Helper function to build the params string to pass to the backend
 */
treemap.buildURL = function(color, size, filters) {
    var urlsize = size;
    var urlcolor = color;
    var filtermenu = filters || uiFilter.getSelections();
    var params = "type=treemap&color=" + urlcolor + "&size=" + urlsize + "&" + filtermenu;
    return params;
}

treemap.run = function(root) {

    //console.log(root);

    var margin = {top: 20, right: 10, bottom: 0, left: 0},
        width = 1180 - 80,
        height = 700 - 180 - margin.top - margin.bottom,
        formatNumber = d3.format(",d"),
        transitioning;

    var tmColor = d3.scale.linear()
        .domain([1, 40, 6000])
        .range(["green", "white", "red"]);

    var x = d3.scale.linear()
        .domain([0, width])
        .range([0, width]);

    var y = d3.scale.linear()
        .domain([0, height])
        .range([0, height]);

    var treemap = d3.layout.treemap()
        //.children(function(d, depth) { return depth ? null: d.children; })
        .sort(function(a, b) { return a.size - b.size; })
        .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
        .value(function (d) { return d.size;})
        .round(false);

    var svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.bottom + margin.top)
        .style("margin-left", -margin.left + "px")
        .style("margin.right", -margin.right + "px")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .style("shape-rendering", "crispEdges");

    var grandparent = svg.append("g")
        .attr("class", "grandparent");

    grandparent.append("rect")
        .attr("y", -margin.top)
        .attr("width", width)
        .attr("height", margin.top);

    grandparent.append("text")
        .attr("x", 6)
        .attr("y", 6 - margin.top)
        .attr("dy", ".75em");

    var minMax = getMinMaxColors(root);
    //finally set color domain since we have the data
    tmColor.domain(minMax);

    initialize(root);
    accumulate(root);
    accumulateColor(root);
    layout(root);

    display(root);

    function initialize(root) {
        root.x = root.y = 0;
        root.dx = width;
        root.dy = height;
        root.depth = 0;
    }

    // Aggregate the values for internal nodes. This is normally done by the
    // treemap layout, but not here because of our custom implementation.
    function accumulate(d) {
        return d.children
            ? d.size = d.children.reduce(function(p, v) { return p + accumulate(v); }, 0)
            : d.size;
    }
    function accumulateColor(d) {
        return d.children
            ? d.color = d.children.reduce(function(p, v) { return p + accumulateColor(v); }, 0)
            : parseInt(d.color, 10);
    }

    // Compute the treemap layout recursively such that each group of siblings
    // uses the same size (1×1) rather than the dimensions of the parent cell.
    // This optimizes the layout for the current zoom state. Note that a wrapper
    // object is created for the parent node for each group of siblings so that
    // the parent’s dimensions are not discarded as we recurse. Since each group
    // of sibling was laid out in 1×1, we must rescale to fit using absolute
    // coordinates. This lets us use a viewport to zoom.
    function layout(d) {
        if (d.children) {
            treemap.nodes({children: d.children});
            //console.log(value);
            d.children.forEach(function(c) {
                c.x = d.x + c.x * d.dx;
                c.y = d.y + c.y * d.dy;
                c.dx *= d.dx;
                c.dy *= d.dy;
                c.parent = d;
                c.depth = d.depth + 1;
                layout(c);
            });
        }
    }

    function display(d) {
        grandparent
            .datum(d.parent)
            .on("click", transition)
            .select("text")
            .text(name(d));

        var g1 = svg.insert("g", ".grandparent")
            .datum(d)
            .attr("class", "treemap");

        var g = g1.selectAll("g")
            .data(d.children)
            .enter().append("g");

        g.filter(function(d) { return d.children; })
            .classed("states", true)
            .on("click", transition);

        var g2 = g.selectAll(".states")
            .data(function(d) { return d.children || [d]; })
            .enter()
            .append("g")
            .attr("class", "county");
        var g3 = g2.selectAll(".county")
            .data(function(d) { return d.children || [d]; })
            .enter()
            .append("g")
            .attr("class", "road");
        g3.selectAll(".road")
            .data(function(d) { return d.children || [d]; })
            .enter().append("rect")
            .attr("class", "location")
            .style("fill", function(d) { return tmColor(d.color);} )
            .call(rect);

        g.append("rect")
            .attr("class", "parent")
            .call(rect)
            .append("title")
        //.text(function(d) { return formatNumber(d.value); });

        g.append("text")
            .attr("dy", ".75em")
            .text(function(d) { return d.name; })
            .call(text);

        function transition(d) {
            if (transitioning || !d) return;
            transitioning = true;

            var g2 = display(d),
                t1 = g1.transition().duration(750),
                t2 = g2.transition().duration(750);

            //Update linechart
            linechart.update(); //in linechart.js
            linechartAgg.update(); //in linechart-aggregated.js

            // Update the domain only after entering new elements.
            x.domain([d.x, d.x + d.dx]);
            y.domain([d.y, d.y + d.dy]);
            //TODO: need to update color domain here

            // Enable anti-aliasing during the transition.
            svg.style("shape-rendering", null);

            // Draw child nodes on top of parent nodes.
            //svg.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });

            // Fade-in entering text.
            g2.selectAll("text").style("fill-opacity", 0);

            // Transition to the new view.
            t1.selectAll("text").call(text).style("fill-opacity", 0);
            t2.selectAll("text").call(text).style("fill-opacity", 1);
            t1.selectAll("rect").call(rect);
            t2.selectAll("rect").call(rect);

            // Remove the old node when the transition is finished.
            t1.remove().each("end", function() {
                svg.style("shape-rendering", "crispEdges");
                transitioning = false;
            });

        }

        return g;
    }

    function calccolor(d) {
        return !d.children ? tmColor(d.color) : null;
    }
    function text(text) {
        text.attr("x", function(d) { return x(d.x) + 6; })
            .attr("y", function(d) { return y(d.y) + 6; });
    }

    function rect(rect) {
        rect.attr("x", function(d) { return x(d.x); })
            .attr("y", function(d) { return y(d.y); })
            .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
            .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); });
    }

    function name(d) {
        return d.parent
            ? name(d.parent) + "." + d.name
            : d.name;
    }

    function popup(d) {
        return console.log(d.name);
    }
    
	$("body").css("cursor", "auto");    
}

treemap.initialize = function() {
	//var defaultfilters = "fm=DC@DISTRICT OF COLUMBIA@I-395&fm=DC@DISTRICT OF COLUMBIA@I-395 HOV&fm=DC@DISTRICT OF COLUMBIA@I-66&fm=MD@ALLEGANY@I-68&fm=MD@ANNE ARUNDEL@I-195&fm=MD@ANNE ARUNDEL@I-695&fm=MD@ANNE ARUNDEL@I-895&fm=MD@ANNE ARUNDEL@I-895 Spur&fm=MD@ANNE ARUNDEL@I-97&fm=MD@ANNE ARUNDEL@US-50&fm=MD@BALTIMORE@I-195&fm=MD@BALTIMORE@I-695&fm=MD@BALTIMORE@I-70&fm=MD@BALTIMORE@I-795&fm=MD@BALTIMORE@I-83&fm=MD@BALTIMORE@I-895&fm=MD@BALTIMORE@I-95&fm=MD@CARROLL@I-70&fm=MD@CECIL@I-95&fm=MD@DORCHESTER@US-50&fm=MD@FREDERICK@I-270&fm=MD@FREDERICK@I-70&fm=MD@GARRETT@I-68&fm=MD@HARFORD@I-95&fm=MD@HOWARD@I-70&fm=MD@HOWARD@I-895&fm=MD@HOWARD@I-95&fm=MD@MONTGOMERY@I-270&fm=MD@MONTGOMERY@I-270 Spur&fm=MD@MONTGOMERY@I-370&fm=MD@MONTGOMERY@I-495&fm=MD@TALBOT@US-50&fm=MD@WASHINGTON@I-68&fm=MD@WASHINGTON@I-70&fm=MD@WASHINGTON@I-81&fm=MD@WICOMICO@US-50&fm=MD@WORCESTER@US-50&fm=VA@ALEXANDRIA@I-395&fm=VA@ALEXANDRIA@I-395 HOV&fm=VA@ALEXANDRIA@I-495&fm=VA@ARLINGTON@I-395&fm=VA@ARLINGTON@I-395 HOV&fm=VA@ARLINGTON@I-66&fm=VA@CAROLINE@I-95&fm=VA@CHESAPEAKE@I-264&fm=VA@CHESAPEAKE@I-464&fm=VA@CHESAPEAKE@I-64&fm=VA@CHESAPEAKE@I-664&fm=VA@CHESTERFIELD@I-295&fm=VA@CHESTERFIELD@I-95&fm=VA@COLONIAL HEIGHTS@I-95&fm=VA@EMPORIA@I-95&fm=VA@FAIRFAX@I-395&fm=VA@FAIRFAX@I-395 HOV&fm=VA@FAIRFAX@I-495&fm=VA@FAIRFAX@I-66&fm=VA@FAIRFAX@I-95&fm=VA@FAIRFAX@I-95 HOV&fm=VA@FREDERICKSBURG@I-95&fm=VA@GOOCHLAND@I-64&fm=VA@GREENSVILLE@I-95&fm=VA@HAMPTON@I-64&fm=VA@HAMPTON@I-664&fm=VA@HANOVER@I-295&fm=VA@HANOVER@I-95&fm=VA@HENRICO@I-295&fm=VA@HENRICO@I-64&fm=VA@HENRICO@I-95&fm=VA@HOPEWELL@I-295&fm=VA@JAMES CITY@I-64&fm=VA@MECKLENBURG@I-85&fm=VA@NEW KENT@I-64&fm=VA@NEWPORT NEWS@I-64&fm=VA@NEWPORT NEWS@I-664&fm=VA@NORFOLK@I-264&fm=VA@NORFOLK@I-464&fm=VA@NORFOLK@I-564&fm=VA@NORFOLK@I-64&fm=VA@PETERSBURG@I-95&fm=VA@PORTSMOUTH@I-264&fm=VA@PRINCE GEORGE@I-295&fm=VA@PRINCE GEORGE@I-95&fm=VA@PRINCE WILLIAM@I-66&fm=VA@PRINCE WILLIAM@I-95&fm=VA@PRINCE WILLIAM@I-95 HOV&fm=VA@RICHMOND@I-195&fm=VA@RICHMOND@I-64&fm=VA@RICHMOND@I-95&fm=VA@SPOTSYLVANIA@I-95&fm=VA@STAFFORD@I-95&fm=VA@SUFFOLK@I-664&fm=VA@SUSSEX@I-95&fm=VA@VIRGINIA BEACH@I-264&fm=VA@VIRGINIA BEACH@I-64&fm=VA@YORK@I-64";
	//var defaultfilters = "fm=DC@DISTRICT OF COLUMBIA@I-395&fm=DC@DISTRICT OF COLUMBIA@I-395 HOV&fm=DC@DISTRICT OF COLUMBIA@I-66&fm=DE@NEW CASTLE@I-95&fm=GA@CHATHAM@I-95&fm=MD@ALLEGANY@I-68&fm=MD@ANNE ARUNDEL@I-195&fm=MD@ANNE ARUNDEL@I-695&fm=MD@ANNE ARUNDEL@I-895&fm=MD@ANNE ARUNDEL@I-895 Spur&fm=MD@ANNE ARUNDEL@I-97&fm=MD@ANNE ARUNDEL@US-50&fm=MD@BALTIMORE@I-195&fm=MD@BALTIMORE@I-695&fm=MD@BALTIMORE@I-70&fm=MD@BALTIMORE@I-795&fm=MD@BALTIMORE@I-83&fm=MD@BALTIMORE@I-895&fm=MD@BALTIMORE@I-95&fm=MD@CARROLL@I-70&fm=MD@CECIL@I-95&fm=MD@DORCHESTER@US-50&fm=MD@FREDERICK@I-270&fm=MD@FREDERICK@I-70&fm=MD@GARRETT@I-68&fm=MD@HARFORD@I-95&fm=MD@HOWARD@I-70&fm=MD@HOWARD@I-895&fm=MD@HOWARD@I-95&fm=MD@MONTGOMERY@I-270&fm=MD@MONTGOMERY@I-270 Spur&fm=MD@MONTGOMERY@I-370&fm=MD@MONTGOMERY@I-495&fm=MD@PRINCE GEORGE@I-295&fm=MD@PRINCE GEORGE@I-495&fm=MD@PRINCE GEORGE@I-95&fm=MD@PRINCE GEORGE@US-50&fm=MD@QUEEN ANNE@US-50&fm=MD@TALBOT@US-50&fm=MD@WASHINGTON@I-68&fm=MD@WASHINGTON@I-70&fm=MD@WASHINGTON@I-81&fm=MD@WICOMICO@US-50&fm=MD@WORCESTER@US-50&fm=NC@ALAMANCE@I-85&fm=NC@BUNCOMBE@I-240&fm=NC@BUNCOMBE@I-26&fm=NC@BUNCOMBE@I-40&fm=NC@BURKE@I-40&fm=NC@CABARRUS@I-85&fm=NC@CATAWBA@I-40&fm=NC@CLEVELAND@I-85&fm=NC@CUMBERLAND@I-95&fm=NC@CUMBERLAND@I-95 Bus&fm=NC@DAVIDSON@I-85&fm=NC@DAVIDSON@I-85 Bus&fm=NC@DAVIE@I-40&fm=NC@DUPLIN@I-40&fm=NC@DURHAM@I-40&fm=NC@DURHAM@I-540&fm=NC@DURHAM@I-85&fm=NC@FORSYTH@I-40&fm=NC@FORSYTH@I-40 Bus&fm=NC@GASTON@I-85&fm=NC@GRANVILLE@I-85&fm=NC@GUILFORD@I-40&fm=NC@GUILFORD@I-40 Bus&fm=NC@GUILFORD@I-73&fm=NC@GUILFORD@I-840&fm=NC@GUILFORD@I-85&fm=NC@GUILFORD@I-85 Bus&fm=NC@HALIFAX@I-95&fm=NC@HARNETT@I-95&fm=NC@HAYWOOD@I-40&fm=NC@HENDERSON@I-26&fm=NC@IREDELL@I-40&fm=NC@IREDELL@I-77&fm=NC@JOHNSTON@I-40&fm=NC@JOHNSTON@I-95&fm=NC@MADISON@I-26&fm=NC@MCDOWELL@I-40&fm=NC@MECKLENBURG@I-277&fm=NC@MECKLENBURG@I-485&fm=NC@MECKLENBURG@I-77&fm=NC@MECKLENBURG@I-85&fm=NC@MONTGOMERY@I-73/I-74&fm=NC@NASH@I-95&fm=NC@NEW HANOVER@I-40&fm=NC@NORTHAMPTON@I-95&fm=NC@ORANGE@I-40&fm=NC@ORANGE@I-85&fm=NC@ORANGE@I-85/US-70&fm=NC@PENDER@I-40&fm=NC@POLK@I-26&fm=NC@RANDOLPH@I-73&fm=NC@RANDOLPH@I-73/I-74&fm=NC@RANDOLPH@I-85&fm=NC@RANDOLPH@I-85 Bus&fm=NC@ROBESON@I-95&fm=NC@ROWAN@I-85&fm=NC@SAMPSON@I-40&fm=NC@SURRY@I-74&fm=NC@SURRY@I-77&fm=NC@VANCE@I-85&fm=NC@WAKE@I-40&fm=NC@WAKE@I-440&fm=NC@WAKE@I-540&fm=NC@WARREN@I-85&fm=NC@WAYNE@I-795&fm=NC@WILSON@I-795&fm=NC@WILSON@I-95&fm=NC@YADKIN@I-77&fm=SC@AIKEN@I-20&fm=SC@ANDERSON@I-85&fm=SC@BERKELEY@I-26&fm=SC@BERKELEY@I-526&fm=SC@CALHOUN@I-26&fm=SC@CHARLESTON@I-26&fm=SC@CHARLESTON@I-526&fm=SC@CHEROKEE@I-85&fm=SC@CHESTER@I-77&fm=SC@CLARENDON@I-95&fm=SC@COLLETON@I-95&fm=SC@DARLINGTON@I-20&fm=SC@DILLON@I-95&fm=SC@DORCHESTER@I-26&fm=SC@DORCHESTER@I-95&fm=SC@FAIRFIELD@I-77&fm=SC@FLORENCE@I-20&fm=SC@FLORENCE@I-95&fm=SC@GREENVILLE@I-185&fm=SC@GREENVILLE@I-385&fm=SC@GREENVILLE@I-85&fm=SC@HAMPTON@I-95&fm=SC@JASPER@I-95&fm=SC@KERSHAW@I-20&fm=SC@LAURENS@I-26&fm=SC@LAURENS@I-385&fm=SC@LEE@I-20&fm=SC@LEXINGTON@I-20&fm=SC@LEXINGTON@I-26&fm=SC@LEXINGTON@I-77&fm=SC@NEWBERRY@I-26&fm=SC@OCONEE@I-85&fm=SC@ORANGEBURG@I-26&fm=SC@ORANGEBURG@I-95&fm=SC@RICHLAND@I-20&fm=SC@RICHLAND@I-26&fm=SC@RICHLAND@I-77&fm=SC@SPARTANBURG@I-26&fm=SC@SPARTANBURG@I-585&fm=SC@SPARTANBURG@I-85&fm=SC@SPARTANBURG@I-85 Bus&fm=SC@SUMTER@I-95&fm=SC@YORK@I-77&fm=VA@ALEXANDRIA@I-395&fm=VA@ALEXANDRIA@I-395 HOV&fm=VA@ALEXANDRIA@I-495&fm=VA@ARLINGTON@I-395&fm=VA@ARLINGTON@I-395 HOV&fm=VA@ARLINGTON@I-66&fm=VA@CAROLINE@I-95&fm=VA@CHESAPEAKE@I-264&fm=VA@CHESAPEAKE@I-464&fm=VA@CHESAPEAKE@I-64&fm=VA@CHESAPEAKE@I-664&fm=VA@CHESTERFIELD@I-295&fm=VA@CHESTERFIELD@I-95&fm=VA@COLONIAL HEIGHTS@I-95&fm=VA@EMPORIA@I-95&fm=VA@FAIRFAX@I-395&fm=VA@FAIRFAX@I-395 HOV&fm=VA@FAIRFAX@I-495&fm=VA@FAIRFAX@I-66&fm=VA@FAIRFAX@I-95&fm=VA@FAIRFAX@I-95 HOV&fm=VA@FREDERICKSBURG@I-95&fm=VA@GOOCHLAND@I-64&fm=VA@GREENSVILLE@I-95&fm=VA@HAMPTON@I-64&fm=VA@HAMPTON@I-664&fm=VA@HANOVER@I-295&fm=VA@HANOVER@I-95&fm=VA@HENRICO@I-295&fm=VA@HENRICO@I-64&fm=VA@HENRICO@I-95&fm=VA@HOPEWELL@I-295&fm=VA@JAMES CITY@I-64&fm=VA@MECKLENBURG@I-85&fm=VA@NEW KENT@I-64&fm=VA@NEWPORT NEWS@I-64&fm=VA@NEWPORT NEWS@I-664&fm=VA@NORFOLK@I-264&fm=VA@NORFOLK@I-464&fm=VA@NORFOLK@I-564&fm=VA@NORFOLK@I-64&fm=VA@PETERSBURG@I-95&fm=VA@PORTSMOUTH@I-264&fm=VA@PRINCE GEORGE@I-295&fm=VA@PRINCE GEORGE@I-95&fm=VA@PRINCE WILLIAM@I-66&fm=VA@PRINCE WILLIAM@I-95&fm=VA@PRINCE WILLIAM@I-95 HOV&fm=VA@RICHMOND@I-195&fm=VA@RICHMOND@I-64&fm=VA@RICHMOND@I-95&fm=VA@SPOTSYLVANIA@I-95&fm=VA@STAFFORD@I-95&fm=VA@SUFFOLK@I-664&fm=VA@SUSSEX@I-95&fm=VA@VIRGINIA BEACH@I-264&fm=VA@VIRGINIA BEACH@I-64&fm=VA@YORK@I-64";
	
	//Set some reasonable defaults
	var defaultcolor = "duration";
	var defaultsize = "length";
	
	uiTreeMap.setSize(defaultsize);
	uiTreeMap.setColor(defaultcolor);

	treemap.update();
}

/*
 * Container for now to do treemap updating from the UI
 * Currently, we are simply deleting the treemap and recreating the svg, but we
 * should use the update() function within d3 to update these lines instead. Will
 * need a new transition function for that.
 */
treemap.update = function() {
    var newfilters = uiFilter.getSelections();
    var newsize = uiTreeMap.getSize();
    var newcolor = uiTreeMap.getColor();

    var newTreemapUrl = backendurl + "/traffic-trender/worker";
    var data = treemap.buildURL(newcolor,newsize,newfilters);

	$("body").css("cursor", "wait");

    $("#chart svg").remove();
    //d3.json(newTreemapUrl, treemap.run);
    $.ajax({
        url: newTreemapUrl,
        type: 'POST',
        data: data,
        dataType: 'json',
        success: treemap.run
    });
}
