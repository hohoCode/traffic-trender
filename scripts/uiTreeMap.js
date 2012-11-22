// Tree Map Panel UI script

// Contributors:
// Richard B. Johnson

var uiTreeMap = uiTreeMap || {}; // namespace

$(document).ready(function(){
    $("#uiTreeMapPanel").panel({
        stackable:true
    });
    
    $("#uiTreeMap_applyButton").click(uiTreeMap.apply);    
});

uiTreeMap.apply = function() {
	uiSize = $("#uiTreeMap_size").val();
	uiColor = $("#uiTreeMap_color").val();
	
    //console.log( "Size: " + size + ", Color: " + uiColor );

    var newurl = "backend/sources/treemap_source_data_mod.json";
    d3.json(newurl, runTreemap);
}
