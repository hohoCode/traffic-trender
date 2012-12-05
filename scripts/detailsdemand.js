/**
 * Provides javascript functionality for details on demand div
 * @authors Chris Musialek
 * @date 12/2/12
 *
 */

var dod = dod || {}; // namespace

dod.initialize = function() {
    for (var i=0; i<24; i++) {
        $("#dodvalues").append("<tr class='detailedtext'><td></td><td></td></tr>");
    }
}

dod.showDetailsOnDemand = function(d) {
    $("#details").css("opacity", 1);
    $("td.name").text(d.name);
    $("td.size").text(d.size);
    $("td.color").text(d.color);
}

dod.showLineChartDetails = function(d) {
    $("#details").css("opacity", 1);
    $("#dodvalues").css("opacity", 1);
    $("td.tdlocation").text(d.name);

    var rows = $("#dodvalues tr:gt(0)");
    var data = d.bottlenecks;

    for (var i=0; i<data.length; i++) {
        var tdDate = rows[i].children[0];
        var tdValue = rows[i].children[1];
        var monthyear = dod.month[data[i].date.getMonth()] + "-" + data[i].date.getFullYear();
        $(tdDate).text(monthyear);
        $(tdValue).text(data[i].value);
    };
}

dod.hideLineChartDetails = function(d) {
    $("#dodvalues").css("opacity", 0);
    var rows = $("#dodvalues tr:gt(0)");
    var data = d.bottlenecks;

    for (var i=0; i<data.length; i++) {
        var tdDate = rows[i].children[0];
        var tdValue = rows[i].children[1];
        var monthyear = dod.month[data[i].date.getMonth()] + "-" + data[i].date.getFullYear();
        $(tdDate).text("");
        $(tdValue).text("");
    };
}

dod.month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];