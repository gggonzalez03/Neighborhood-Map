// Takes an array of Marker objects
function setMapMarkers(map, markers) {
    for (var i = 0; i < markers.length; i++) {
    	markers[i].setMap(map);
    }
}

function clearMapMarkers(markers){
	setMapMarkers(null, markers);
}

// Takes an array of coordinates and
// returns an array of Marker objects
function makeMapMarkers(coordinates){

	var markers = [];

	for(var i = 0; i < coordinates.length; i++){
		markers.push(new google.maps.Marker({
			position: coordinates[i]
		}));
	}

	return markers;
}

// Initialize Map
var initMap = function() {
	// Map configuration
	var mapSetup = {
		center: new google.maps.LatLng(model.favoritePlaces[4]),
		zoom: 11,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	//Show the map in the element with id of "map"
	// and store the map object in variable map
	var map = new google.maps.Map($('#map')[0], mapSetup);

	// Place the initial markers
	var markers = makeMapMarkers(model.favoritePlaces);

	// Place markers
	setMapMarkers(map, markers);

    // This will make the input a searchBox
	var searchBox = new google.maps.places.SearchBox($('#searchBox')[0]);

	// Set the searchBox search bias whenever the map bounds change
	map.addListener('bounds_changed', function() {
		searchBox.setBounds(map.getBounds());
	});

	// Change the markers whenever a search is done
	searchBox.addListener('places_changed', function() {

		// Clear markers on the map
		clearMapMarkers(markers);

		// Delete all markers stored
  		markers = [];

  		// This will store the coordinates received from google
  		coordinates = [];

		for(var i = 0; i < searchBox.getPlaces().length; i++){
			coordinates.push({
					lat: searchBox.getPlaces()[i].geometry.location.lat(),
					lng: searchBox.getPlaces()[i].geometry.location.lng()
				});
		}

		// Make markers
		markers = makeMapMarkers(coordinates);
		// Place markers
		setMapMarkers(map, markers);
	});
};