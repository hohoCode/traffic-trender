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

uiTreeMap.apply = function() {
    treemap.update();
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
