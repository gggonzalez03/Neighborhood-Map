// Initialize Map
var initMap = function() {
	// Map configuration
	var mapSetup = {
		center: new google.maps.LatLng(model.favoritePlaces[0]),
		zoom: 11,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	//Show the map in the element with id of "map"
	var map = new google.maps.Map(document.getElementById('map'), mapSetup);

	// Place the initial markers
	var marker = [];
	for(var i = 0; i < model.favoritePlaces.length; i++){
		marker.push(new google.maps.Marker({
			position: model.favoritePlaces[i]
		}));
		marker[i].setMap(map);
	}

	function setMapOnAll(map) {
        for (var i = 0; i < marker.length; i++) {
        	marker[i].setMap(map);
        }
    }

    // This will make the input a searchBox
	var searchBox = new google.maps.places.SearchBox($('#searchBox')[0]);

	// Set the searchBox search bias whenever the map bounds change
	map.addListener('bounds_changed', function() {
		searchBox.setBounds(map.getBounds());
	});

	// Change the markers whenever a search is done
	searchBox.addListener('places_changed', function() {
		setMapOnAll(null);
  		marker = [];
		for(var i = 0; i < searchBox.getPlaces().length; i++){
			marker.push(new google.maps.Marker({
				position: {
					lat: searchBox.getPlaces()[i].geometry.location.lat(),
					lng: searchBox.getPlaces()[i].geometry.location.lng()
				}
			}));

			marker[i].setMap(map);
		}
	});
};