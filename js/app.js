var model = {
	favoritePlaces: [
		{
			name: "San Jose",
			lat: 37.3382082,
			lng: -122.0450548
		},
		{
			name: "De Anza College",
			lat: 37.31953960000001,
			lng: -122.04447070000003
		},
        {
        	name: "Cathedral of Faith",
        	lat: 37.2920879,
        	lng: -121.87471370000003
        },
        {
        	name: "Children's Discovery Museum of San Jose",
        	lat: 37.32686159999999,
        	lng: -121.89209349999999
        },
        {
        	name: "Intel Museum",
        	lat: 37.3875909,
        	lng: -121.9637869
        }
	]
};

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
	var autocomplete = new google.maps.places.SearchBox($('#autocomplete')[0]);

	// Set the searchBox search bias whenever the map bounds change
	map.addListener('bounds_changed', function() {
		autocomplete.setBounds(map.getBounds());
	});

	// Change the markers whenever a search is done
	autocomplete.addListener('places_changed', function() {
		setMapOnAll(null);
  		marker = [];
		for(var i = 0; i < autocomplete.getPlaces().length; i++){
			marker.push(new google.maps.Marker({
				position: {
					lat: autocomplete.getPlaces()[i].geometry.location.lat(),
					lng: autocomplete.getPlaces()[i].geometry.location.lng()
				}
			}));

			marker[i].setMap(map);
		}
	});
};


var viewModel = function(){
	
	this.favoritePlaces = model.favoritePlaces;
};

ko.applyBindings(new viewModel());