var model = {
	favoritePlaces: [
		{lat: 37.7831, lng: -122.4039},
		//(c) Google
		{lat: -31.563910, lng: 147.154312},
        {lat: -33.718234, lng: 150.363181},
        {lat: -33.727111, lng: 150.371124},
        {lat: -33.848588, lng: 151.209834}
	]
};

// Initialize Map
//(c) Google
var initMap = function() {
	var mapSetup = {
		center: new google.maps.LatLng(model.favoritePlaces[0]),
		zoom: 15,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	var map = new google.maps.Map(document.getElementById('map'), mapSetup);

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

	var autocomplete = new google.maps.places.SearchBox($('#autocomplete')[0]);

	map.addListener('bounds_changed', function() {
          autocomplete.setBounds(map.getBounds());
        });

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