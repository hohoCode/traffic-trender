// Line Graph Panel UI script

// Contributors:
// Richard B. Johnson, Chris Musialek

var uiLineChart = uiLineChart || {}; // namespace

uiLineChart.init = function(){
    $("#uiLineChartPanel").panel({
        stackable:true
    });

    $("input:radio[name=uiGraphSettingGroup]").click(uiLineChart.apply);
    $("#uiLineChart_impactFactorLabel").click(uiLineChart.update);
    $("#uiLineChart_maximumLengthLabel").click(uiLineChart.update);
    $("#uiLineChart_timeLabel").click(uiLineChart.update);
}

uiLineChart.update = function() {
	labelID = $(this).attr("id");
	radioID = labelID.replace(/Label/,"");
	
	$("#"+radioID).attr("checked", true);
	
	uiLineChart.apply();
}

uiLineChart.apply = function() {
    linechart.update();
    linechartAgg.update();
}

uiLineChart.getSelection = function() {
	return $("input:radio[name=uiGraphSettingGroup]:checked").val();
}

uiLineChart.setSelection = function(val) {
    $("input:radio[value="+val+"]").attr("checked", true);
}
