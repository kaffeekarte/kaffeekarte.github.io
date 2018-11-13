
      function createfn(){
        var oac = document.getElementById("filtersGround");
        for (var [key, value] of coffee_keys.entries()) {
          var entry = document.createElement('input');
          entry.type = "checkbox";
          entry.id = key;
          oac.appendChild(entry);
          oac.appendChild(document.createTextNode(key));
          oac.appendChild(document.createElement('br'));
        };

      };
      function locationFound(e) {
      	document.getElementById('query-button').click();
      	showGlobalPopup("Cafés in Deiner Nähe");
      }
      function locationError(e) {
      	showGlobalPopup("Konnte Dich nicht finden");
      }
      function locateNewArea(e) {
      	//NORTH: Number increases when moving to the top (North)
      	//SOUTH: Number decreases when moving to the bottom (South)
      	//WEST: Number decreases when moving to the left (West)
      	//EAST: Number increases when moving to the right (East)
      	var accuracy = 0.001;
      	var clear = 0;
      	var loadingAllowed = false;
      	var south_new = map.getBounds().getSouth();
        var west_new = map.getBounds().getWest();
        var north_new = map.getBounds().getNorth();
        var east_new = map.getBounds().getSouth();
        if (north_new - north_old >= accuracy && west_old - west_new >= accuracy) {
        	south_new = north_old;
        	east_new = west_old;
        	if (north_new > maxNorth && maxWest > west_new) {
        		loadingAllowed = true;
        		maxNorth = north_new;
        		maxWest = west_new;
        	}
        } else if (north_new - north_old >= accuracy) {
        	south_new = north_old;
        	if (north_new > maxNorth) {
        		loadingAllowed = true;
        		south_new = maxNorth;
        		maxNorth = north_new;
        	}
        } else if (north_new - north_old >= accuracy && east_new - east_old >= accuracy) {
        	south_new = north_old;
        	west_new = east_old;
        	if (north_new > maxNorth && east_new > maxEast) {
        		loadingAllowed = true;
        		clear = 1;
        		maxNorth = north_new;
        		maxEast = east_new;
        	}
        } else if (east_new - east_old >= accuracy) {
        	west_new = east_old;
        	if (east_new > maxEast) {
        		loadingAllowed = true;
        		west_new = maxEast;
        		maxEast = east_new;
        	}
        } else if (east_new - east_old >= accuracy && south_old - south_new >= accuracy) {
        	west_new = east_old;
        	north_new = south_old;
        	if (east_new > maxEast && maxSouth > south_new) {
        		loadingAllowed = true;
        		clear = 1;
        		maxEast = east_new;
        		maxSouth = south_new;
        	}
        } else if (south_old - south_new >= accuracy) {
        	north_new = south_old;
        	if (maxSouth > south_new) {
        		loadingAllowed = true;
        		north_new = maxSouth;
        		maxSouth = south_new;
        	}
        } else if (south_old - south_new >= accuracy && west_old - west_new >= accuracy) {
        	north_new = south_old;
        	east_new = west_old;
        	if (maxSouth > south_new && maxWest > west_new) {
        		loadingAllowed = true;
        		clear = 1;
        		maxSouth = south_new;
        		maxWest = west_new;
        	}
        } else if (west_old - west_new >= accuracy) {
        	east_new = west_old;
        	if (maxWest > west_new) {
        		loadingAllowed = true;
        		east_new = maxWest;
        		maxWest = west_new;
        	}
        }
        north_old = north_new;
        south_old = south_new;
        west_old = west_new;
        east_old = east_new;
        if (loadingAllowed) {
       		loadPOIS("", south_new + ',' + west_new + ',' + north_new + ',' + east_new, clear);
        }
      }
      function checkboxes2overpass(){
        var checkBox;
        var andquery = ""
        for (var [key, value] of coffee_keys.entries()) {
          checkBox = document.getElementById(key);
          if (checkBox.checked == true){
            andquery += "[" + value + "]";
          }
        }
        return andquery;
      }
      function parseOpening_hours(value) {
      	var toTranslate = {"Mo" : "Montag", "Tu" : "Dienstag", "We" : "Mittwoch", "Th" : "Donnerstag", "Fr" : "Freitag", "Sa" : "Samstag", "Su" : "Sonntag", "off" : "geschlossen", "Jan" : "Januar", "Feb" : "Februar", "Mar" : "März", "Apr" : "April", "May" : "Mai", "Jun" : "Juni", "Jul" : "Juli", "Aug" : "August", "Sep" : "September", "Oct" : "Oktober", "Nov" : "November", "Dec" : "Dezember", "PH" : "Feiertag"};
      	var syntaxToHTML = {"; " : "<br/>", ";" : "<br/>",  "," : ", ", "-" : " - "}
      	for (var item in toTranslate) {
      		value = value.replace(new RegExp(item, "g"), "<b>" + toTranslate[item] + "</b>");
      	}
      	for (var item in syntaxToHTML) {
      		value = value.replace(new RegExp(item, "g"), "<b>" + syntaxToHTML[item] + "</b>");
      	}
      	return value
      }
      function buildOverpassApiUrlFromCheckboxes(map, bounds) {
      	if (bounds == "") {
        	bounds = map.getBounds().getSouth() + ',' + map.getBounds().getWest() + ',' + map.getBounds().getNorth() + ',' + map.getBounds().getEast();
        }
        south_old = map.getBounds().getSouth();
        west_old = map.getBounds().getWest();
        north_old = map.getBounds().getNorth();
        east_old = map.getBounds().getSouth();
        var overpassQuery = checkboxes2overpass()
        var amen = 'node["amenity"="cafe"]';
        if (document.getElementById("restaurant").checked == true) {
          //amen = 'node[\"amenity\"~\"cafe|restaurant|bakery\"]';
          amen = 'node["amenity"~"restaurant|cafe"]';
        }
        var ncafe = amen + overpassQuery + '(' + bounds + ');';
        var ncoffee = 'node["drink:coffee"="yes"]' + overpassQuery + '(' + bounds + ');';
        var wcafe = 'way["amenity"="cafe"]' + overpassQuery + '(' + bounds + ');';
        var wcoffee = 'way["drink:coffee"="yes"]' + overpassQuery + '(' + bounds + ');';
        var query = '?data=[out:json][timeout:15];(' + ncafe + ncoffee + wcafe + wcoffee +');out body center;';
        var baseUrl = 'https://overpass-api.de/api/interpreter';
        var resultUrl = baseUrl + query;
        return resultUrl;
      }
      function loadPOIS(event, bounds="", clear=1) {
      	if (clear == 1) {
        	Layergroup.clearLayers();
        }
        var overpassApiUrl = buildOverpassApiUrlFromCheckboxes(map, bounds);
        $.get(overpassApiUrl, function (osmDataAsJson) {
          var resultAsGeojson = osmtogeojson(osmDataAsJson);
          var resultLayer = L.geoJson(resultAsGeojson, {
            style: function (feature) {
              return {color: "#ff0000"};
            },
            filter: function (feature, layer) {
              var isPolygon = (feature.geometry) && (feature.geometry.type !== undefined) && (feature.geometry.type === "Polygon");
              if (isPolygon) {
                feature.geometry.type = "Point";
                var polygonCenter = L.latLngBounds(feature.geometry.coordinates[0]).getCenter();
                feature.geometry.coordinates = [ polygonCenter.lat, polygonCenter.lng ];
              }
              return true;
            },
            onEachFeature: function (feature, layer) {
              // declare variables
              var popupContent = "";
              var amenity = feature.properties.tags["amenity"] || "";
              var name = feature.properties.tags["name"] || "";;
              var street = feature.properties.tags["addr:street"] || feature.properties.tags["street"] || "Straße unbekannt";
              var housenumber = feature.properties.tags["addr:housenumber"] || feature.properties.tags["housenumber"] || "Hausnummer unbekannt";
              var postcode = feature.properties.tags["addr:postcode"] || feature.properties.tags["postcode"] || "Postleitzahl unbekannt";
              var city = feature.properties.tags["addr:city"] || feature.properties.tags[":city"] || "Stadtname unbekannt"; 
              var phone = feature.properties.tags["phone"] || feature.properties.tags["contact:phone"] || "Unbekannt";
              var email = feature.properties.tags["email"] || feature.properties.tags["contact:email"] || "Unbekannt";
              var website = feature.properties.tags["website"] || feature.properties.tags["contact:website"] || "Unbekannt";
              var wheelchair = ((feature.properties.tags["wheelchair"] == "yes") ? "Ja" : ((feature.properties.tags["wheelchair"] == "limited") ? "Teilweise" : "Nein"));
              var toilets_wheelchair = ((feature.properties.tags["toilets:wheelchair"] == "yes") ? "Ja" : "Nein");
              var wheelchair_descr = feature.properties.tags["wheelchair:description"] || "<i>Keine zusätzliche Beschreibung vorhanden</i>";
              var phone_button = ((phone == "Unbekannt") ? "" : "<a class=\"specialbtn\" href=\"call:" + phone + "\">Anrufen</a>");
              var email_button = ((email == "Unbekannt") ? "" : "<a class=\"specialbtn\" href=\"mailto:" + email + "\">@</a>");
              var opening_hours = feature.properties.tags["opening_hours"] || "Unbekannt";
              //start adding and formatting to POI details view HTML code
              if (opening_hours != "Unbekannt") {
              	opening_hours = parseOpening_hours(feature.properties.tags["opening_hours"]);
              }
              if (website != "Unbekannt") {
              	name = "<a target=\"_blank\" href=\"" + website + "\">" + name + "</a>";
              }
              email = ((email == "Unbekannt") ? email : "<a href=mailto:\"" + email + "\">" + email + "</a>");
              website = ((website == "Unbekannt") ? website : "<a target=\"_blank\" href=\"" + website + "\">" + website + "</a>");
              // add better look
              popupContent += "<h3 style='margin-bottom:0px;color:grey;'>" + amenity + "</h3><h1 style='margin:0px;'>" + name + "</h1>";
              popupContent += phone_button + email_button;
              // Add address to POI details view
              popupContent += "<details open><summary>Adresse</summary>%data_address%</details>";
              // Add opening hours to POI details view
              popupContent += "<details open><summary>Öffnungszeiten</summary>" + opening_hours + "</details>";
              // Add contact details to POI details view
              popupContent += "<details><summary>Kontakt</summary>Tel: " + phone + "<br/>Mail: " + email + "<br/>Webseite: " + website + "</details>";
              // Add accessibility informations to POI details view
              popupContent += "<details><summary>Eignung für Rollstuhlfahrer</summary>Barrierefrei: " + wheelchair + "<br/>Barrierefreie Toilette(n): "+ toilets_wheelchair + "<br/><br/>" + wheelchair_descr + "</details>";
              popupContent += "<a target=\"_blank\" title=\"Bei OSM registrierte Nutzer können diese POI direkt bearbeiten. Veraltete Informationen raus nehmen und neue hinzufügen.\" href=\"https://www.openstreetmap.org/edit?" + String(feature.properties.type) + "=" + String(feature.properties.id) + "\">Mit OSM editieren</a>&nbsp;&nbsp;";
              popupContent += "<a target=\"_blank\" title=\"Eine falsche Information entdeckt? Informiere mithilfe dieses Linkes die OSM Community.\" href=\"https://www.openstreetmap.org/note/new#map=15/" + feature.geometry.coordinates[1] + "/" + feature.geometry.coordinates[0] + "&layers=N\">Falschinformation melden</a>";
              layer.on("click", function(layer=layer, type=String(feature.properties.type), id=String(feature.properties.id)) {
              	if (popupContent.indexOf("%data_address%") > -1) {
              		$.get("https://nominatim.openstreetmap.org/reverse?accept-language=" + languageOfUser + "&format=json&osm_type=" + type[0].toUpperCase() + "&osm_id=" + id, function(data, status, xhr, trash) {
              			var address = data["address"];
              			var street = address["road"] || address["street"] || address["footway"] || address["path"];
              			var housenumber = address["housenumber"] || address["house_number"] || "";
              			var postcode = address["postcode"] || "";
              			var city = address["city"] || document.getElementById("searchfield").value;
              			layer.target.bindPopup(popupContent.replace("%data_address%", street + " " + housenumber + "<br/>" + postcode + " " + city));
              			layer.target.openPopup();
              		});
              	}
              	}).addTo(Layergroup);
          }
          }).addTo(Layergroup);
          map.addLayer(Layergroup);
        });
      }
      $("#query-button").click(loadPOIS);
function getStateFromHash() {
	var hash = location.hash;
	if (hash != "") {
		hash = hash.replace("#", "").split("&");
		zoomLevel = Number(hash[0]);
		saved_lat = Number(hash[1]);
		saved_lon = Number(hash[2]);
		map.setView([saved_lat, saved_lon], zoomLevel);
	}
}
//init map
var coffee_keys = new Map();
coffee_keys.set("Aussenbereich", "\"outdoor_seating\"!=\"no\"");
coffee_keys.set("Siebtraeger", "\"drink:coffee:portafilter\"=\"yes\"");
coffee_keys.set("Vollautomat", "\"drink:coffee:automatic\"=\"yes\"");
coffee_keys.set("ToGo", "\"drink:coffee:togo\"~\"yes|deposit|only\"");
coffee_keys.set("Wickeltisch", "\"diaper\"=\"yes\"");
var map = L.map('map').setView([saved_lat, saved_lon], zoomLevel);
map.options.maxZoom = 17;
map.options.minZoom = 13;
maxSouth = map.getBounds().getSouth();
maxWest = map.getBounds().getWest();
getStateFromHash();
map.on("locationfound", locationFound);
map.on("locationerror", locationError);
map.on("click", function(e) {location.hash = String(map.getZoom()) + "&" + String(e.latlng.lat) + "&" + String(e.latlng.lng);})
map.on("moveend", locateNewArea);
var Layergroup = new L.LayerGroup();
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 17,
  attribution: 'Map data &copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors</a>, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Map Tiles &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
map.locate({setView: true});
//get state from hash
//init filter
window.onload=createfn();
//load POIs
document.getElementById('query-button').click();
