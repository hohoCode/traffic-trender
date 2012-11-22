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
    arr = []

    for (var i in sel) {
        if (!sel[i].data.children) {
            var newkey = sel[i].data.key.replace(/,/g,"@");
            arr.push("filtermenu=" + newkey);
        }
        data[ sel[i].data.key ] = true;
    }
    var query = arr.join("&");
    console.log(query);
    //console.log( data );
    
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
