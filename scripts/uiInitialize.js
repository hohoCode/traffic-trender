// Initialize UI system

// Contributors:
// Richard B. Johnson, Chris Musialek

var visualInit = function() {
    treemap.initialize();
    linechart.initialize();
    linechartAgg.initialize();
}

$(document).ready(function() {
    uiTreeMap.init();
    uiFilter.init("backend/sources/filter_menu_data.json", visualInit);
    uiLineGraph.init();
    
    $(function() {
        $( "#tabs" ).tabs({
            beforeLoad: function( event, ui ) {
                ui.jqXHR.error(function() {
                    ui.panel.html(
                        "Couldn't load this tab. ");
                });
            }
        });
    });    
});
