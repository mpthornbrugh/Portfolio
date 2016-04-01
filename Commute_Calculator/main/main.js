'use strict';

angular.module('commuteCalculator.main', ['ngRoute'])

	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/main', {
			templateUrl: 'main/view.html',
			controller: 'MainCtrl'
		});
	}])

	.directive('customOnChange', function () {
		return {
			restrict: 'A',
			link: function (scope, element, attrs) {
				var onChangeFunc = scope.$eval(attrs.customOnChange);
				element.bind('change', onChangeFunc);
			}
		};
	})
	.controller('MainCtrl', ['$scope', 'CommuteServices', '$location', function ($scope, CommuteServices, $location) {
		//Initializations
		var file, isCsv, curId = 2;
		var averages = [];
		var addressArray = [];
		var totalTravels = [];
		var totalCompleted = 0;
		var timer;
		var travelArray = [];
		var delay = 100;
		var currentIndex = 0;
		var geocodeDelay = 100;
		var codingIndex = 0;
		var codedArr = [];
		var avgLat, avgLng;
		var locations = [];
		var directions = [];
		var calculatedDirections = [];
		var directionsIndex = 0;
		var centralLoc;
		var locationChange = .44;
		var numLocations = 0;
		var map;
		var infoWindow;
		var service;
		var firstPathComplete;
		var geoRetryCount = 0;
		var directionRetryCount = 0;
		var currentJquerySelectorId;
		var mapOverlay = $(".mapSelectorOverlay");

		$scope.showMap = false;
		mapOverlay.hide();

		$scope.openMap = function (address) {
			$scope.showMap = true;
			mapOverlay.fadeIn();
			$('#us2-address').val(address.address);
			currentJquerySelectorId = address.id;
			if (address.address && address.address != "") {
				$scope.geoCoder = new google.maps.Geocoder();
				$scope.geoCoder.geocode({'address': address.address}, function (results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						$('#us2').locationpicker({
							location: {latitude: results[0].geometry.location.lat(), longitude: results[0].geometry.location.lng()},
							radius: 0,
							inputBinding: {
								locationNameInput: $('#us2-address')
							},
							enableAutocomplete: true
						});
					}
					else {
						alert("Geocode was not successful for the following reason: " + status);
					}
				});
			}
			else {
				$('#us2').locationpicker({
					location: {latitude: 40.745280, longitude: -73.993950},
					radius: 0,
					inputBinding: {
						latitudeInput: $('#us2-lat'),
						longitudeInput: $('#us2-lon'),
						locationNameInput: $('#us2-address')
					},
					enableAutocomplete: true
				});
			}
		};

		$scope.doneWithJquerySelector = function () {
			$scope.workAddresses[currentJquerySelectorId - 1].address = $("#us2-address").val();
			$scope.showMap = false;
			mapOverlay.fadeOut();
		};

		$scope.showForm = true;
		hideLoading();

		$scope.workAddresses = [
			{
				"id": 1,
				"class": ""
			},
			{
				"id": 2,
				"class": ""
			}
		];

		//The following two functions are used for the GUI. They are self explanitory
		$scope.addWorkAddress = function () {
			curId++;
			$scope.workAddresses.push({"id": curId, "class": ""});
		};

		$scope.removeWorkAddress = function () {
			curId--;
			var lastItem = $scope.workAddresses.length - 1;
			$scope.workAddresses.splice(lastItem);
		};

		//This function checks if the input file is new and checks that it is a csv
		$scope.newFile = function () {
			file = event.target.files[0];
			var fileArr = file.name.split(".");
			isCsv = ("csv" == fileArr[fileArr.length - 1].toLowerCase());
		};

		//The following two functions are used to hide and show the loading picture.
		function showLoading() {
			$(".loading").fadeIn();
		}

		function hideLoading() {
			$(".loading").fadeOut();
		}

		//This function is used to check for good input
		function readFile() {
			directionRetryCount = 0;
			geoRetryCount = 0;
			timer = new Date().getTime();
			var hasErrorAddress = false;
			//Apply classes for good/bad input
			for (var i in $scope.workAddresses) {
				var addressId = "#addressInput" + $scope.workAddresses[i].id;
				var addressItem = $(addressId);
				addressItem.removeClass("redInput");
				addressItem.removeClass("greenInput");
				addressItem.addClass($scope.workAddresses[i].class);
				if ($scope.workAddresses[i].class == "redInput") {
					hasErrorAddress = true;
				}
			}

			if (file && isCsv && !hasErrorAddress) {
				parseFileContent(file);
				$scope.startHeatMap();
			}
		}

		//Asynchronous geocoding call for checking valid input
		var x;
		var loopGeocodeArray = function (arr) {
			if (x < arr.length) {
				doGeocode(arr[x], x, function () {
					// set x to next item
					x++;

					loopGeocodeArray(arr);
				});
			}
			else {
				readFile();
			}
		};

		//Used along with the above function.
		function doGeocode(address, index, callback) {
			var addr = address.address;
			// Get geocoder instance
			var geocoder = new google.maps.Geocoder();

			// Geocode the address
			geocoder.geocode({'address': addr}, function (results, status) {
				if (status === google.maps.GeocoderStatus.OK && results.length > 0) {

					$scope.workAddresses[index].class = "greenInput";
					// show an error if it's not
					callback();
				}
				else {
					$scope.workAddresses[index].class = "redInput";
					callback();
				}
			});
		}

		//This is the function that is called from the form
		$scope.readFile = function () {
			x = 0;
			loopGeocodeArray($scope.workAddresses);
		};

		//This is a function that was originally used to create the heat map, but is now used just to geocode all the addresses
		$scope.startHeatMap = function () {
			Papa.parse(file, {
				complete: function (results) {
					var locationsArr = [];
					var mappings = {};
					for (var i = 1; i < results.data.length; i++) {
						var index;
						for (var j in results.data[0]) {
							mappings[results.data[0][j].toLowerCase()] = j;
							if (results.data[0][j].toLowerCase() == "remote") {
								index = j;
							}
						}
						if (results.data[i][index].toLowerCase() == "") {
							locationsArr.push(results.data[i]);
						}
					}
					convertHeatMapFileString(mappings, locationsArr);
				}
			});
		};

		//This function is used to take the file contents and create a formatted array from it.
		function convertHeatMapFileString (mappings, locations) {
			var mappedArr = [];
			var testString = "";
			for (var j in locations) {
				var buildAddress = locations[j][mappings["home address 1"]];
				if (locations[j][mappings["home address 2"]] != "") {
					buildAddress += " " + locations[j][mappings["home address 2"]];
				}
				buildAddress += " " + locations[j][mappings["home city"]] + ", " + locations[j][mappings["home state"]];
				buildAddress += " " + locations[j][mappings["zip"]];
				mappedArr[j] = {
					"name": locations[j][mappings["first name"]],
					"address": buildAddress
				};
				testString += buildAddress + "\n";
			}

			numLocations = mappedArr.length;

			codingIndex = 0;
			showLoading();
			codeAddresses(mappedArr);
		}

		//Controller for geocoding the csv addresses.
		function codeAddresses(mappedArr) {
			if (codingIndex < mappedArr.length) {
				setTimeout(function () {
					codeAddress(mappedArr[codingIndex], mappedArr);
				}, geocodeDelay);
			}
			else {
				CommuteServices.populateGeocodedAddresses(codedArr);
				goNext();
				//calculateCenterLatLng();
			}
		}

		//Asynchronous -- Geocodes a single address
		function codeAddress(addressObj, mappedArr) {
			var geocoder = new google.maps.Geocoder();

			var address = addressObj.address;
			geocoder.geocode( { 'address': address}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					addressObj.lat = results[0].geometry.location.lat();
					addressObj.lng = results[0].geometry.location.lng();
					codedArr.push(addressObj);
					moveImage(totalCompleted, codedArr.length);
					codingIndex++;
					codeAddresses(mappedArr);
				} else {
					if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
						geocodeDelay += 5;
						geoRetryCount++;
						codeAddresses(mappedArr);
					}
					else {
						alert("Geocode was not successful for the following reason: " + status);
					}
				}
			});
		}

		//########################################################################################
		//########################################################################################
		//   All functions here were used for testing creating a heat map, they aren't in use
		//########################################################################################
		//########################################################################################
		function initMap() {
			map = new google.maps.Map(document.getElementById('map'), {
				center: {lat: avgLat, lng: avgLng},
				zoom: 15,
				styles: [{
					stylers: [{ visibility: 'simplified' }]
				}, {
					elementType: 'labels',
					stylers: [{ visibility: 'off' }]
				}]
			});

			infoWindow = new google.maps.InfoWindow();
			service = new google.maps.places.PlacesService(map);

			// The idle event is a debounced event, so we can query & listen without
			// throwing too many requests at the server.
			map.addListener('idle', performSearch);
		}

		function performSearch() {
			var sw = new google.maps.LatLng(avgLat - locationChange, avgLng - locationChange);
			var ne = new google.maps.LatLng(avgLat + locationChange, avgLng + locationChange);
			var searchBounds = new google.maps.LatLngBounds(sw, ne);

			var request = {
				bounds: searchBounds,
				type: 'store'
			};
			service.radarSearch(request, callback);
		}

		function callback(results, status) {
			if (status !== google.maps.places.PlacesServiceStatus.OK) {
				console.error(status);
				return;
			}
			for (var i = 0, result; result = results[i]; i++) {
				locations.push({
					"lat":result.geometry.location.lat(),
					"lng":result.geometry.location.lng()
				});
			}

			//Need to make a large array of origins (codedArr) to destinations (locations)
			for (var j in locations) {
				for (var i in codedArr) {
					var newObject = {
						"origin":new google.maps.LatLng(codedArr[i].lat, codedArr[i].lng),
						"destination":new google.maps.LatLng(locations[j].lat, locations[j].lng)
					};
					directions.push(newObject);
				}
			}
			//directions array will be [all origins/destinations for location 1, ---- for location 2, etc....]
			//This is done so that the averages can be done easier. (sum the first codedArr.length elements and divide by codedArr.length)

			//Need to calculate travel time averages from all of the home addresses to the addresses in the locations array.
			//Need to create a new calculate25 and associated functions for the heatmap.
			directionsIndex = 0;
			totalCompletedHeatMap = 0;
			heatTime = new Date().getTime();
			calculateNext25HeatMap();
		}

		function calculateNext25HeatMap() {
			if (directionsIndex < directions.length) {
				var origins = [];
				var destination;
				for (var i = 0; i < 25; i++) {
					origins.push(directions[directionsIndex].origin);
					if (!destination) {
						destination = directions[directionsIndex].destination;
					}
					else if (destination.lat() != directions[directionsIndex].destination.lat() || destination.lng() != directions[directionsIndex].destination.lng()) {
						break; //Destination changed
					}
					directionsIndex++;
					if (directionsIndex > directions.length) {
						break;
					}
				}
				setTimeout(function () {
					calculateTravelTime25HeatMap(origins, destination, origins.length, calculateNext25HeatMap);
				}, heatMapDelay);
			}
			else {
				//Done
			}
		}

		var totalCompletedHeatMap = 0;
		var heatMapDelay = 100;

		function calculateTravelTime25HeatMap(origins, destination, numSent, next) {
			var service = new google.maps.DistanceMatrixService();
			service.getDistanceMatrix(
				{
					origins: origins,
					destinations:[destination],
					travelMode: google.maps.TravelMode.DRIVING
				}, callback);

			function callback(response, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					totalCompletedHeatMap += response.rows.length;
					moveImage(totalCompletedHeatMap / directions.length);
					add25HeatMap(response.rows, next);
					retryCount = 0;
				}
				else {
					//Sending requests too fast
					if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
						heatMapDelay += 5;
						//Retry the current request
						retryCount++;
						directionsIndex -= numSent;
						next();
					}
					else {
						console.log("Google Maps API Error: " + status);
					}
				}
			}
		}

		var heatTime;
		var retryCount = 0;

		function add25HeatMap(rows, next) {
			for (var i in rows) {
				calculatedDirections.push(rows[i].elements[0].duration);
			}
			var end = new Date().getTime();
			heatTime = end;
			next();
		}

		function calculateCenterLatLng() {
			var latSum = 0;
			var lngSum = 0;
			for (var i in codedArr) {
				latSum += codedArr[i].lat;
				lngSum += codedArr[i].lng;
			}
			avgLat = latSum/codedArr.length;
			avgLng = lngSum/codedArr.length;

			centralLoc = new google.maps.LatLng(avgLat,avgLng);
			initMap();
		}
		//########################################################################################
		//########################################################################################
		//   All functions here were used for testing creating a heat map, they aren't in use
		//########################################################################################
		//########################################################################################

		//Uses the third party program Papa parse to parse a csv file quickly.
		function parseFileContent(file) {
			Papa.parse(file, {
				complete: function (results) {
					var nonRemoteArr = [];
					var remoteArr = [];
					addressArray = [];
					var mappings = {};
					for (var i = 1; i < results.data.length; i++) {
						var index;
						for (var j in results.data[0]) {
							mappings[results.data[0][j].toLowerCase()] = j;
							if (results.data[0][j].toLowerCase() == "remote") {
								index = j;
							}
						}
						if (results.data[i][index].toLowerCase() != "") {
							remoteArr.push(results.data[i]);
						}
						else {
							nonRemoteArr.push(results.data[i]);
						}
					}
					addressArray.push(nonRemoteArr);
					addressArray.push(remoteArr);
					CommuteServices.populateWorkLocations($scope.workAddresses);
					CommuteServices.populateEmployeeLocations(addressArray);
					CommuteServices.populateNumEmployees(addressArray[0].length + addressArray[1].length);
					convertToSingleStringAddresses(mappings);
				}
			});
		}

		//This function takes the text from the parsing and formats it.
		function convertToSingleStringAddresses(mappings) {
			var mappedArr = [];
			var testString = "";
			for (var i = 0; i < 2; i++) {
				mappedArr[i] = [];
				for (var j in addressArray[i]) {
					var buildAddress = addressArray[i][j][mappings["home address 1"]];
					if (addressArray[i][j][mappings["home address 2"]] != "") {
						buildAddress += " " + addressArray[i][j][mappings["home address 2"]];
					}
					buildAddress += " " + addressArray[i][j][mappings["home city"]] + ", " + addressArray[i][j][mappings["home state"]];
					buildAddress += " " + addressArray[i][j][mappings["zip"]];
					mappedArr[i][j] = {
						"name": addressArray[i][j][mappings["first name"]],
						"address": buildAddress
					};
					testString += buildAddress + "\n";
				}
			}
			calculateTravelTimes(mappedArr);
		}


		//This function takes all of the csv file items and organizes them for easier use later.
		function calculateTravelTimes(mappedArr) {
			currentIndex = 0;
			travelArray = [];
			for (var n in $scope.workAddresses) {
				totalTravels[n] = {
					"DRIVING": [],
					"BICYCLING": [],
					"TRANSIT": []
				};
			}

			for (var k in $scope.workAddresses) {
				for (var i = 0; i < 2; i++) {
					for (var j in mappedArr[i]) {
						travelArray.push({
							"start": mappedArr[i][j]["address"],
							"end": $scope.workAddresses[k]["address"],
							"mode": "DRIVING",
							"isRemote": (i != 0),
							"name": mappedArr[i][j]["name"],
							"workNum": k
						});
					}
				}

				for (var i = 0; i < 2; i++) {
					for (var j in mappedArr[i]) {
						travelArray.push({
							"start": mappedArr[i][j]["address"],
							"end": $scope.workAddresses[k]["address"],
							"mode": "BICYCLING",
							"isRemote": (i != 0),
							"name": mappedArr[i][j]["name"],
							"workNum": k
						});
					}
				}

				for (var i = 0; i < 2; i++) {
					for (var j in mappedArr[i]) {
						travelArray.push({
							"start": mappedArr[i][j]["address"],
							"end": $scope.workAddresses[k]["address"],
							"mode": "TRANSIT",
							"isRemote": (i != 0),
							"name": mappedArr[i][j]["name"],
							"workNum": k
						});
					}
				}
			}

			showLoading();
			calculateNext25();
		}

		//This function is used as the "controller" for the travel time calculations. This organizes when to make calls to where.
		function calculateNext25() {
			if (currentIndex < travelArray.length) {
				var origins = [];
				var destination;
				var mode;
				var isRemoteArr = [];
				var names = [];
				var workNums = [];

				var cnt = 1;

				for (var i = currentIndex; i < travelArray.length; i++) {
					if (mode && travelArray[i].mode != mode) {
						break;
					}
					if (cnt > 25) {
						break;
					}
					if (!destination) {
						destination = travelArray[i].end;
					}
					if (destination != travelArray[i].end) {
						break;
					}
					cnt++;
					if (!mode) {
						mode = travelArray[i].mode;
					}
					currentIndex++;
					origins.push(travelArray[i].start);
					isRemoteArr.push(travelArray[i].isRemote);
					names.push(travelArray[i].name);
					workNums.push(travelArray[i].workNum);
				}

				setTimeout(function () {
					calculateTravelTime25(origins, destination, mode, isRemoteArr, names, workNums, origins.length, calculateNext25)
				}, delay);

			}
			else {
				doneCalculating();
			}
		}

		//This is the asynchronous call. We need to wait for it to finish before we can do the next step. (Which normally is to call this again.)
		function calculateTravelTime25(origins, destination, travelMethod, isRemoteArr, names, workAddressNumArr, numToCalc, next) {
			//https://developers.google.com/maps/documentation/javascript/distancematrix#distance_matrix_requests
			var service = new google.maps.DistanceMatrixService();
			if (travelMethod == "BICYCLING") {
				service.getDistanceMatrix(
					{
						origins: origins,
						destinations: [destination],
						travelMode: google.maps.TravelMode.BICYCLING
					}, callback);
			}
			else if (travelMethod == "DRIVING") {
				service.getDistanceMatrix(
					{
						origins: origins,
						destinations: [destination],
						travelMode: google.maps.TravelMode.DRIVING
					}, callback);
			}
			else if (travelMethod == "TRANSIT") {
				service.getDistanceMatrix(
					{
						origins: origins,
						destinations: [destination],
						travelMode: google.maps.TravelMode.TRANSIT
					}, callback);
			}

			//Callback for the google maps api. This checks if we need to retry or if we need to add the results to the array.
			function callback(response, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					totalCompleted += response.rows.length;
					moveImage(totalCompleted, codedArr.length);
					add25TravelTimes(response.rows, isRemoteArr, travelMethod, names, workAddressNumArr, next);
				}
				else {
					//Sending requests too fast
					if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
						delay += 2;
						directionRetryCount++;
						//Retry the current request
						currentIndex -= numToCalc;
						next();
					}
					else {
						console.log("Google Maps API Error: " + status);
					}
				}
			}
		}

		//This function is used to show a "loading" bar
		function moveImage(totalTravelsCalculated, totalGeolocationsCalculated) {
			var percent = ((totalTravelsCalculated/travelArray.length) * 0.5) + ((totalGeolocationsCalculated/numLocations) * 0.5);
			var img = $(".car-gif");
			var imgWidth = img.width();
			var pageWidth = $(document).width();
			var moveWidth = pageWidth - imgWidth;
			var moveDis = percent * moveWidth;
			img.css("left", moveDis + "px");
		}

		//This function is used with the asynchronous calculateTravelTime function so that after items are calculated they are added to the array
		function add25TravelTimes(objects, isRemoteArr, travelMethod, names, workAddressNumArr, next) {
			for (var i in objects) {
				var object = objects[i].elements[0];
				if (object.status == "ZERO_RESULTS") {
					object.distance = {
						text:"No Path",
						value:100000
					};

					object.duration = {
						text:"No Path",
						value:86400
					};
				}
				object.isRemote = isRemoteArr[i];
				object.name = names[i];
				object.workAddress = $scope.workAddresses[workAddressNumArr[i]].address;
				totalTravels[workAddressNumArr[i]][travelMethod].push(object);
			}
			next();
		}

		//This function is for after all of the travel times have been calculated. This organizes and calculates averages.
		function doneCalculating() {
			for (var key in $scope.workAddresses) {
				if ($scope.workAddresses.hasOwnProperty(key)) {
					var count = 0;
					var drivingNoResultCount = 0;
					var bicyclingNoResultCount = 0;
					var transitNoResultCount = 0;
					var countNoRemote = 0;
					var drivingSum = 0;
					var drivingSumNoRemote = 0;
					var bicyclingSum = 0;
					var bicyclingSumNoRemote = 0;
					var transitSum = 0;
					var transitSumNoRemote = 0;

					for (var i in totalTravels[key]["DRIVING"]) {
						count++;
						if (totalTravels[key]["DRIVING"][i].status == "ZERO_RESULTS") {
							drivingNoResultCount++;
							continue;
						}
						if (!totalTravels[key]["DRIVING"][i].isRemote) {
							countNoRemote++;
							drivingSumNoRemote += totalTravels[key]["DRIVING"][i].duration.value;
						}
						drivingSum += totalTravels[key]["DRIVING"][i].duration.value;
					}
					for (var i in totalTravels[key]["BICYCLING"]) {
						if (totalTravels[key]["BICYCLING"][i].status == "ZERO_RESULTS") {
							bicyclingNoResultCount++;
							continue;
						}
						if (!totalTravels[key]["BICYCLING"][i].isRemote) {
							bicyclingSumNoRemote += totalTravels[key]["BICYCLING"][i].duration.value;
						}
						bicyclingSum += totalTravels[key]["BICYCLING"][i].duration.value;
					}
					for (var i in totalTravels[key]["TRANSIT"]) {
						if (totalTravels[key]["TRANSIT"][i].status == "ZERO_RESULTS") {
							transitNoResultCount++;
							continue;
						}
						if (!totalTravels[key]["TRANSIT"][i].isRemote) {
							transitSumNoRemote += totalTravels[key]["TRANSIT"][i].duration.value;
						}
						transitSum += totalTravels[key]["TRANSIT"][i].duration.value;
					}

					var drivingAvgValue = Math.round(((drivingSum / (count - drivingNoResultCount)) + 0.00001) * 100) / 100;
					var drivingAvgTime = Math.round(((drivingAvgValue / 60) + 0.00001) * 100) / 100; //Minutes
					var bicyclingAvgValue = Math.round(((bicyclingSum / (count - bicyclingNoResultCount)) + 0.00001) * 100) / 100;
					var bicyclingAvgTime = Math.round(((bicyclingAvgValue / 60) + 0.00001) * 100) / 100; //Minutes
					var transitAvgValue = Math.round(((transitSum / (count - transitNoResultCount)) + 0.00001) * 100) / 100;
					var transitAvgTime = Math.round(((transitAvgValue / 60) + 0.00001) * 100) / 100; //Minutes

					var drivingAvgValueNoRemote = Math.round(((drivingSumNoRemote / (countNoRemote - drivingNoResultCount)) + 0.00001) * 100) / 100;
					var drivingAvgTimeNoRemote = Math.round(((drivingAvgValueNoRemote / 60) + 0.00001) * 100) / 100; //Minutes
					var bicyclingAvgValueNoRemote = Math.round(((bicyclingSumNoRemote / (countNoRemote - bicyclingNoResultCount)) + 0.00001) * 100) / 100;
					var bicyclingAvgTimeNoRemote = Math.round(((bicyclingAvgValueNoRemote / 60) + 0.00001) * 100) / 100; //Minutes
					var transitAvgValueNoRemote = Math.round(((transitSumNoRemote / (countNoRemote - transitNoResultCount)) + 0.00001) * 100) / 100;
					var transitAvgTimeNoRemote = Math.round(((transitAvgValueNoRemote / 60) + 0.00001) * 100) / 100; //Minutes

					averages[key] = {
						"workAddress": $scope.workAddresses[key].address,
						"WithRemote": {
							"DRIVING": {
								"value": drivingAvgValue,
								"time": drivingAvgTime,
								"timeString": getTimeString(drivingAvgValue)
							},
							"BICYCLING": {
								"value": bicyclingAvgValue,
								"time": bicyclingAvgTime,
								"timeString": getTimeString(bicyclingAvgValue)
							},
							"TRANSIT": {
								"value": transitAvgValue,
								"time": transitAvgTime,
								"timeString": getTimeString(transitAvgValue)
							}
						},
						"NonRemote": {
							"DRIVING": {
								"value": drivingAvgValueNoRemote,
								"time": drivingAvgTimeNoRemote,
								"timeString": getTimeString(drivingAvgValueNoRemote)
							},
							"BICYCLING": {
								"value": bicyclingAvgValueNoRemote,
								"time": bicyclingAvgTimeNoRemote,
								"timeString": getTimeString(bicyclingAvgValueNoRemote)
							},
							"TRANSIT": {
								"value": transitAvgValueNoRemote,
								"time": transitAvgTimeNoRemote,
								"timeString": getTimeString(transitAvgValueNoRemote)
							}
						}
					};
				}
			}

			//This function is used to take the time value that is given and turn it into a time string
			function getTimeString(seconds) {
				// calculate (and subtract) whole days
				var days = Math.floor(seconds / 86400);
				seconds -= days * 86400;

				// calculate (and subtract) whole hours
				var hours = Math.floor(seconds / 3600) % 24;
				seconds -= hours * 3600;

				// calculate (and subtract) whole minutes
				var minutes = Math.floor(seconds / 60) % 60;
				seconds -= minutes * 60;

				// what's left is seconds
				var secs = Math.floor(seconds % 60);

				var timeString = "";
				var hasDays = false;
				var hasHours = false;

				if (days > 0) {
					timeString += days + " days, ";
					hasDays = true;
				}
				if (hours > 0 || hasDays) {
					timeString += hours + " hours, ";
					hasHours = true;
				}
				if (minutes > 0 || hasHours) {
					timeString += minutes + " minutes, ";
				}

				timeString += secs + " seconds";
				return timeString;
			}

			CommuteServices.populateTravelTimes(totalTravels);
			CommuteServices.populateAverages(averages);

			goNext();
		}

		//Separate function for going to the visualizations because there are two separate asynchronous processes on this page.
		function goNext () {
			if (!firstPathComplete) {
				firstPathComplete = true;
				return;
			}

			var end = new Date().getTime();
			var time = end - timer;

			hideLoading();
			$location.path('/vis');
			$scope.$apply();
		}

	}]);




























