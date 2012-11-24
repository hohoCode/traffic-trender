// Tree Map Panel UI script

// Contributors:
// Richard B. Johnson

var uiLineGraph = uiLineGraph || {}; // namespace

uiLineGraph.init = function(){
    $("#uiLineGraphPanel").panel({
        stackable:true
    });
    
    $("input:radio[name=uiGraphSettingGroup]").click(uiLineGraph.apply);
}

uiLineGraph.apply = function() {
	sel = $(this).val();
	
	console.log( sel );
	
	/* update line graph here */
}
