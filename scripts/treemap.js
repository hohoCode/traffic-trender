/* javascript to create the treemap */

var margin = {top: 20, right: 0, bottom: 0, left: 0};
var width = 960, height = 500 - margin.top - margin.bottom;
var formatNumber = d3.format(",d");
var transitioning;

//var color = d3.scale.category20c();
var color = d3.scale.linear()
    .domain([1, 500000])
    .range(["green", "red"]);
//d3.interpolate("red", "green"))

var x = d3.scale.linear()
    .domain([0, width])
    .range([0, width]);

var y = d3.scale.linear()
    .domain([0, height])
    .range([0, height]);

var treemap = d3.layout.treemap()
    //.children(function(d, depth) { return depth ? null : d.children; })
    .sort(function(a, b) { return a.size - b.size; })
    .size([width, height])
    .value(function(d) { return d.size; })
    .padding(1)
    //.ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
    .round(false);

var svg = d3.select("#body")
    //.append("div")
    //.attr("class", "chart")
    //.attr("width", width + margin.left + margin.right)
    //.attr("height", height + margin.bottom + margin.top)
    //.style("margin-left", -margin.left + "px")
    //.style("margin.right", -margin.right + "px")
    .append("svg:svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.bottom + margin.top)
    .append("svg:g")
    .attr("transform", "translate(.5,.5)");


function mylocation(d) {
    return d.name
};

d3.json("./backend/sources/treemap_source_data.json", function(data) {

        node = root = data;
        var nodes = treemap.nodes(root)
            //.filter(function(d) { return !d.children; });
        var cell = svg.selectAll("g")
            .data(nodes)
            .enter().append("svg:g")
            .attr("class", "cell")
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
            .on("click", function(d) { return zoom(node == d.parent ? root : d.parent); });
        cell.append("svg:rect")
            .attr("width", function(d) { return d.dx - 1; })
            .attr("height", function(d) { return d.dy - 1; })
            .style("fill", function(d) { return d.children ? null : color(d.color); });
        cell.append("svg:text")
            .attr("x", function(d) { return d.dx / 2; })
            .attr("y", function(d) { return d.dy / 2; })
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .text(function(d) { return d.children ? d.name : null; });
            //.style("opacity", function(d) { d.w = this.getComputedTextLength(); return d.dx > d.w ? 1 : 0; });
        d3.select(window).on("click", function() { zoom(root); });
        d3.select("select").on("change", function() {
            treemap.value(this.value == "size" ? size : count).nodes(root);
            zoom(node);
        });
    });

    function size(d) {
        return d.size;
    }

    function count(d) {
        return 1;
    }

    function zoom(d) {
        console.log(d);
        var kx = width / d.dx, ky = height / d.dy;
        x.domain([d.x, d.x + d.dx]);
        y.domain([d.y, d.y + d.dy]);
        var t = svg.selectAll("g.cell").transition()
            .duration(d3.event.altKey ? 7500 : 750)
            .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });
        t.select("rect")
            .attr("width", function(d) { return kx * d.dx - 1; })
            .attr("height", function(d) { return ky * d.dy - 1; })
        t.select("text")
            .attr("x", function(d) { return kx * d.dx / 2; })
            .attr("y", function(d) { return ky * d.dy / 2; })
            .style("opacity", function(d) { return kx * d.dx > d.w ? 1 : 0; });
        node = d;
        d3.event.stopPropagation();
    }


