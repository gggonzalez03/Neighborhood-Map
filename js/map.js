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

function yelp(map, term, centerCoordinate){
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
		term : term,
		ll: centerCoordinate.lat + ", " + centerCoordinate.lng,
		radius: 20000
	};

	
	var encodedSignature = oauthSignature.generate(
		'GET',
		yelp_url,
		parameters,
		YELP_KEY_SECRET,
		YELP_TOKEN_SECRET
	);

	parameters.oauth_signature = encodedSignature;


	var promise = Promise.resolve($.ajax({
		url: yelp_url,
		data: parameters,
		dataType: "jsonp",
		cache: true,
        error: function (e){
            console.log(e);
        }
	}));

	return promise;
}

function foursquareAutocomplete(term, centerCoordinate){
	fs_url = "https://api.foursquare.com/v2/venues/suggestcompletion";

	var CLIENT_ID = "ODYT4S01VH3UCI2FAVNCPQ5JJVGTDBXLTGUFSJBKTAY3EXGR";
	var CLIENT_SECRET = "0MAO3USQG55PRI4A0UNUIJVQE51CNN55A5HJBBXUZIW5OGIS";

	var promise = Promise.resolve($.ajax({
		url: fs_url,
		data: {
			client_id: CLIENT_ID,
			client_secret: CLIENT_SECRET,
			ll: centerCoordinate.lat + ", " + centerCoordinate.lng,
			query: term,
			v: "20170101"
		},
		dataType: "jsonp",
		cache: true,
        error: function (e){
            console.log(e);
        }
	}));

	return promise;
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

	$("#foursquaresearch").keyup(function(){
		//console.log(model.favoritePlaces[0]);

		if(this.value == ""){
			places([]);
			return null;
		}

		var promise = foursquareAutocomplete(this.value, model.favoritePlaces[0]);

		promise.then(function(data){

			places([]);

			for(var i = 0; i < data.response.minivenues.length; i++){
				places.push({
					name	: data.response.minivenues[i].name,
					address : data.response.minivenues[i].location.address
							+ ", " + data.response.minivenues[i].location.city
							+ ", " + data.response.minivenues[i].location.state
							+ ", " + data.response.minivenues[i].location.postalCode
							+ ", " + data.response.minivenues[i].location.country,
					lat 	: data.response.minivenues[i].location.lat,
					lng 	: data.response.minivenues[i].location.lng
				});
			}
		});
	});
};
