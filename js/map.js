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
function makeMapMarkers(map, coordinates){

	map.markers = [];
	var infoWindow = new google.maps.InfoWindow();

	// This will create and store markers in markers array variable
	// Each marker will be created with event listeners on click
	for(var i = 0; i < coordinates.length; i++){
		map.markers.push(new google.maps.Marker({
			position: coordinates[i],
			animation: google.maps.Animation.DROP
		}));

		// Sets the listener on current i in the interation
		(function (marker, coordinates) {
    		marker.addListener('click', function(){
    			infoWindow.setContent(
    				((coordinates.name != undefined) ? "<h5>" + coordinates.name + "</h5>" : "")
    				+ ((coordinates.address != undefined) ? "<p>" + coordinates.address + "</p>" : "")
    				+ ((coordinates.phone != undefined) ? "<p>" + coordinates.phone + "</p>" : "")
    				+ ((coordinates.url != undefined) ? "<p>" + coordinates.url + "</p>" : ""));
		    	infoWindow.open(map, marker);

		    	// Make the marker bounce on tap or click
		    	marker.setAnimation(google.maps.Animation.BOUNCE)

		    	// Sets how long the marker should bounce
		    	setTimeout(function(){ marker.setAnimation(null); }, 1400);
		    })
	    })(map.markers[i], coordinates[i]);
	}
}

function formatDataFromFoursquare(data, purpose){

	var places = [];

	if(purpose == "autocomplete"){
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
	}
	else if(purpose == "search_results"){
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
				phone 	: data.response.venues[i].contact.formattedPhone,
				url 	: data.response.venues[i].url

			});
		}
	}

	return places;
}

function foursquareAutocomplete(query, centerCoordinate, categoryId){
	fs_url = "https://api.foursquare.com/v2/venues/suggestcompletion";

	var CLIENT_ID = "ODYT4S01VH3UCI2FAVNCPQ5JJVGTDBXLTGUFSJBKTAY3EXGR";
	var CLIENT_SECRET = "0MAO3USQG55PRI4A0UNUIJVQE51CNN55A5HJBBXUZIW5OGIS";

	return $.ajax({
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
		cache: true
	});
}

function foursquareSearch(query, centerCoordinate, categoryId){
	fs_url = "https://api.foursquare.com/v2/venues/search";

	var CLIENT_ID = "ODYT4S01VH3UCI2FAVNCPQ5JJVGTDBXLTGUFSJBKTAY3EXGR";
	var CLIENT_SECRET = "0MAO3USQG55PRI4A0UNUIJVQE51CNN55A5HJBBXUZIW5OGIS";

	return $.ajax({
		url: fs_url,
		data: {
			client_id: CLIENT_ID,
			client_secret: CLIENT_SECRET,
			ll: centerCoordinate.lat + ", " + centerCoordinate.lng,
			query: query,
			radius: 10000,
			limit: 10,
			categoryId: categoryId,
			v: "20170101"
		},
		dataType: "jsonp",
		cache: true
	});
}

function foursquareCategories(){
	fs_url = "https://api.foursquare.com/v2/venues/categories";

	var CLIENT_ID = "ODYT4S01VH3UCI2FAVNCPQ5JJVGTDBXLTGUFSJBKTAY3EXGR";
	var CLIENT_SECRET = "0MAO3USQG55PRI4A0UNUIJVQE51CNN55A5HJBBXUZIW5OGIS";

	return $.ajax({
		url: fs_url,
		data: {
			client_id: CLIENT_ID,
			client_secret: CLIENT_SECRET,
			v: "20170101"
		},
		dataType: "jsonp",
		cache: true
	});
}

// Initialize Map
var initMap = function() {

	var self = this;

	var observables = {
		places : ko.observableArray(model.favoritePlaces),
		suggestcompletion : ko.observableArray(),
		searchText : ko.observable(),
		categories : ko.observableArray(),
		selectedCategory : ko.observable()
	};

	// Map initial configuration
	var mapSetup = {
		center: new google.maps.LatLng(observables.places()[4]),
		zoom: 11,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	// Show the map in the element with id of "map"
	// and store the map object in variable map
	var map = {
		map: new google.maps.Map($('#map')[0], mapSetup),
		markers: []
	};

	makeMapMarkers(map, observables.places());

	// Place the initial markers
	setMapMarkers(map.map, map.markers);

	// Drops the marker of the place tapped or clicked
	// from the list returned by the searchBox
	var showPlaceLocation = function(placeInfo){
		clearMapMarkers(map.markers);
		makeMapMarkers(map, [placeInfo]);
		setMapMarkers(map.map, map.markers);
	};

	foursquareCategories().done(function(data){
		for(var i = 0; i < data.response.categories.length; i++){
			observables.categories.push({
				categoryName: data.response.categories[i].shortName,
				categoryId: data.response.categories[i].id
			});
		}
	});

	var autocomplete = function(){

		if(observables.searchText() == undefined || observables.searchText() == ""){
			observables.suggestcompletion([]);
			return null;
		}

		foursquareAutocomplete(observables.searchText(), model.favoritePlaces[0], observables.selectedCategory())
		.done(function(data){

			observables.suggestcompletion(formatDataFromFoursquare(data, "autocomplete"));

		})
		.fail(function(error){
			alert("Data failed to load. Try again after 3 minutes");
		});
	};

	var search = function(){
			foursquareSearch(observables.searchText(), model.favoritePlaces[0], observables.selectedCategory())
			.done(function(data){
				if(data.response.venues.length == 0){
					observables.places({name: "No results"});
					return null;
				}

				observables.places(formatDataFromFoursquare(data, "search_results"));

				clearMapMarkers(map.markers);
				makeMapMarkers(map, observables.places());
				setMapMarkers(map.map, map.markers);

			})
			.fail(function(error){
				alert("Data failed to load. Try again after 3 minutese");
			});

			return null;
	};

	observables.searchText.subscribe(function(){
		autocomplete();
	});
	// Apply the bindings
	ko.applyBindings({
		places: observables.places,
		showPlaceLocation: showPlaceLocation,
		autocomplete: autocomplete,
		search: search,
		searchText: observables.searchText,
		categories: observables.categories,
		selectedCategory: observables.selectedCategory,
		suggestcompletion: observables.suggestcompletion
	});
};
