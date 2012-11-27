// Tree Map Panel UI script

// Contributors:
// Richard B. Johnson, Chris Musialek

var uiTreeMap = uiTreeMap || {}; // namespace

uiTreeMap.init = function() {
    $("#uiTreeMapPanel").panel({
        stackable:true
    });

    $("#uiTreeMap_applyButton").click(uiTreeMap.apply);
}

//Translates value in ui with backend query value used
uiTreeMap.translate = function(item) {
    var translator = {"Impact Factor": "impactFactor", "Maximum Length": "length", "Time": "duration"};
    if (translator[item]) {
        return translator[item];
    } else {
        return item;
    }
}

uiTreeMap.apply = function() {

    console.log("got here");
    updateTreemap();

    /* update the treemap here */
}
