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

	map.markers([]);
	// This will create and store markers in markers array variable
	// Each marker will be created with event listeners on click
	/**
	 * Creates and stores markers in map.markers
	 * Each marker will be created with event listner on click
	 * @param  {int} var i 			iterator
	 */
	for(var i = 0; i < places.length; i++){
		places[i].animation = google.maps.Animation.DROP;
		map.markers.push(new google.maps.Marker(places[i]));

		(function (marker) {
			marker.addListener('click', function(){
    			showInfoWindow(map, marker);
			}
		)})(map.markers()[i]);
	}
}

function showInfoWindow(map, placeInfo){
	/**
	 * Sets the listener on the placeInfo marker
	 * @param  {[type]} marker [description]
	 * @param  {[type]} places [description]
	 * @return {[type]}        [description]
	 */
    map.infoWindow.setContent(
    	((placeInfo.name != undefined) ? "<h5>" + placeInfo.name + "</h5>" : "")
    	+ ((placeInfo.address != undefined) ? "<p>" + placeInfo.address + "</p>" : "")
    	+ ((placeInfo.phone != undefined) ? "<p>" + placeInfo.phone + "</p>" : "")
   		+ ((placeInfo.url != undefined) ? "<a href='" + placeInfo.url + "'>" + placeInfo.url + "</a>" : ""));
   	map.infoWindow.open(map, placeInfo);
	/**
	 * Make the marker bounce on tap or click
	*/
	placeInfo.setAnimation(google.maps.Animation.BOUNCE)
	/**
	* Sets how long the marker should bounce
	*/
	setTimeout(function(){ placeInfo.setAnimation(null); }, 1400);
}

/**
 * Initializes the map
 */
function initMap(){

	var self = this;

	var observables = {
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
	 * Map configurations
	 * @type {Object}
	 */
	var mapSetup = {
		center: new google.maps.LatLng(mapCenterSelect.san_jose),
		zoom: 14,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	var map = {
		map: new google.maps.Map($('#map')[0], mapSetup),
		markers: ko.observableArray(),
		visibleMarkers: ko.observableArray(),
		infoWindow : new google.maps.InfoWindow()
	};

	/**
	 * Drops the marker of the place tapped or clicked
	 * from the list of places under the searchBox
	 * @type {Object}
	 */
	var mapFunctions = {
		showPlaceLocation: function(placeInfo){
			showInfoWindow(map, placeInfo);
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
		categories: function(){
			foursquareCategories().done(function(data){
				observables.categories(data.response.categories);
			});
		},
		search: function(){
			foursquareSearch(observables.searchText(), mapCenterSelect.san_jose, observables.selectedCategory())
			.done(function(data){
				/**
				 * observables.places should be edited globally from here
				 */

				if(data.response.venues.length == 0){
					return null;
				}

				clearMapMarkers(map.markers());
				makeMapMarkers(map, formatDataFromFoursquare(data, "search_results"));
				setMapMarkers(map.map, map.markers());

				map.visibleMarkers(map.markers());

			})
			.fail(function(error){
				alert("Data failed to load. Try again after 3 minutes");
			});

			return null;
		},
		filterMarkers: function(){
			map.infoWindow.close();
			map.visibleMarkers([]);
			if(observables.selectedCategory() != undefined){
				map.markers().forEach(function(marker){
					marker.setVisible(false);
					if(isUnderCategory(observables.selectedCategory(), marker, observables.categories())){
						marker.setVisible(true);
						map.visibleMarkers.push(marker);
					}
				});
				map.markers.valueHasMutated();
			}
			else{
				map.markers().forEach(function(marker){
					marker.setVisible(true);
				});
				map.visibleMarkers(map.markers());
			}
		}
	};
	
	//observables.searchText();
	//observables.selectedCategory();
	mapFunctions.search();
	mapFunctions.categories();



	// Knockout subscriptions
	observables.searchText.subscribe(function(){
		mapFunctions.autocomplete();
	});
	/**
	 * Apply bindings
	 */
	ko.applyBindings({
		markers: map.markers,
		visibleMarkers: map.visibleMarkers,
		showPlaceLocation: mapFunctions.showPlaceLocation,
		autocomplete: mapFunctions.autocomplete,
		search: mapFunctions.search,
		filterMarkers: mapFunctions.filterMarkers,
		searchText: observables.searchText,
		categories: observables.categories,
		selectedCategory: observables.selectedCategory,
		suggestcompletion: observables.suggestcompletion
	});
};
