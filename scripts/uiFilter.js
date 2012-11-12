// Filter UI script

// Contributors:
// Richard B. Johnson

var demoTree = [
    {title: "Maryland", key: "Maryland",
        children: [
            {title: "County 1", key: "Maryland, County 1",
                children: [
                    {title: "Street 1", key: "Maryland, County 1, Street 1", select: true },
                    {title: "Street 2", key: "Maryland, County 1, Street 2", select: true },
                    {title: "Street 3", key: "Maryland, County 1, Street 3", select: true },
                ]
            },
            {title: "County 2", key: "Maryland, County 2",
                children: [
                    {title: "Street 1", key: "Maryland, County 2, Street 1", select: true },
                    {title: "Street 2", key: "Maryland, County 2, Street 2", select: true },
                    {title: "Street 3", key: "Maryland, County 2, Street 3", select: true },
                    {title: "Street 4", key: "Maryland, County 2, Street 4", select: true },
                ]
            },
            {title: "County 3", key: "Maryland, County 3",
                children: [
                    {title: "Street 1", key: "Maryland, County 3, Street 1", select: true },
                    {title: "Street 2", key: "Maryland, County 3, Street 2", select: true },
                ]
            }
        ]
    },
    {title: "Virginia", key: "Virginia",
        children: [
            {title: "County 1", key: "Virginia, County 1",
                children: [
                    {title: "Street 1", key: "Virginia, County 1, Street 1", select: true },
                    {title: "Street 2", key: "Virginia, County 1, Street 2", select: true },
                    {title: "Street 3", key: "Virginia, County 1, Street 3", select: true },
                    {title: "Street 4", key: "Virginia, County 1, Street 4", select: true },
                ]
            },
            {title: "County 2", key: "Virginia, County 2",
                children: [
                    {title: "Street 1", key: "Virginia, County 2, Street 1", select: true },
                    {title: "Street 2", key: "Virginia, County 2, Street 2", select: true },
                ]
            },
            {title: "County 3", key: "Virginia, County 3",
                children: [
                    {title: "Street 1", key: "Virginia, County 3, Street 1", select: true },
                    {title: "Street 2", key: "Virginia, County 3, Street 2", select: true },
                    {title: "Street 3", key: "Virginia, County 3, Street 3", select: true },
                ]
            }
        ]
    }
];


var uiFilter = uiFilter || {}; // namespace

$(document).ready(function(){
    $("#uiFilterPanel").panel({
        stackable:true
    });
    
    $("#uiFilter_tree").dynatree({
        checkbox: true,
        selectMode: 3,
        children: demoTree
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
    map = {}

    for (var i in sel) {
        map[ sel[i].data.key ] = true;
    }
    
    console.log( map );       
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
