// Tree Map Panel UI script

// Contributors:
// Richard B. Johnson

var uiLineGraph = uiLineGraph || {}; // namespace

uiLineGraph.init = function(){
    $("#uiLineGraphPanel").panel({
        stackable:true
    });
    
    $("#uiLineGraph_applyButton").click(uiLineGraph.apply);
}

uiLineGraph.apply = function() {
	obj = $("input:radio[name=uiGraphSettingGroup]:checked");
	sel = obj.val();
	
	console.log( sel );
	
	/* update line graph here */
}
