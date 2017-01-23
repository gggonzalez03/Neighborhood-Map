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
	var infoWindow = new google.maps.InfoWindow();

	for(var i = 0; i < coordinates.length; i++){
		markers.push(new google.maps.Marker({
			position: coordinates[i],
			animation: google.maps.Animation.DROP
		}));

		(function (marker, coordinates) {
    		marker.addListener('click', function(){
    			infoWindow.setContent(coordinates.name);
		    	infoWindow.open(map, marker);
		    	marker.setAnimation(google.maps.Animation.BOUNCE)
		    	setTimeout(function(){ marker.setAnimation(null); }, 1400);
		    })
	    })(markers[i], coordinates[i]);
	}

	return markers;
}

// Initialize Map
var initMap = function() {
	// Map configuration
	var places = ko.observableArray(model.favoritePlaces);
	var showPlaceLocation = function(placeInfo){

		var placeInfo = [placeInfo];
		clearMapMarkers(markers);
		markers = makeMapMarkers(placeInfo);
		setMapMarkers(map, markers);
	};

	ko.applyBindings({
		places: places,
		showPlaceLocation: showPlaceLocation
	});

	var mapSetup = {
		center: new google.maps.LatLng(places()[4]),
		zoom: 11,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	//Show the map in the element with id of "map"
	// and store the map object in variable map
	var map = new google.maps.Map($('#map')[0], mapSetup);

	// Place the initial markers
	var markers = makeMapMarkers(places());

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

  		// This will store the coordinates and other information
  		// received from google
  		places([]);

		for(var i = 0; i < searchBox.getPlaces().length; i++){
			places.push({
				name: searchBox.getPlaces()[i].name,
				lat: searchBox.getPlaces()[i].geometry.location.lat(),
				lng: searchBox.getPlaces()[i].geometry.location.lng()
			});
		}
		// Make markers
		markers = makeMapMarkers(places());
		// Place markers
		setMapMarkers(map, markers);
	});
};
