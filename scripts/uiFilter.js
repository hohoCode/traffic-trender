// Filter UI script

// Contributors:
// Richard B. Johnson

var demoTree = [
    {title: "Maryland", key: "md",
        children: [
            {title: "County 1",
                children: [
                {title: "Street 1", key: "md_c1_st1", select: true },
                {title: "Street 2", key: "md_c1_st2", select: true },
                {title: "Street 3", key: "md_c1_st3", select: true }
                ]
            },
            {title: "County 2",
                children: [
                {title: "Street 1", key: "md_c2_st1", select: true },
                {title: "Street 2", key: "md_c2_st2", select: true },
                {title: "Street 3", key: "md_c2_st3", select: true },
                {title: "Street 4", key: "md_c2_st4", select: true }
                ]
            },
            {title: "County 3",
                children: [
                {title: "Street 1", key: "md_c3_st1", select: true },
                {title: "Street 2", key: "md_c3_st2", select: true }
                ]
            }
        ]
    },
    {title: "Virginia", key: "va", select: true,
        children: [
            {title: "County 1",
                children: [
                {title: "Street 1", key: "va_c1_st1", select: true },
                {title: "Street 2", key: "va_c1_st2", select: true },
                {title: "Street 3", key: "va_c1_st3", select: true },
                {title: "Street 4", key: "va_c1_st4", select: true }
                ]
            },
            {title: "County 2",
                children: [
                {title: "Street 1", key: "va_c2_st1", select: true },
                {title: "Street 2", key: "va_c2_st2", select: true }
                ]
            },
            {title: "County 3",
                children: [
                {title: "Street 1", key: "va_c3_st1", select: true },
                {title: "Street 2", key: "va_c3_st2", select: true },
                {title: "Street 3", key: "va_c3_st3", select: true }
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

    /* apply filtering here */    
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
