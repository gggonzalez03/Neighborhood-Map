// Takes an array of Marker objects
function setMapMarkers(map, markers) {

    for (var i = 0; i < markers.length; i++) {
    	markers[i].setMap(map);
    }
}

// Clears all the markers on the map
function clearMapMarkers(markers){
	setMapMarkers(null, markers);
}

// Takes an array of coordinates and
// returns an array of Marker objects
function makeMapMarkers(coordinates){

	var markers = [];
	var infoWindow = new google.maps.InfoWindow();

	// This will create and store markers in markers array variable
	// Each marker will be created with event listeners on click
	for(var i = 0; i < coordinates.length; i++){
		markers.push(new google.maps.Marker({
			position: coordinates[i],
			animation: google.maps.Animation.DROP
		}));

		// Sets the listener on current i in the interation
		(function (marker, coordinates) {
    		marker.addListener('click', function(){
    			infoWindow.setContent(
    				"<h5>"+ coordinates.name +"</h5>"
    				+ "<p>" + coordinates.address + "</p>");
		    	infoWindow.open(map, marker);

		    	// Make the marker bounce on tap or click
		    	marker.setAnimation(google.maps.Animation.BOUNCE)

		    	// Sets how long the marker should bounce
		    	setTimeout(function(){ marker.setAnimation(null); }, 1400);
		    })
	    })(markers[i], coordinates[i]);
	}

	return markers;
}

function nonce_generate() {
	return (Math.floor(Math.random() * 1e12).toString());
}

function yelp(){
	var yelp_url = 'http://api.yelp.com/v2/search';

	var YELP_KEY = "00UzGxeokgnv1kg3Q2xSQg";
	var YELP_KEY_SECRET = "QlYt9dG4gXPO77kNXs7GNi-ekaI";
	var YELP_TOKEN = "EjlANkGnpX8SuCM8m2fphVSJaiLrgHgP";
	var YELP_TOKEN_SECRET = "7zk-kykQTklYu612aqdwkZNRQgo";

	var parameters = {
		oauth_consumer_key: YELP_KEY,
		oauth_token: YELP_TOKEN,
		oauth_nonce: nonce_generate(),
		oauth_timestamp: Math.floor(Date.now()/1000),
		oauth_signature_method: 'HMAC-SHA1',
		oauth_version : '1.0',
		callback: 'cb',// This is crucial to include for jsonp implementation in AJAX or else the oauth-signature will be wrong.
		term : 'cafe',
		location : '1032+Castro+Street%2C+Mountain+View',
		cll : '37.385083%2C-122.08460200000002'
	};

	var encodedSignature = oauthSignature.generate('GET',yelp_url, parameters, YELP_KEY_SECRET, YELP_TOKEN_SECRET);
	parameters.oauth_signature = encodedSignature;

	$.ajax({
		url: yelp_url,
		data: parameters,
		dataType: "jsonp",
		cache: true,
		success: function(results){
			console.log(results);
		},
        error: function (er) {
            console.log(er);
        }
	});
}

// Initialize Map
var initMap = function() {
	// Map configuration
	var places = ko.observableArray(model.favoritePlaces);

	// Drops the marker of the place tapped or clicked
	// from the list returned by the searchBox
	var showPlaceLocation = function(placeInfo){
		var placeInfo = [placeInfo];
		clearMapMarkers(markers);
		markers = makeMapMarkers(placeInfo);
		setMapMarkers(map, markers);
	};

	// Apply the bindings
	ko.applyBindings({
		places: places,
		showPlaceLocation: showPlaceLocation
	});

	// Map initial configuration
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
				address: searchBox.getPlaces()[i].formatted_address,
				lat: searchBox.getPlaces()[i].geometry.location.lat(),
				lng: searchBox.getPlaces()[i].geometry.location.lng()
			});
		}
		// Make markers
		markers = makeMapMarkers(places());
		// Place markers
		setMapMarkers(map, markers);
	});

	yelp();
};
