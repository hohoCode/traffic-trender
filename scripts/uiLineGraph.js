// Line Graph Panel UI script

// Contributors:
// Richard B. Johnson, Chris Musialek

var uiLineGraph = uiLineGraph || {}; // namespace

uiLineGraph.init = function(){
    $("#uiLineGraphPanel").panel({
        stackable:true
    });

    $("input:radio[id=uiLineGraph_impactFactor]").attr("checked", true);
    $("#uiLineGraph_applyButton").click(uiLineGraph.apply);
}

uiLineGraph.apply = function() {
	obj = $("input:radio[name=uiGraphSettingGroup]:checked");
	sel = obj.val();

	console.log( sel );
	
	/* update line graph here */
}

/* (DELETE: NO LONGER NEEDED)
//Translates value in ui with backend query value used
uiLineGraph.translate = function(item) {
    var translator = {"Impact Factor": "impactFactor", "Maximum Length": "length", "Time": "duration"};
    if (translator[item]) {
        return translator[item];
    } else {
        return item;
    }
}
*/
