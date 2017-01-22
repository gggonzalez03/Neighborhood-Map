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


var viewModel = function(){
	
	this.favoritePlaces = model.favoritePlaces;
};

ko.applyBindings(new viewModel());