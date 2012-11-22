/* javascript to create the treemap */

var margin = {top: 20, right: 10, bottom: 0, left: 0},
    width = 1280 - 80,
    height = 800 - 180 - margin.top - margin.bottom,
    formatNumber = d3.format(",d"),
    transitioning;

var color = d3.scale.linear()
    .domain([1, 40000, 600000])
    .range(["green", "white", "red"]);

var x = d3.scale.linear()
    .domain([0, width])
    .range([0, width]);

var y = d3.scale.linear()
    .domain([0, height])
    .range([0, height]);

var treemap = d3.layout.treemap()
    //.children(function(d, depth) { return depth ? null: d.children; })
    .sort(function(a, b) { return a.value - b.value; })
    .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
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

//var url = "backend/sources/treemap_source_data_mod.json";
var url = "http://172.16.98.145/traffic-trender/worker?type=treemap&color=impactFactor&size=duration&filtermenu=DC@DISTRICT OF COLUMBIA@I-395&filtermenu=DC@DISTRICT OF COLUMBIA@I-395 HOV&filtermenu=DC@DISTRICT OF COLUMBIA@I-66&filtermenu=MD@ALLEGANY@I-68&filtermenu=MD@ANNE ARUNDEL@I-195&filtermenu=MD@ANNE ARUNDEL@I-695&filtermenu=MD@ANNE ARUNDEL@I-895&filtermenu=MD@ANNE ARUNDEL@I-895 Spur&filtermenu=MD@ANNE ARUNDEL@I-97&filtermenu=MD@ANNE ARUNDEL@US-50&filtermenu=MD@BALTIMORE@I-195&filtermenu=MD@BALTIMORE@I-695&filtermenu=MD@BALTIMORE@I-70&filtermenu=MD@BALTIMORE@I-795&filtermenu=MD@BALTIMORE@I-83&filtermenu=MD@BALTIMORE@I-895&filtermenu=MD@BALTIMORE@I-95&filtermenu=MD@CARROLL@I-70&filtermenu=MD@CECIL@I-95&filtermenu=MD@DORCHESTER@US-50&filtermenu=MD@FREDERICK@I-270&filtermenu=MD@FREDERICK@I-70&filtermenu=MD@GARRETT@I-68&filtermenu=MD@HARFORD@I-95&filtermenu=MD@HOWARD@I-70&filtermenu=MD@HOWARD@I-895&filtermenu=MD@HOWARD@I-95&filtermenu=MD@MONTGOMERY@I-270&filtermenu=MD@MONTGOMERY@I-270 Spur&filtermenu=MD@MONTGOMERY@I-370&filtermenu=MD@MONTGOMERY@I-495&filtermenu=MD@TALBOT@US-50&filtermenu=MD@WASHINGTON@I-68&filtermenu=MD@WASHINGTON@I-70&filtermenu=MD@WASHINGTON@I-81&filtermenu=MD@WICOMICO@US-50&filtermenu=MD@WORCESTER@US-50&filtermenu=VA@ALEXANDRIA@I-395&filtermenu=VA@ALEXANDRIA@I-395 HOV&filtermenu=VA@ALEXANDRIA@I-495&filtermenu=VA@ARLINGTON@I-395&filtermenu=VA@ARLINGTON@I-395 HOV&filtermenu=VA@ARLINGTON@I-66&filtermenu=VA@CAROLINE@I-95&filtermenu=VA@CHESAPEAKE@I-264&filtermenu=VA@CHESAPEAKE@I-464&filtermenu=VA@CHESAPEAKE@I-64&filtermenu=VA@CHESAPEAKE@I-664&filtermenu=VA@CHESTERFIELD@I-295&filtermenu=VA@CHESTERFIELD@I-95&filtermenu=VA@COLONIAL HEIGHTS@I-95&filtermenu=VA@EMPORIA@I-95&filtermenu=VA@FAIRFAX@I-395&filtermenu=VA@FAIRFAX@I-395 HOV&filtermenu=VA@FAIRFAX@I-495&filtermenu=VA@FAIRFAX@I-66&filtermenu=VA@FAIRFAX@I-95&filtermenu=VA@FAIRFAX@I-95 HOV&filtermenu=VA@FREDERICKSBURG@I-95&filtermenu=VA@GOOCHLAND@I-64&filtermenu=VA@GREENSVILLE@I-95&filtermenu=VA@HAMPTON@I-64&filtermenu=VA@HAMPTON@I-664&filtermenu=VA@HANOVER@I-295&filtermenu=VA@HANOVER@I-95&filtermenu=VA@HENRICO@I-295&filtermenu=VA@HENRICO@I-64&filtermenu=VA@HENRICO@I-95&filtermenu=VA@HOPEWELL@I-295&filtermenu=VA@JAMES CITY@I-64&filtermenu=VA@MECKLENBURG@I-85&filtermenu=VA@NEW KENT@I-64&filtermenu=VA@NEWPORT NEWS@I-64&filtermenu=VA@NEWPORT NEWS@I-664&filtermenu=VA@NORFOLK@I-264&filtermenu=VA@NORFOLK@I-464&filtermenu=VA@NORFOLK@I-564&filtermenu=VA@NORFOLK@I-64&filtermenu=VA@PETERSBURG@I-95&filtermenu=VA@PORTSMOUTH@I-264&filtermenu=VA@PRINCE GEORGE@I-295&filtermenu=VA@PRINCE GEORGE@I-95&filtermenu=VA@PRINCE WILLIAM@I-66&filtermenu=VA@PRINCE WILLIAM@I-95&filtermenu=VA@PRINCE WILLIAM@I-95 HOV&filtermenu=VA@RICHMOND@I-195&filtermenu=VA@RICHMOND@I-64&filtermenu=VA@RICHMOND@I-95&filtermenu=VA@SPOTSYLVANIA@I-95&filtermenu=VA@STAFFORD@I-95&filtermenu=VA@SUFFOLK@I-664&filtermenu=VA@SUSSEX@I-95&filtermenu=VA@VIRGINIA BEACH@I-264&filtermenu=VA@VIRGINIA BEACH@I-64&filtermenu=VA@YORK@I-64";
//var url = "flare.json";

var runTreemap = function(root) {

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
            ? d.value = d.children.reduce(function(p, v) { return p + accumulate(v); }, 0)
            : d.value;
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
            .style("fill", function(d) { return color(d.color);} )
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

            var url = "backend/sources/trends_revise2.json";
            d3.json(url, runLinechart);
            console.log(runLinechart);

            // Update the domain only after entering new elements.
            x.domain([d.x, d.x + d.dx]);
            y.domain([d.y, d.y + d.dy]);

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
        return !d.children ? color(d.color) : null;
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

d3.json(url, runTreemap);

