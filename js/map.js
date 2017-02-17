/**
 * Sets markers on the map
 * @param {object} map     Map object that the markers will be set on
 */
function setMapMarkers(map, markers) {

    for (var i = 0; i < markers.length; i++) {
    	markers[i].setMap(map);
    }
}

/**
 * Clears all markers on the map
 * @param  {Array} markers Array of markers being deleted
 */	
function clearMapMarkers(markers){
	setMapMarkers(null, markers);
}

/**
 * Takes a map object and an array of places that
 * will replace the current set of places marked on the map
 * @param  {object} map         The map object that contains the map itself and its markers
 * @param  {array} places 		List of places with its associated information
 */
function makeMapMarkers(map, places){

	map.markers = [];
	var infoWindow = new google.maps.InfoWindow();

	// This will create and store markers in markers array variable
	// Each marker will be created with event listeners on click
	/**
	 * Creates and stores markers in map.markers
	 * Each marker will be created with event listner on click
	 * @param  {int} var i 			iterator
	 */
	for(var i = 0; i < places.length; i++){
		map.markers.push(new google.maps.Marker({
			position: places[i],
			animation: google.maps.Animation.DROP
		}));

		/**
		 * Sets the listener on current marker in the iteration
		 * @param  {[type]} marker [description]
		 * @param  {[type]} places [description]
		 * @return {[type]}        [description]
		 */
		(function (marker, places) {
    		marker.addListener('click', function(){
    			infoWindow.setContent(
    				((places.name != undefined) ? "<h5>" + places.name + "</h5>" : "")
    				+ ((places.address != undefined) ? "<p>" + places.address + "</p>" : "")
    				+ ((places.phone != undefined) ? "<p>" + places.phone + "</p>" : "")
    				+ ((places.url != undefined) ? "<a href='" + places.url + "'>" + places.url + "</a>" : ""));
		    	infoWindow.open(map, marker);

		    	/**
		    	 * Make the marker bounce on tap or click
		    	 */
		    	marker.setAnimation(google.maps.Animation.BOUNCE)

		    	/**
		    	 * Sets how long the marker should bounce
		    	 */
		    	setTimeout(function(){ marker.setAnimation(null); }, 1400);
		    })
	    })(map.markers[i], places[i]);
	}
}

function showInfoWindow(markers, placeInfo){
	markers.forEach(function(marker){
		if(placeInfo.lat == marker.position.lat() && placeInfo.lng == marker.position.lng()){
			google.maps.event.trigger(marker, 'click');
		}
	});
}
/**
 * Formats the data based on its purpose
 * @param  {object} data    Object that has the information that needs reformatting
 * @param  {string} purpose Puspose in which the result will be used for
 * @return {array}         Array of formatted objects based on purpose
 */
function formatDataFromFoursquare(data, purpose){

	var places = [];

	if(purpose == "autocomplete"){
		for(var i = 0; i < data.response.minivenues.length; i++){
			places.push({
				name	: data.response.minivenues[i].name,
				lat 	: data.response.minivenues[i].location.lat,
				lng 	: data.response.minivenues[i].location.lng
			});
		}
	}
	else if(purpose == "search_results"){
		for(var i = 0; i < data.response.venues.length; i++){

			var address = data.response.venues[i].location.formattedAddress;
			var cleanData = {
				address: ""
			};

			address.forEach(function(addressPart, index, addressArray){
				if(index != addressArray.length-1){
					cleanData.address += addressPart + ", ";
				}
				else{
					cleanData.address += addressPart;
				}
			});

			cleanData.name	= data.response.venues[i].name,
			cleanData.lat 	= data.response.venues[i].location.lat,
			cleanData.lng 	= data.response.venues[i].location.lng,
			cleanData.phone 	= data.response.venues[i].contact.formattedPhone,
			cleanData.url 	= data.response.venues[i].url

			places.push(cleanData);
		}
	}

	return places;
}

/**
 * Request autocomplete data from foursquare
 * @param  {string} query            The string that is being autocompleted
 * @param  {object} centerCoordinate Coordinates where the search will be biased on
 * @param  {string} categoryId       Category to search from
 * @return {Promise}                 A promise object that has the data requested from foursquare
 */
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

/**
 * Request places' data from foursquare
 * @param  {string} query            The term being searched for
 * @param  {object} centerCoordinate Coordinates where the search will be biased on
 * @param  {string} categoryId       Category to search from
 * @return {Promise}                 A promise object that has the data requested from foursquare
 */
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
			limit: 20,
			categoryId: categoryId,
			v: "20170101"
		},
		dataType: "jsonp",
		cache: true
	});
}

/**
 * Request possible categories from foursquare
 * @return {object} Promise object that holds the data fro foursquare
 */
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

/**
 * Initializes the map
 */
var initMap = function() {

	var self = this;

	var observables = {
		places : ko.observableArray(),
		suggestcompletion : ko.observableArray(),
		searchText : ko.observable(),
		categories : ko.observableArray(),
		selectedCategory : ko.observable()
	};

	var mapCenterSelect = {
		san_jose: {
			lat: 37.3382082,
			lng: -122.0450548
		}
	}

	/**
	 * Drops the marker of the place tapped or clicked
	 * from the list of places under the searchBox
	 * @type {Object}
	 */
	var mapFunctions = {
		showPlaceLocation: function(placeInfo){
			showInfoWindow(map.markers, placeInfo);
		},
		autocomplete: function(){
			if(observables.searchText() == undefined || observables.searchText() == ""){
				observables.suggestcompletion([]);
				return null;
			}

			foursquareAutocomplete(observables.searchText(), mapCenterSelect.san_jose, observables.selectedCategory())
			.done(function(data){

				observables.suggestcompletion(formatDataFromFoursquare(data, "autocomplete"));

			})
			.fail(function(error){
				alert("Data failed to load. Try again after 3 minutes");
			});
		},
		search: function(){
			foursquareSearch(observables.searchText(), mapCenterSelect.san_jose, observables.selectedCategory())
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
		}
	};

	/**
	 * Map configurations
	 * @type {Object}
	 */
	var mapSetup = {
		center: new google.maps.LatLng(mapCenterSelect.san_jose),
		zoom: 12,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	var map = {
		map: new google.maps.Map($('#map')[0], mapSetup),
		markers: []
	};
	
	observables.searchText();
	observables.selectedCategory();

	mapFunctions.search();

	foursquareCategories().done(function(data){
		for(var i = 0; i < data.response.categories.length; i++){
			observables.categories.push({
				categoryName: data.response.categories[i].shortName,
				categoryId: data.response.categories[i].id
			});
		}
	});

	observables.searchText.subscribe(function(){
		mapFunctions.autocomplete();
	});
	
	/**
	 * Apply bindings
	 */
	ko.applyBindings({
		places: observables.places,
		showPlaceLocation: mapFunctions.showPlaceLocation,
		autocomplete: mapFunctions.autocomplete,
		search: mapFunctions.search,
		searchText: observables.searchText,
		categories: observables.categories,
		selectedCategory: observables.selectedCategory,
		suggestcompletion: observables.suggestcompletion
	});
};
