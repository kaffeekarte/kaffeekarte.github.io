var saved_lat = 48.160474925320834;
var saved_lon = 11.4992094039917;
var maxSouth = 0;
var maxWest = 0;
var maxNorth = 0;
var maxEast = 0;
var south_old, west_old, north_old, east_old, maxSouth, maxWest, maxNorth, maxEast;
var poi_markers = new Array();
var message;
function togglemenu(value=false) {
	var obj = document.getElementById("extended");
	if (value == true) {
		obj.style.display = "block";
	}
	if (obj.style.display != "block") {
		obj.style.display = "block";
	} else {
		obj.style.display = "none";
	}
}
function showGlobalPopup(m) {
	message = m
	setTimeout(function() {
		document.getElementById("infoPopup").innerHTML = message;
		document.getElementById("infoPopup").style.display = "block";
		setTimeout(function() {
			document.getElementById("infoPopup").style.display = "none";
		}, 3000);
	}, 1000);
}
function jumpto(lat, lon, locname="") {
	if (locname != "") {
		$("#searchfield").value = locname;
}
	$("#autocomplete").hide();
	map.setView([lat, lon]);
	location.hash = String(map.getZoom()) + "&" + String(lat) + "&" + String(lon);
	maxSouth = map.getBounds().getSouth();
	maxWest = map.getBounds().getWest();
	maxNorth = 0;
	maxEast = 0;
	$('#query-button').click();
	showGlobalPopup(locname);
}
function geocode() {
	var searchword = $("#searchfield").val();
	if(searchword.length > 3) {
		$.getJSON("https://photon.komoot.de/api/", {
			"q": searchword,
			"limit": 5,
			"lang": "de"
		}, function(data) {
			var current_bounds = map.getBounds();
			var autocomplete_content = "<li>";
			$.each(data.features, function(number, feature) {
				var latlng = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
				autocomplete_content += "<ul onclick='jumpto(" + latlng[0] + ", " + latlng[1] + ", \"" + feature.properties.name + ", " + feature.properties.country + "\")'>" + feature.properties.name + ", " + feature.properties.country + "</ul>";
			});
			$("#autocomplete").html(autocomplete_content+"</li>");
			$("#autocomplete").show();
		});
	}
};
// init search
$("#searchfield").keyup(function() {
	geocode();
});
