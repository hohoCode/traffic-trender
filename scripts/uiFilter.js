// Filter UI script

// Contributors:
// Richard B. Johnson

var uiFilter = uiFilter || {}; // namespace

$(document).ready(function(){
    $("#uiFilterPanel").panel({
        stackable:true
    });
    
    $("#uiFilter_searchButton").click(uiFilter.applySearch);
    
    $("#uiFilter_searchTerms").keyup(function(e){
		if (e.keyCode == 13) { // enter key
			uiFilter.applySearch();
		}
	});
		
	$("#uiFilter_accordion").accordion({
		collapsible: true
	});
});

uiFilter.applySearch = function() {
	obj = $("#uiFilter_searchTerms");
	val = obj.val();
	
	if (val.length > 0) {
		alert(val);
		obj.val("");
	}
}
