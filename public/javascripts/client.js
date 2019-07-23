// jshint esversion: 6
// Assignment 07 // Jonathan Bahlmann // 453 524

//save created routeViews to reference them when deleted


var routesToDelete = [];
// add map
var start_latlng = [51, 10.4];

var map = L.map("mapdiv").setView(start_latlng, 6);

var osm = L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
  maxZoom: 18,
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors",
  id: "osm"
}).addTo(map);

// tutorial
// routes array to store JSON data
var routesJSON = [];

// on DOM ready
$(document).ready(function() {
  readRoutes();

});


//read routes
function readRoutes() {
  var content = "";

  //get JSON from DB
  $.getJSON('/users/routes', function(data) {
    routesJSON = data;
    var tableContent ='';
    $.each(data, function(index) {
      tableContent += '<tr>';
      var checkbox = "<input type='checkbox' id='route"+index+"' name='routes' onchange='displayRoute("+index+")'></checkbox>";
      tableContent += '<td>' + checkbox + '</td>';
      tableContent += '<td>' + this.name + '</td>';
      tableContent += '<td>' + this.routeType + '</td>';
      tableContent += '<td>' + this.username + '</td>';
      tableContent += '<td>' + this.date + '</td>';
      tableContent += '</tr>';

      /* create simple route view as col-sm-1
       * this is an old solution
      content += "<div id='"+index+"' class='col-sm-1'>";
      //create checkbox for each route
      var checkbox = "<input type='checkbox' id='route"+index+"' name='routes' onchange='displayRoute("+index+")'></checkbox>";
      var label = "<label for='route"+index+"'>route"+index+"</label>";
      label += this.username;

      content += checkbox;
      content += label;
      content += "</div>";
      */
    });

    /*insert created content
    $('#results').html(content);
    */

    $('#resultTable').html(tableContent);
  });
}


function displayRoute(index) {
  console.log("displayRoute "+index);
  var id = "route";
  id += index;
  var first = document.getElementById("outputRoute1")
  if(document.getElementById(id).checked) {
  if (typeof first !== "undefined" && first.value == '') {
    document.getElementById("outputRoute1").value=JSON.stringify(routesJSON[index]);
  }
  else {
    document.getElementById("outputRoute2").value=JSON.stringify(routesJSON[index]);


  }


  var LatLon = turnLatLon(routesJSON[index].features[0].geometry.coordinates);
  var line = L.polyline(LatLon, {color: "red", weight: 3});
  line.addTo(map);
  map.fitBounds(line.getBounds());
  //insert into 'memory' array
  routesToDelete[index] = line;
  }
  else {
    console.log("remove");
    map.removeLayer(routesToDelete[index]);
  }
}

/**
  * quick function to turn around the coordinates
  * @param array
  */
function turnLatLon(array) {
  var latlon = [];
  //go through points and change to latlon order
  for (var j = 0; j < array.length; j++) {
    var point = [];
    var lat = array[j][1];
    point.push(lat);
    var lon = array[j][0];
    point.push(lon);
    latlon.push(point);
  }
  return latlon;
}
