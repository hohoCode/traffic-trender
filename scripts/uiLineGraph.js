// Line Graph Panel UI script

// Contributors:
// Richard B. Johnson, Chris Musialek

var uiLineGraph = uiLineGraph || {}; // namespace

uiLineGraph.init = function(){
    $("#uiLineGraphPanel").panel({
        stackable:true
    });

    $("input:radio[name=uiGraphSettingGroup]").click(uiLineGraph.apply);
    $("#uiLineGraph_applyButton").click(uiLineGraph.apply);
}

uiLineGraph.selected = "Impact Factor"; //default

uiLineGraph.apply = function() {
	sel = $(this).val();
	//obj = $("input:radio[name=uiGraphSettingGroup]:checked");
	//sel = obj.val();

	uiLineGraph.selected = sel;
	var val = uiLineGraph.translate(uiLineGraph.selected);
	
	console.log( val );
	
	/* update line graph here */
}

//Translates value in ui with backend query value used
uiLineGraph.translate = function(item) {
    var translator = {"Impact Factor": "impactFactor", "Maximum Length": "length", "Time": "duration"};
    if (translator[item]) {
        return translator[item];
    } else {
        return item;
    }
}
