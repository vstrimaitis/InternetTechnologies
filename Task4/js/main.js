const GAME_LIST_URL = "http://api.myjson.com/bins/zctff"

Date.validParse = function(str) {
	var parts = str.split('-');
    if(parts.length !== 3) return null;
    
    var year = parseInt(parts[0]);
    var month = parseInt(parts[1])-1;
    var day = parseInt(parts[2]);
	
    var d = new Date(year, month, day);
    if (d.getFullYear() != year || d.getMonth() != month || d.getDate() != day) {
        return null;
    }
    return d;
}

$(document).ready(function() {
    $("#menuToggleBtn").click(function(){
        $("#menu #links").toggle();
        var elem = $("#menuToggleBtn");
        if(elem.text() == "Hide") elem.text("Show");
        else elem.text("Hide");
    });

    
});