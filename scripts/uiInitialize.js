// Initialize UI system

// Contributors:
// Richard B. Johnson, Chris Musialek

var visualInit = function() {
    treemap.initialize();
    linechart.initialize();
    linechartAgg.initialize();
    dod.initialize();
}

$(document).ready(function() {
    uiTreeMap.init("backend/sources/filter_menu_data.json", visualInit);
    uiLineChart.init();
    
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
