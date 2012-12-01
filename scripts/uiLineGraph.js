// Line Graph Panel UI script

// Contributors:
// Richard B. Johnson, Chris Musialek

var uiLineGraph = uiLineGraph || {}; // namespace

uiLineGraph.init = function(){
    $("#uiLineGraphPanel").panel({
        stackable:true
    });

    $("input:radio[name=uiGraphSettingGroup]").click(uiLineGraph.apply);
    $("#uiLineGraph_impactFactorLabel").click(uiLineGraph.update);
    $("#uiLineGraph_maximumLengthLabel").click(uiLineGraph.update);
    $("#uiLineGraph_timeLabel").click(uiLineGraph.update);
    //$("#uiLineGraph_applyButton").click(uiLineGraph.apply);
}

uiLineGraph.update = function() {
	labelID = $(this).attr("id");
	radioID = labelID.replace(/Label/,"");
	
	$("#"+radioID).attr("checked", true);
	
	uiLineGraph.apply();
}

uiLineGraph.apply = function() {
    linechart.update();
    linechartAgg.update();
}

uiLineGraph.getSelection = function() {
	return $("input:radio[name=uiGraphSettingGroup]:checked").val();
}

uiLineGraph.setSelection = function(val) {
    $("input:radio[value="+val+"]").attr("checked", true);
}
