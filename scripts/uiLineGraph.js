// Tree Map Panel UI script

// Contributors:
// Richard B. Johnson

var uiLineGraph = uiLineGraph || {}; // namespace

$(document).ready(function(){
    $("#uiLineGraphPanel").panel({
        stackable:true
    });
    
    $("#uiLineGraph_impactFactor").change(uiTreeMap.change);
    $("#uiLineGraph_maximumLength").change(uiTreeMap.change);
    $("#uiLineGraph_time").change(uiTreeMap.change);
});

uiTreeMap.change = function() {
	rb1 = $("#uiTreeMap_impactFactor").val();
	rb2 = $("#uiTreeMap_maximumLength").val();
	rb3 = $("#uiTreeMap_time").val();
	
	/* update line graph here */
}
