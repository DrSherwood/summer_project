// jshint esversion: 6

//do two routes meet?

/**
  *@desc  function getAllRoutes is button response function for calculate meetings button
  * gets JSON routes from db
  * calls next function
  * @author Jonathan Bahlmann
  */
function getAllRoutes() {
  let routesJSON = [];
  $.getJSON('/users/routes', function(data) {
    //for each, do
    $.each(data, function(index) {
      routesJSON.push(JSON.stringify(this));
    });
    checkForMeetings(routesJSON);
  });

}

var meetingPointsArray = [];

/**
  * @desc Initializes the comparison of all routes with a chosen route
  * @param allRoutes All routes that are currently in the database
  * @author Jonathan Bahlmann
  */
function checkForMeetings(allRoutes) {
  //allRoutes is array with route-strings in JSON format
  //get firstLine from input textarea
  var firstLine = document.getElementById("routeInQuestion").value;

  //calculate meeting Points for all routes
  for(let i = 0; i < allRoutes.length; i++) {
    if(firstLine != allRoutes[i]) {
      lineStringsIntersect(firstLine, allRoutes[i]);
    }
  }
}

var apiKey = '21381ccbb60531b0ec9d57038076849a';

//array of featureCollections
var meetingsArray = [];
/**
  * @desc Checks if two choosen routes are intersecting eachother
  * Uses turf.js
  * @see https://turfjs.org/
  * @param firstLine The chosen route that gets checked for intersections
  * @param secondLine Another route that gets checked for intersections with the first one
  * @author Benjamin Rieke 408743
  */
function lineStringsIntersect(firstLine, secondLine) {
  console.log("lSI called with 1: " + JSON.parse(firstLine).name + " 2: " + JSON.parse(secondLine).name);

  //lines geometry
  var l1 = JSON.parse(firstLine);
  var l2 = JSON.parse(secondLine);
  //console.log(l1);

  //GeoJSON of intersections
  var intersects = turf.lineIntersect(l1.features[0].geometry, l2.features[0].geometry);

  // for each intersection do
  for(let i = 0; intersects.features[i]; i++) {
    intersects.features[i].properties.firstUsername = l1.username;
    intersects.features[i].properties.secondUsername = l2.username;
    intersects.features[i].properties.firstID = l1._id;
    intersects.features[i].properties.secondID = l2._id;
    intersects.features[i].properties.firstType = l1.routeType;
    intersects.features[i].properties.secondType = l2.routeType;
    //console.log(JSON.stringify(intersects.features[i]));
    var meetingPoint = (intersects.features[i].geometry.coordinates);
    // switch lat and long for display on leaflet
    intersects.features[i].geometry.coordinates = [meetingPoint[1], meetingPoint[0]];
    //push to meetingsArray
    meetingsArray.push(intersects.features[i]);

    let thisPoint = intersects.features[i];

    xhrGetWeather(thisPoint.geometry.coordinates[0], thisPoint.geometry.coordinates[1], handleWeather, thisPoint);


  }
}

/**
  * this function handles the xhr request to openweathermap
  * @author Joanthan Bahlmann
  * @param lat Latitude
  * @param lon Longitude
  * @param cFunc callback function for successful request
  * @param i index passed down into cFunc
  */
function xhrGetWeather(lat, lon, cFunc, meetingPoint) {
  console.log("xhrGetWeather called");
  var url = "https://api.openweathermap.org/data/2.5/weather?lat="+lat+"&lon="+lon+"&appid="+apiKey;
  var xhttp = new XMLHttpRequest();
  //when ready
  xhttp.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
      cFunc(this, meetingPoint);
    }
  };
  xhttp.open("GET", url, true);
  xhttp.send();
  console.log("xhr send");
}

/**
  * this function handles the xhttp response from OWMTOKEN
  * it saves the weather into a table, creates a marker at the found weather position
  * also the additional information xhr requests are called from here, depending on the weather code
  * @author Jonathan Bahlmann
  * @param xhttp xhttp responseText
  * @param i index to save the responseText at the right place in table
  */
function handleWeather(xhttp, meetingPoint) {
  //parse resonse
  weatherXML = JSON.parse(xhttp.responseText);
  let temperature = weatherXML.main.temp;
  let toCelsius = 273.1;
  temperature = temperature - toCelsius;
  temperature = Math.round(temperature*10)/10;
  let wString = '';
  wString += weatherXML.weather[0].description + ', ' + temperature + '°C';

  var n1 = meetingPoint.properties.firstUsername;
  var n2 = meetingPoint.properties.secondUsername;
  var t1 = meetingPoint.properties.firstType;
  var t2 = meetingPoint.properties.secondType;
//TODO type ist featureCollection
  console.log(t1);

  placeMarker(meetingPoint.geometry.coordinates, n1, t1, n2, t2, wString);

}


/**
* @desc Places a Marker on the map
* @param coordi The coordinates
* @param vFirstName The name of the user of the first route
* @param vFirstType The type of the first route (completed or planned)
* @param vSecondName The name of the user of the second route
* @param vSecondType The type of the second route (completed or planned)
* @param vWeather An object that contains informations about the weather
* @author Benjamin Rieke 408743
*/
function placeMarker(coordi, vFirstName, vFirstType, vSecondName, vSecondType, vWeather){
var markerList = '';
//If you have two planned routes that intersect
if(vFirstName == vSecondName && vFirstType == vSecondType && vFirstType == 'planned'){
     markerList = "You already planned parts of this route. Congrats!";
}
//If you have two routes. One that is planned and the other is already completed
if(vFirstName == vSecondName && vFirstType == 'planned' && vFirstType != vSecondType){
markerList = "You will encounter yourself. Congrats!";
console.log(markerList);
}

//If you have two routes. One that is already completed and the other is planned
if(vFirstName == vSecondName && vFirstType == 'completed' && vFirstType != vSecondType){
markerList = "You´ve already been here. Congrats!";
console.log(markerList);
}

// If your planned route intersects with somebody elses
if(vFirstName != vSecondName && vFirstType == 'planned' && vFirstType == vSecondType){
markerList = "You might encounter " +  vSecondName+ " Say Hello!";
console.log(markerList);
}

// If your planned route intersects with somebody elses
if(vFirstName != vSecondName && vFirstType == 'planned' && vFirstType !=vSecondType){
markerList = vSecondName+" was already here!";
console.log(markerList);
}

// If your completed route intersected with somebody elses
if(vFirstName != vSecondName && vFirstType == 'completed' && vFirstType ==vSecondType){
markerList = "Your route intersected with " +  vSecondName+" Write him a message!";
console.log(markerList);
}

// If your route intersected with somebody elses who has not completed it

if(vFirstName != vSecondName && vFirstType == 'completed' && vFirstType !=vSecondType){
markerList = "Your completed route might be intersected by " +  vSecondName+".Tell him if you liked it!";
console.log(markerList);
}

//If an animal was on parts of your planned route

if(vFirstType == 'planned' && vSecondType == 'animal'){
markerList = "You will follow the paths of " +  vSecondName+"! An Animal!" ;
console.log(markerList);
}

// If you were on the same path as an animal

if(vFirstType == 'completed' && vSecondType == 'animal'){
markerList = "You walked on the same paths as " +  vSecondName+"!  An Animal! How wonderful!" ;
console.log(markerList);
}
console.log(vFirstType);
L.marker(coordi).addTo(map)
 .bindPopup(markerList +"<br> The current weather at this location is: " +vWeather +'<br>  <button type="button" onclick="createRouteButton()" class="btn btn-dark">Share</button>');

}
