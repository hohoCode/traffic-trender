// Tree Map Panel UI script

// Contributors:
// Richard B. Johnson

var uiTreeMap = uiTreeMap || {}; // namespace

uiTreeMap.init = function() {
    $("#uiTreeMapPanel").panel({
        stackable:true
    });
    
    $("#uiTreeMap_applyButton").click(uiTreeMap.apply);    
}

uiTreeMap.apply = function() {
	size = $("#uiTreeMap_size").val();
	color = $("#uiTreeMap_color").val();
	
    console.log( "Size: " + size + ", Color: " + color );
    
    /* update the treemap here */
}
