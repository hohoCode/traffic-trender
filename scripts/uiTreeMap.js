// Tree Map Panel UI script

// Contributors:
// Richard B. Johnson

var uiTreeMap = uiTreeMap || {}; // namespace

$(document).ready(function(){
    $("#uiTreeMapPanel").panel({
        stackable:true
    });    
});

uiTreeMap.applySize = function() {
	obj = $("#uiTreeMap_size");
	val = obj.val();
}

uiTreeMap.applyColor = function() {
	obj = $("#uiTreeMap_color");
	val = obj.val();
}
