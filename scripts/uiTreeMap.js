// Tree Map Panel UI script

// Contributors:
// Richard B. Johnson, Chris Musialek

var uiTreeMap = uiTreeMap || {}; // namespace

uiTreeMap.init = function(filepath, visualCallback) {
	uiTreeMap.changed = false;
	uiTreeMap.changedFilter = false;
	
    $("#uiTreeMapPanel").panel({
        stackable:true
    });

    $.getJSON(filepath, function(data) {
        $("#uiTreeMap_filter").dynatree({
            checkbox: true,
            selectMode: 3,
            children: [{"key": "all_states", "title": "All", "expand": true, "children": data}],
			onClick: uiTreeMap.filter_onClick
        });
        
        visualCallback();
    });
    
    $("#uiTreeMap_applyButton").click(uiTreeMap.apply);
    $("#uiTreeMap_size").change(uiTreeMap.reportChange);
    $("#uiTreeMap_color").change(uiTreeMap.reportChange);

	uiTreeMap.resize();	
    $(window).resize(uiTreeMap.resize);
}

uiTreeMap.filter_onClick = function(node, event) {
	if( node.getEventTargetType(event) == "title" ) {
		if (node.data.children != null)
			node.toggleExpand();
		else {
			node.toggleSelect();
			uiTreeMap.changed = true;
			uiTreeMap.changedFilter = true;
		}
	}
	else if( node.getEventTargetType(event) == "checkbox" ) {
		uiTreeMap.changed = true;
		uiTreeMap.changedFilter = true;
	}
}

uiTreeMap.reportChange = function() {
	uiTreeMap.changed = true;
}

uiTreeMap.apply = function() {
	if (uiTreeMap.changed)
		treemap.update();
		
	if (uiTreeMap.changedFilter) {
		linechart.update();
		linechartAgg.update();
	}
	
	if (uiTreeMap.changed == false && uiTreeMap.changedFilter == false)
		console.log("Apply request denied due to no change.");
	
	uiTreeMap.changed = false;
	uiTreeMap.changedFilter = false;
}

uiTreeMap.getSize = function() {
    return $("#uiTreeMap_size").val();
}

uiTreeMap.getColor = function() {
    return $("#uiTreeMap_color").val();
}

uiTreeMap.setSize = function(size) {
    $("#uiTreeMap_size").val(size);
}

uiTreeMap.setColor = function(color) {
    $("#uiTreeMap_color").val(color);
}

//TODO: Add zoom level option
uiTreeMap.getFilterSelections = function(zoomlevel) {
    root = $("#uiTreeMap_filter").dynatree("getRoot");
    sel = root.tree.getSelectedNodes();
    var arr = [];
        
    for (var i in sel) {
		if (sel[i].data.key == "all_states") {
			continue;
		}
			
        if (sel[i].data.children == null) {
            var newkey = sel[i].data.key.replace(/,/g,"@");
            arr.push("fm=" + newkey);
        }
    }
    
    //TODO: Currently restricted to 50 items until HTTP 413 error is resolved
    //var query = arr.slice(0,50).join("&");
    var query = arr.join("&");
    
    return query;
}

uiTreeMap.resize = function() {
    $("#uiTreeMap_filter").css("display", "none");
    
	var h = document.body.clientHeight - 16;
	h -= $("#uiTreeMapPanel").outerHeight(true);
	h -= $("#uiLineChartPanel").outerHeight(true);
	
	$("#uiTreeMap_filter").css("height", h + "px");
    $("#uiTreeMap_filter").css("display", "block");
}
