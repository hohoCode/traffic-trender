// Filter UI script

// Contributors:
// Richard B. Johnson, Chris Musialek

var uiFilter = uiFilter || {}; // namespace

uiFilter.init = function(filepath) {
    $("#uiFilterPanel").panel({
        stackable:true
    });
    
    $.getJSON(filepath, function(data) {
        $("#uiFilter_tree").dynatree({
            checkbox: true,
            selectMode: 3,
            children: data
        });
    });
        
	uiFilter.resize();
	
    $(window).resize(uiFilter.resize);
	
    $("#uiFilter_applyButton").click(uiFilter.apply);
    
    $("#uiFilter_searchTerms").keyup(function(e){
		if (e.keyCode == 13) { // enter key
			uiFilter.search();
		}
	});
}

uiFilter.search = function() {
	obj = $("#uiFilter_searchTerms");
	val = obj.val();
	
	if (val.length > 0) {
		alert(val);
		obj.val("");
	}
}

//The filter menu updates both the treemap and the linechart
uiFilter.apply = function() {

    updateTreemap();
    updateLinechart();
}

//TODO: Add zoom level option
uiFilter.getFilterSelections = function(zoomlevel) {
    root = $("#uiFilter_tree").dynatree("getRoot");
    sel = root.tree.getSelectedNodes();
    //var data = {};
    var arr = [];
    
    for (var i in sel) {
        if (!sel[i].data.children) {
            var newkey = sel[i].data.key.replace(/,/g,"@");
            arr.push("fm=" + newkey);
        }
        //data[ sel[i].data.key ] = true;
    }
    //TODO: Currently restricted to 50 items until HTTP 413 error is resolved
    //var query = arr.slice(0,50).join("&");
    var query = arr.join("&");
    console.log(query);
    return query;
    
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
