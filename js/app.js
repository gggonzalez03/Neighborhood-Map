var model = {
	favoritePlaces: [
		//San Jose
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
//(c) Google
var initMap = function() {
	var mapSetup = {
		center: new google.maps.LatLng(model.favoritePlaces[0]),
		zoom: 11,
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