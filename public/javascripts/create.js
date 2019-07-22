'esversion: 6';
// on DOM ready
$(document).ready(function() {
  fillDate();
});
//make map
var start_latlng = [34.2, 24.6];

var map = L.map("mapdiv").setView(start_latlng, 10);

var osm = L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png ", {
  maxZoom: 18,
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors",
  id: "osm"
}).addTo(map);

//add routing control
L.Routing.control({
    waypoints: [
        L.latLng(50.273147, 7.968092),
        L.latLng(50.268518, 7.980409)
    ],
    routeWhileDragging: true,
})
//upon a route change..
.on("routesfound", function(e) {
  //get route
  var route = e.routes[0];
  var pointCoordinates = [],
      point = [];
  //go through coordinates
  for(var i = 0; i < route.coordinates.length; i++) {
    point = route.coordinates[i];
    //push them to coordinate array
    pointCoordinates.push([point.lng, point.lat]);
  }
  //convert to GeoJson
  var string = toGeoJson(pointCoordinates);
  //save to localstorage
  localStorage.setItem("storageRoutes", JSON.stringify(string));
  //output into textarea
  document.getElementById("GeoJson").value = JSON.stringify(string);
//also add to map
}).addTo(map);

/**
  * converts an array of coordinates into a LineString in GeoJSON format
  * done by using this source:
  * @see https://github.com/perliedman/leaflet-routing-machine/blob/344ff09c8bb94d4e42fa583286d95396d8227c65/src/L.Routing.js
  */
function toGeoJson(coordinates) {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: coordinates
        }
      },
    ]
  };
}

function fillDate() {
  var now = new Date();
  now.toISOString();
  //.substring(0, 10);
  let year = now.getFullYear();
  let month = '' + (now.getMonth() + 1);
  if(month.length < 2) { month = '0' + month; }
  let day = '' + now.getDate();
  if(day.length < 2) { day = '0' + day; }
  now = day+'-'+month+'-'+year;
  document.getElementById("routeDate").value = now;
}

function createRouteButton() {
  event.preventDefault();

  var newRoute = document.getElementById("GeoJson").value;
  var addAttr = JSON.parse(newRoute);
  addAttr.name = document.getElementById("routeName").value;
  addAttr.routeType = document.querySelector('input[name="routeType"]:checked').value;
  addAttr.username = document.getElementById("routeUsername").value;
  addAttr.date = document.getElementById("routeDate").value;
  addAttr.desc = document.getElementById("routeDesc").value;
  var newRouteString = JSON.stringify(addAttr);

  //post
  $.ajax({
    type: 'POST',
    data: newRouteString,
    url: '/users/addroute',
    contentType:"application/json"
  }).done(function(response) {
    console.dir(response);
    //successful
    if(response.error === 0) {
      alert('route added: ' + response.msg);
    }
    else {
      alert('Error: ' + response.msg);
    }
  });
}
