/*
 * javascript to create and update the treemap
 * @author Chris Musialek
 * @date 11/25/12
 * */

//TODO: recreate using a recursive function or something innate to js, this is hardcoded to our hierarchy
var getMinMaxColors = function(root) {
    var minColor = Number.MAX_VALUE, maxColor = Number.MIN_VALUE, avgColor = Number.MIN_VALUE;

    var colorSum = 0, colorNum = 0;
    root.children.forEach(function (d) {
        d.children.forEach(function (e) {
            e.children.forEach(function (f) {
                cur = parseInt(f.color, 10);
                colorSum += cur;
                colorNum += 1;
                if(cur > maxColor){
                    maxColor = cur;
                } else if(cur<minColor) {
                    minColor = cur;
                }
            })

        })
    });

    avgColor = colorSum/colorNum;

    return [minColor, avgColor, maxColor];
}

/*
 * Helper function to build the url to pass to the backend
 */
var buildTreemapURL = function(color, size, filters) {
    var urlcolor = uiTreeMap.translate(color);
    var urlsize = uiTreeMap.translate(size);
    var filtermenu = filters || uiFilter.getFilterSelections();
    var url = backendurl + "/traffic-trender/worker?type=treemap&color=" + urlcolor + "&size=" + urlsize + "&" + filtermenu;
    return url;
}

var runTreemap = function(root) {

    var margin = {top: 20, right: 10, bottom: 0, left: 0},
        width = 1280 - 80,
        height = 800 - 180 - margin.top - margin.bottom,
        formatNumber = d3.format(",d"),
        transitioning;

    var tmColor = d3.scale.linear()
        .domain([1, 40, 6000])
        .range(["green", "black", "red"]);

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
            updateLinechart(); //in uiLineGraph.js

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
}

//Set some reasonable defaults
var defaultcolor = "duration";
var defaultsize = "length";
var defaultfilters = "filtermenu=DC@DISTRICT OF COLUMBIA@I-395&filtermenu=DC@DISTRICT OF COLUMBIA@I-395 HOV&filtermenu=DC@DISTRICT OF COLUMBIA@I-66&filtermenu=MD@ALLEGANY@I-68&filtermenu=MD@ANNE ARUNDEL@I-195&filtermenu=MD@ANNE ARUNDEL@I-695&filtermenu=MD@ANNE ARUNDEL@I-895&filtermenu=MD@ANNE ARUNDEL@I-895 Spur&filtermenu=MD@ANNE ARUNDEL@I-97&filtermenu=MD@ANNE ARUNDEL@US-50&filtermenu=MD@BALTIMORE@I-195&filtermenu=MD@BALTIMORE@I-695&filtermenu=MD@BALTIMORE@I-70&filtermenu=MD@BALTIMORE@I-795&filtermenu=MD@BALTIMORE@I-83&filtermenu=MD@BALTIMORE@I-895&filtermenu=MD@BALTIMORE@I-95&filtermenu=MD@CARROLL@I-70&filtermenu=MD@CECIL@I-95&filtermenu=MD@DORCHESTER@US-50&filtermenu=MD@FREDERICK@I-270&filtermenu=MD@FREDERICK@I-70&filtermenu=MD@GARRETT@I-68&filtermenu=MD@HARFORD@I-95&filtermenu=MD@HOWARD@I-70&filtermenu=MD@HOWARD@I-895&filtermenu=MD@HOWARD@I-95&filtermenu=MD@MONTGOMERY@I-270&filtermenu=MD@MONTGOMERY@I-270 Spur&filtermenu=MD@MONTGOMERY@I-370&filtermenu=MD@MONTGOMERY@I-495&filtermenu=MD@TALBOT@US-50&filtermenu=MD@WASHINGTON@I-68&filtermenu=MD@WASHINGTON@I-70&filtermenu=MD@WASHINGTON@I-81&filtermenu=MD@WICOMICO@US-50&filtermenu=MD@WORCESTER@US-50&filtermenu=VA@ALEXANDRIA@I-395&filtermenu=VA@ALEXANDRIA@I-395 HOV&filtermenu=VA@ALEXANDRIA@I-495&filtermenu=VA@ARLINGTON@I-395&filtermenu=VA@ARLINGTON@I-395 HOV&filtermenu=VA@ARLINGTON@I-66&filtermenu=VA@CAROLINE@I-95&filtermenu=VA@CHESAPEAKE@I-264&filtermenu=VA@CHESAPEAKE@I-464&filtermenu=VA@CHESAPEAKE@I-64&filtermenu=VA@CHESAPEAKE@I-664&filtermenu=VA@CHESTERFIELD@I-295&filtermenu=VA@CHESTERFIELD@I-95&filtermenu=VA@COLONIAL HEIGHTS@I-95&filtermenu=VA@EMPORIA@I-95&filtermenu=VA@FAIRFAX@I-395&filtermenu=VA@FAIRFAX@I-395 HOV&filtermenu=VA@FAIRFAX@I-495&filtermenu=VA@FAIRFAX@I-66&filtermenu=VA@FAIRFAX@I-95&filtermenu=VA@FAIRFAX@I-95 HOV&filtermenu=VA@FREDERICKSBURG@I-95&filtermenu=VA@GOOCHLAND@I-64&filtermenu=VA@GREENSVILLE@I-95&filtermenu=VA@HAMPTON@I-64&filtermenu=VA@HAMPTON@I-664&filtermenu=VA@HANOVER@I-295&filtermenu=VA@HANOVER@I-95&filtermenu=VA@HENRICO@I-295&filtermenu=VA@HENRICO@I-64&filtermenu=VA@HENRICO@I-95&filtermenu=VA@HOPEWELL@I-295&filtermenu=VA@JAMES CITY@I-64&filtermenu=VA@MECKLENBURG@I-85&filtermenu=VA@NEW KENT@I-64&filtermenu=VA@NEWPORT NEWS@I-64&filtermenu=VA@NEWPORT NEWS@I-664&filtermenu=VA@NORFOLK@I-264&filtermenu=VA@NORFOLK@I-464&filtermenu=VA@NORFOLK@I-564&filtermenu=VA@NORFOLK@I-64&filtermenu=VA@PETERSBURG@I-95&filtermenu=VA@PORTSMOUTH@I-264&filtermenu=VA@PRINCE GEORGE@I-295&filtermenu=VA@PRINCE GEORGE@I-95&filtermenu=VA@PRINCE WILLIAM@I-66&filtermenu=VA@PRINCE WILLIAM@I-95&filtermenu=VA@PRINCE WILLIAM@I-95 HOV&filtermenu=VA@RICHMOND@I-195&filtermenu=VA@RICHMOND@I-64&filtermenu=VA@RICHMOND@I-95&filtermenu=VA@SPOTSYLVANIA@I-95&filtermenu=VA@STAFFORD@I-95&filtermenu=VA@SUFFOLK@I-664&filtermenu=VA@SUSSEX@I-95&filtermenu=VA@VIRGINIA BEACH@I-264&filtermenu=VA@VIRGINIA BEACH@I-64&filtermenu=VA@YORK@I-64";
var url = buildTreemapURL(defaultcolor, defaultsize, defaultfilters);

//Actually draw the default treemap
d3.json(url, runTreemap);


/*
 * Container for now to do treemap updating from the UI
 * Currently, we are simply deleting the treemap and recreating the svg, but we
 * should use the update() function within d3 to update these lines instead. Will
 * need a new transition function for that.
 */
var updateTreemap = function() {
    var newfilters = uiFilter.getFilterSelections();
    var newsize = $("#uiTreeMap_size").val();
    var newcolor = $("#uiTreeMap_color").val();

    var newTreemapUrl = buildTreemapURL(newcolor, newsize, newfilters);

    $("#chart svg").remove();
    d3.json(newTreemapUrl, runTreemap);
}

