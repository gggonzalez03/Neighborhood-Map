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
			intent: "checkin",
			radius: 10000,
			limit: 50,
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
				id 		: data.response.minivenues[i].id,
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

			cleanData.id 	= data.response.venues[i].id,
			cleanData.name	= data.response.venues[i].name,
			cleanData.position = {
				lat: data.response.venues[i].location.lat,
				lng: data.response.venues[i].location.lng
			},
			cleanData.phone 	= data.response.venues[i].contact.formattedPhone,
			cleanData.url 	= data.response.venues[i].url,
			cleanData.categories = data.response.venues[i].categories

			places.push(cleanData);
		}
	}

	return places;
}


function isUnderCategory(categoryId, place, catHier){

	var underCategory = false;

	catHier.forEach(function(topCat){
		if(topCat.id == categoryId){
			place.categories.forEach(function(placeCat){
				topCat.categories.forEach(function(subCat){
					if(placeCat.id == subCat.id){
						underCategory = true;
					}
				});
			});
		}
	});

	return underCategory;
}