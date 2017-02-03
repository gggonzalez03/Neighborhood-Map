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
    				+ "<p>" + coordinates.address + "</p>"
    				+ "<p>" + coordinates.phone + "</p>"
    				+ "<p>" + coordinates.url + "</p>");
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

function foursquareAutocomplete(query, centerCoordinate){
	fs_url = "https://api.foursquare.com/v2/venues/suggestcompletion";

	var CLIENT_ID = "ODYT4S01VH3UCI2FAVNCPQ5JJVGTDBXLTGUFSJBKTAY3EXGR";
	var CLIENT_SECRET = "0MAO3USQG55PRI4A0UNUIJVQE51CNN55A5HJBBXUZIW5OGIS";

	var promise = Promise.resolve($.ajax({
		url: fs_url,
		data: {
			client_id: CLIENT_ID,
			client_secret: CLIENT_SECRET,
			ll: centerCoordinate.lat + ", " + centerCoordinate.lng,
			query: query,
			radius: 10000,
			limit: 10,
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

function foursquareSearch(query, centerCoordinate){
	fs_url = "https://api.foursquare.com/v2/venues/search";

	var CLIENT_ID = "ODYT4S01VH3UCI2FAVNCPQ5JJVGTDBXLTGUFSJBKTAY3EXGR";
	var CLIENT_SECRET = "0MAO3USQG55PRI4A0UNUIJVQE51CNN55A5HJBBXUZIW5OGIS";

	var promise = Promise.resolve($.ajax({
		url: fs_url,
		data: {
			client_id: CLIENT_ID,
			client_secret: CLIENT_SECRET,
			ll: centerCoordinate.lat + ", " + centerCoordinate.lng,
			query: query,
			radius: 10000,
			limit: 10,
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

	$("#foursquaresearch").keyup(function(key){
		//console.log(model.favoritePlaces[0]);

		if(this.value == ""){
			places([]);
			return null;
		}

		if(key.which == 13){
			foursquareSearch(this.value, model.favoritePlaces[0]).then(function(data){

				places([]);

				for(var i = 0; i < data.response.venues.length; i++){
					places.push({
						name	: data.response.venues[i].name,
						address : data.response.venues[i].location.address
								+ ", " + data.response.venues[i].location.city
								+ ", " + data.response.venues[i].location.state
								+ ", " + data.response.venues[i].location.postalCode
								+ ", " + data.response.venues[i].location.country,
						lat 	: data.response.venues[i].location.lat,
						lng 	: data.response.venues[i].location.lng,
						phone	: data.response.venues[i].contact.formattedPhone,
						website	: data.response.venues[i].url
					});
				}

				console.log(data);
				clearMapMarkers(markers);
				markers = makeMapMarkers(places());
				setMapMarkers(map, markers);

			});
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
