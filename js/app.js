var model = {
	favoritePlaces: [
		{
			lat: 37.7831,
			lng: -122.4039
		},
		//(c) Google
		{lat: -31.563910, lng: 147.154312},
        {lat: -33.718234, lng: 150.363181},
        {lat: -33.727111, lng: 150.371124},
        {lat: -33.848588, lng: 151.209834},
        {lat: -33.851702, lng: 151.216968},
        {lat: -34.671264, lng: 150.863657},
        {lat: -35.304724, lng: 148.662905},
        {lat: -36.817685, lng: 175.699196},
        {lat: -36.828611, lng: 175.790222},
        {lat: -37.750000, lng: 145.116667},
        {lat: -37.759859, lng: 145.128708},
        {lat: -37.765015, lng: 145.133858},
        {lat: -37.770104, lng: 145.143299},
        {lat: -37.773700, lng: 145.145187},
        {lat: -37.774785, lng: 145.137978},
        {lat: -37.819616, lng: 144.968119},
        {lat: -38.330766, lng: 144.695692},
        {lat: -39.927193, lng: 175.053218},
        {lat: -41.330162, lng: 174.865694},
        {lat: -42.734358, lng: 147.439506},
        {lat: -42.734358, lng: 147.501315},
        {lat: -42.735258, lng: 147.438000},
        {lat: -43.999792, lng: 170.463352}
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

	var request = {
	    location: model.favoritePlaces[0],
	    radius: '500',
	    query: 'burgers'
	  };

	 function setMapOnAll(map) {
        for (var i = 0; i < marker.length; i++) {
          marker[i].setMap(map);
        }
      }

	  service = new google.maps.places.PlacesService(map);
	  service.textSearch(request, callback);

	  function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
  	setMapOnAll(null);
  	marker = [];
    for (var i = 0; i < results.length; i++) {
      marker.push(new google.maps.Marker({
			position: {lat: results[i].geometry.location.lat(),
				lng: results[i].geometry.location.lng()}
		}));
		marker[i].setMap(map);
    }
  }
}



	/*var acOptions = {
		types: ['establishment']
	};

	var autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'), acOptions);
	autocomplete.bindTo('bounds', map);

	var infoWindow = new google.maps.InfoWindow();

	google.maps.event.addListener(autocomplete, 'place_changed', function() {
		infoWindow.close();
		var place = autocomplete.getPlace();

		if (place.geometry.viewport) {
			map.fitBounds(place.geometry.viewport);
		}
		else {
			map.setCenter(place.geometry.location);
			map.setZoom(17);
		}
		marker.setPosition(place.geometry.location);
		infoWindow.setContent('<div><strong>' + place.name + '</strong><br>');
		infoWindow.open(map, marker);
		google.maps.event.addListener(marker,'click',function(e){

		infoWindow.open(map, marker);

		});
	});*/
};


var viewModel = function(){
	
};

ko.applyBindings(new viewModel());