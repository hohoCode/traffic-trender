// Filter UI script

// Contributors:
// Richard B. Johnson

var uiFilter = uiFilter || {}; // namespace

uiFilter.data = $.getJSON("backend/sources/filter_menu_data.json");

$(document).ready(function(){
    $("#uiFilterPanel").panel({
        stackable:true
    });
    
    $("#uiFilter_tree").dynatree({
        checkbox: true,
        selectMode: 3,
        children: eval(uiFilter.data.responseText)
    });
    
	uiFilter.resize();
	
    $(window).resize(uiFilter.resize);
	
    $("#uiFilter_applyButton").click(uiFilter.apply);
    
    $("#uiFilter_searchTerms").keyup(function(e){
		if (e.keyCode == 13) { // enter key
			uiFilter.search();
		}
	});
});

uiFilter.search = function() {
	obj = $("#uiFilter_searchTerms");
	val = obj.val();
	
	if (val.length > 0) {
		alert(val);
		obj.val("");
	}
}

uiFilter.apply = function() {
    root = $("#uiFilter_tree").dynatree("getRoot");
    sel = root.tree.getSelectedNodes();
    data = {}

    for (var i in sel) {
        data[ sel[i].data.key ] = true;
    }
    
    console.log( data );
    
    /* update the treemap here */
}

uiFilter.resize = function() {
    $("#uiFilter_tree").css("display", "none");
    
	var h = document.body.clientHeight - 16;
	h -= $("#uiTreeMapPanel").outerHeight(true);
	h -= $("#uiFilterPanel").outerHeight(true);
	h -= $("#uiLineGraphPanel").outerHeight(true);
	
	$("#uiFilter_tree").css("height", h + "px");
    $("#uiFilter_tree").css("display", "block");
}
