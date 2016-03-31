'use strict';

angular.module('commuteCalculator.vis', ['ngRoute'])

	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/vis', {
			templateUrl: 'visualization/view.html',
			controller: 'VisCtrl'
		});
	}])

	.controller('VisCtrl', ['$scope', 'CommuteServices', '$location', function ($scope, CommuteServices, $location) {
		//################################################################################
		//################################################################################
		//                  Initializations
		//################################################################################
		//################################################################################

		//Employee table initialization
		$scope.employees = [];

		//Radio buttons for the different modes of transportation
		var drivingRadio = $("#drivingRadio");
		var bicyclingRadio = $("#bicyclingRadio");
		var transitRadio = $("#transitRadio");

		//Radio buttons for the different views
		var radialView = $("#radialView");
		var textView = $("#textView");
		var tableView = $("#tableView");
		var mapView = $("#mapView");

		//Initializations for the radial circles
		var divs = [];
		var vizs = [];
		var themes = [];

		var geocodeDelay = 200;
		var codingIndex;
		var codedWorkArr = [];

		var avgLat, avgLng, centralLoc;

		var map;

		$scope.averages = CommuteServices.getAverages();
		$scope.workAddressNum = $scope.averages.length;

		//################################################################################
		//################################################################################
		//                  Initializations
		//################################################################################
		//################################################################################

		$scope.range = function(min, max, step) {
			step = step || 1;
			var input = [];
			for (var i = min; i <= max; i += step) {
				input.push(i);
			}
			return input;
		};

		//Check for if there is data. If not go back to the main form.
		if ($scope.averages.length < 1) {
			$location.path("/main");
		}

		$scope.employeeFilter = function (employee) {
			if (!$scope.remoteCheck) {
				return true;
			}
			else if (employee.isRemote) {
				return false;
			}
			return true;
		};

		//Function for the Back button to return to the main page.
		$scope.goBack = function () {
			$location.path('/main');
		};

		//When the page is ready + 100ms (because of timing issues) initialize the radial circles
		$(document).ready(function () {
			generateEmployeesArray();
			setTimeout(function () {
				initializeRadial();
			}, 100);
		});

		//Create the radial circles
		function initializeRadial() {
			divs = [];
			vizs = [];
			themes = [];

			for (var i in $scope.averages) {
				if ($scope.averages.hasOwnProperty(i)) {
					divs.push(d3.select("#div1Average" + i));
					divs.push(d3.select("#div2Average" + i));
					divs.push(d3.select("#div3Average" + i));
					divs.push(d3.select("#div4Average" + i));
					divs.push(d3.select("#div5Average" + i));
					divs.push(d3.select("#div6Average" + i));
				}
			}

			for (var i in $scope.averages) {
				if ($scope.averages.hasOwnProperty(i)) {
					vizs.push(vizuly.component.radial_progress(document.getElementById("div1Average" + i)));
					vizs.push(vizuly.component.radial_progress(document.getElementById("div2Average" + i)));
					vizs.push(vizuly.component.radial_progress(document.getElementById("div3Average" + i)));
					vizs.push(vizuly.component.radial_progress(document.getElementById("div4Average" + i)));
					vizs.push(vizuly.component.radial_progress(document.getElementById("div5Average" + i)));
					vizs.push(vizuly.component.radial_progress(document.getElementById("div6Average" + i)));
				}
			}

			for (var i in $scope.averages) {
				if ($scope.averages.hasOwnProperty(i)) {
					themes.push(vizuly.theme.radial_progress(vizs[i*6]).skin(vizuly.skin.RADIAL_PROGRESS_BUSINESS));
					themes.push(vizuly.theme.radial_progress(vizs[1 + (i*6)]).skin(vizuly.skin.RADIAL_PROGRESS_BUSINESS));
					themes.push(vizuly.theme.radial_progress(vizs[2 + (i*6)]).skin(vizuly.skin.RADIAL_PROGRESS_BUSINESS));
					themes.push(vizuly.theme.radial_progress(vizs[3 + (i*6)]).skin(vizuly.skin.RADIAL_PROGRESS_BUSINESS));
					themes.push(vizuly.theme.radial_progress(vizs[4 + (i*6)]).skin(vizuly.skin.RADIAL_PROGRESS_BUSINESS));
					themes.push(vizuly.theme.radial_progress(vizs[5 + (i*6)]).skin(vizuly.skin.RADIAL_PROGRESS_BUSINESS));
				}
			}

			vizs.forEach(function (viz, i) {
				var x = $scope.averages;
				var val;
				var avgNum = Math.floor(i/6);
				switch (i % 6) {
					case 0:
						val = $scope.averages[avgNum].NonRemote.DRIVING.time;
						break;
					case 1:
						val = $scope.averages[avgNum].NonRemote.BICYCLING.time;
						break;
					case 2:
						val = $scope.averages[avgNum].NonRemote.TRANSIT.time;
						break;
					case 3:
						val = $scope.averages[avgNum].WithRemote.DRIVING.time;
						break;
					case 4:
						val = $scope.averages[avgNum].WithRemote.BICYCLING.time;
						break;
					case 5:
						val = $scope.averages[avgNum].WithRemote.TRANSIT.time;
						break;
				}
				viz.data(val)                    //Current Value
					.height(600)                  //Height of component
					.min(0)                       //Min Value
					.max(60)                      //Max Value (60 min)
					.capRadius(1)                 //Sets the curvature of the ends of the arc
					.on("tween", onTween)         //On the arc animation we create a callback to update the label
					.on("mouseover", onMouseOver) //Mouseover callback
					.on("mouseout", onMouseOut)   //Mouseout callback
					.on("click",onClick);         //MouseClick callback
			});

			for (var i in vizs) {
				vizs[i]
					.startAngle(180)
					.endAngle(180)
					.arcThickness(.05)
					.label(function (d,i) { return d3.format(".2f")(d) + "min"});
			}

			changeRadialSize();

		}

		//This function tells the radial size how big they need to be to show up.
		function changeRadialSize() {
			divs.forEach(function (div, i) {
				var divWidth = 300;
				div.style("width", "50%");
				vizs[i].width(divWidth).height(divWidth).radius(divWidth/2.2).update();
			});
		}

		//This function is used to determine if we need to make the background bigger or smaller
		function changeBackgroundSize () {
			var grad = $("#grad");
			switch ($scope.view) {
				case 'radial':
					grad.css("height", (70 + $scope.averages.length * 600) + 'px');
					break;
				case 'text':
					grad.css("height", (120 * $scope.averages.length) + 'px');
					break;
				case 'table':
					grad.css("height", (50 + $scope.employees.length * 30) + 'px');
					break;
				case 'map':
					grad.css("height", ($(window).height() - 70) + 'px');
					break;
			}
			if (grad.height() < ($(window).height() - 70)) {
				grad.css("height", ($(window).height() - 70) + 'px');
			}
		}

		//Function used to change between the different views
		$scope.changeView = function (view) {
			textView.css("background", "white");
			radialView.css("background", "white");
			tableView.css("background", "white");
			mapView.css("background", "white");
			switch (view) {
				case "radial":
					$scope.view = 'radial';
					radialView.css("background", "lightgray");
					break;
				case "text":
					$scope.view = 'text';
					textView.css("background", "lightgray");
					break;
				case "table":
					$scope.view = 'table';
					tableView.css("background", "lightgray");
					break;
				case "map":
					$scope.view = 'map';
					mapView.css("background", "lightgray");
					break;
			}
			changeRadialSize();
			changeBackgroundSize();
			updateGoogleMap();
		};

		//Used to make sure the center of the map is the center of all the points (Currently doesn't seem to do it's job)
		function updateGoogleMap() {
			setTimeout(function () {
				map.setCenter(centralLoc);
			}, 100);
		}

		//Function used to change between the different driving modes
		$scope.changeSelectedType = function (type) {
			switch (type) {
				case "d":
					$scope.selectedType = "Driving";
					drivingRadio.css("background", "lightgray");
					bicyclingRadio.css("background", "white");
					transitRadio.css("background", "white");
					break;
				case "b":
					$scope.selectedType = "Bicycling";
					drivingRadio.css("background", "white");
					bicyclingRadio.css("background", "lightgray");
					transitRadio.css("background", "white");
					break;
				case "t":
					$scope.selectedType = "Transit";
					drivingRadio.css("background", "white");
					bicyclingRadio.css("background", "white");
					transitRadio.css("background", "lightgray");
					break;
				default :
					$scope.selectedType = "Driving";
					drivingRadio.css("background", "lightgray");
					bicyclingRadio.css("background", "white");
					transitRadio.css("background", "white");
					break;
			}
			//Call functions to run animations
			changeRadialSize();
			changeBackgroundSize();
		};

		//######################Callback functions for the radial circles#############
		//Here we want to animate the label value by capturin the tween event
		//that occurs when the component animates the value arcs.
		function onTween(viz,i) {
			viz.selection().selectAll(".vz-radial_progress-label")
				.text(viz.label()(viz.data() * i));
		}
		function onMouseOver(viz,d,i) {
			//We can capture mouse over events and respond to them
		}
		function onMouseOut(viz,d,i) {
			//We can capture mouse out events and respond to them
		}
		function onClick(viz,d,i) {
			//We can capture click events and respond to them
		}

		//This function creates the array of all employees. This is the data object that is displayed in the 'Table' view
		function generateEmployeesArray() {
			$scope.emplyees = [];
			var travelTimes = CommuteServices.getTravelTimes();
			var employeeNum = CommuteServices.getNumEmployees();
			if (travelTimes.length < 1) {
				return;
			}

			for (var j in travelTimes) {
				for(var i = 0; i < employeeNum; i++) {
					if (!$scope.employees[i]) {
						$scope.employees[i] = {
							"name":travelTimes[j].DRIVING[i].name,
							"isRemote":travelTimes[j].DRIVING[i].isRemote,
							"times":[]
						};
					}
					$scope.employees[i].times.push({
						"DRIVING":{
							"value":travelTimes[j].DRIVING[i].duration.value,
							"time":travelTimes[j].DRIVING[i].duration.text
						},
						"BICYCLING":{
							"value":travelTimes[j].BICYCLING[i].duration.value,
							"time":travelTimes[j].BICYCLING[i].duration.text
						},
						"TRANSIT":{
							"value":travelTimes[j].TRANSIT[i].duration.value,
							"time":travelTimes[j].TRANSIT[i].duration.text
						}
					});
				}
			}

			var numNonRemote = 0;
			for (var i in $scope.employees) {
				if (!$scope.employees[i].isRemote) {
					numNonRemote++;
				}
			}

			var bestDs = [];
			var bestBs = [];
			var bestTs = [];

			var maxArr = [];
			var minArr = [];

			var sumArr = []; //Used for averages at end

			for (var i in $scope.averages) {
				maxArr[i] = {
					"DRIVING":0,
					"BICYCLING":0,
					"TRANSIT":0
				};
				minArr[i] = {
					"DRIVING":1000000,
					"BICYCLING":1000000,
					"TRANSIT":1000000
				};
				sumArr[i] = {
					"DRIVING":0,
					"BICYCLING":0,
					"TRANSIT":0
				};
			}

			for (var i in $scope.employees) {
				var minNumD = 1000000000;
				var maxNumD = 0;
				var minIndexD;
				var maxIndexD;
				var minNumB = 1000000000;
				var maxNumB = 0;
				var minIndexB;
				var maxIndexB;
				var minNumT = 1000000000;
				var maxNumT = 0;
				var minIndexT;
				var maxIndexT;
				for (var j in $scope.employees[i].times) {
					//Add value to the sum
					if (!$scope.employees[i].isRemote) {
						sumArr[j].DRIVING += $scope.employees[i].times[j].DRIVING.value;
						sumArr[j].BICYCLING += $scope.employees[i].times[j].BICYCLING.value;
						sumArr[j].TRANSIT += $scope.employees[i].times[j].TRANSIT.value;
					}

					//Check absolute max/min values
					if (!$scope.employees[i].isRemote) {
						if ($scope.employees[i].times[j].DRIVING.value > maxArr[j].DRIVING) {
							maxArr[j].DRIVING = $scope.employees[i].times[j].DRIVING.value;
						}
						if ($scope.employees[i].times[j].BICYCLING.value > maxArr[j].BICYCLING) {
							maxArr[j].BICYCLING = $scope.employees[i].times[j].BICYCLING.value;
						}
						if ($scope.employees[i].times[j].TRANSIT.value > maxArr[j].TRANSIT) {
							maxArr[j].TRANSIT = $scope.employees[i].times[j].TRANSIT.value;
						}
						if ($scope.employees[i].times[j].DRIVING.value < minArr[j].DRIVING) {
							minArr[j].DRIVING = $scope.employees[i].times[j].DRIVING.value;
						}
						if ($scope.employees[i].times[j].BICYCLING.value < minArr[j].BICYCLING) {
							minArr[j].BICYCLING = $scope.employees[i].times[j].BICYCLING.value;
						}
						if ($scope.employees[i].times[j].TRANSIT.value < minArr[j].TRANSIT) {
							minArr[j].TRANSIT = $scope.employees[i].times[j].TRANSIT.value;
						}
					}

					//Find min of the Driving times
					if ($scope.employees[i].times[j].DRIVING.value < minNumD) {
						minNumD = $scope.employees[i].times[j].DRIVING.value;
						minIndexD = j;
					}
					//Find max of the Driving times
					if ($scope.employees[i].times[j].DRIVING.value > maxNumD) {
						maxNumD = $scope.employees[i].times[j].DRIVING.value;
						maxIndexD = j;
					}
					//Find min of the Bicycling times
					if ($scope.employees[i].times[j].BICYCLING.value < minNumB) {
						minNumB = $scope.employees[i].times[j].BICYCLING.value;
						minIndexB = j;
					}
					//Find max of the Bicycling times
					if ($scope.employees[i].times[j].BICYCLING.value > maxNumB) {
						maxNumB = $scope.employees[i].times[j].BICYCLING.value;
						maxIndexB = j;
					}
					//Find min of the Transit times
					if ($scope.employees[i].times[j].TRANSIT.value < minNumT) {
						minNumT = $scope.employees[i].times[j].TRANSIT.value;
						minIndexT = j;
					}
					//Find max of the Transit times
					if ($scope.employees[i].times[j].TRANSIT.value > maxNumT) {
						maxNumT = $scope.employees[i].times[j].TRANSIT.value;
						maxIndexT = j;
					}
				}

				var numBestDs = [];
				var numBestBs = [];
				var numBestTs = [];

				for (var j in $scope.employees[i].times) {
					var numBestD = 0;
					var numBestB = 0;
					var numBestT = 0;
					$scope.employees[i].times[j].DRIVING.worst = (j == maxIndexD);
					$scope.employees[i].times[j].DRIVING.best = (j == minIndexD);
					if ($scope.employees[i].times[j].DRIVING.worst && $scope.employees[i].times[j].DRIVING.best) {
						$scope.employees[i].times[j].DRIVING.worst = false;
						$scope.employees[i].times[j].DRIVING.best = false;
					}

					$scope.employees[i].times[j].BICYCLING.worst = (j == maxIndexB);
					$scope.employees[i].times[j].BICYCLING.best = (j == minIndexB);
					if ($scope.employees[i].times[j].BICYCLING.worst && $scope.employees[i].times[j].BICYCLING.best) {
						$scope.employees[i].times[j].BICYCLING.worst = false;
						$scope.employees[i].times[j].BICYCLING.best = false;
					}

					$scope.employees[i].times[j].TRANSIT.worst = (j == maxIndexT);
					$scope.employees[i].times[j].TRANSIT.best = (j == minIndexT);
					if ($scope.employees[i].times[j].TRANSIT.worst && $scope.employees[i].times[j].TRANSIT.best) {
						$scope.employees[i].times[j].TRANSIT.worst = false;
						$scope.employees[i].times[j].TRANSIT.best = false;
					}

					if ($scope.employees[i].times[j].DRIVING.best) {
						numBestD = 1;
					}
					if ($scope.employees[i].times[j].BICYCLING.best) {
						numBestB = 1;
					}
					if ($scope.employees[i].times[j].TRANSIT.best) {
						numBestT = 1;
					}
					numBestDs.push(numBestD);
					numBestBs.push(numBestB);
					numBestTs.push(numBestT);
				}
				bestDs.push(numBestDs);
				bestBs.push(numBestBs);
				bestTs.push(numBestTs);
			}

			var percentBestD, percentBestB, percentBestT;


			for (var j in $scope.averages) {
				var sumBestD = 0, sumBestB = 0, sumBestT = 0;
				for (var i in bestDs) {
					sumBestD += bestDs[i][j];
					sumBestB += bestBs[i][j];
					sumBestT += bestTs[i][j];
				}
				percentBestD = Math.round((sumBestD/$scope.employees.length) * 1000)/10;
				percentBestB = Math.round((sumBestB/$scope.employees.length) * 1000)/10;
				percentBestT = Math.round((sumBestT/$scope.employees.length) * 1000)/10;
				$scope.averages[j].bestPercents = {
					"DRIVING":percentBestD,
					"BICYCLING":percentBestB,
					"TRANSIT":percentBestT
				};

				$scope.averages[j].mins = {
					"DRIVING":getTimeString(minArr[j].DRIVING),
					"BICYCLING":getTimeString(minArr[j].BICYCLING),
					"TRANSIT":getTimeString(minArr[j].TRANSIT)
				};

				$scope.averages[j].maxs = {
					"DRIVING":getTimeString(maxArr[j].DRIVING),
					"BICYCLING":getTimeString(maxArr[j].BICYCLING),
					"TRANSIT":getTimeString(maxArr[j].TRANSIT)
				};

				$scope.averages[j].overallAverages = {
					"DRIVING":getTimeString(Math.round(sumArr[j].DRIVING/numNonRemote)),
					"BICYCLING":getTimeString(Math.round(sumArr[j].BICYCLING/numNonRemote)),
					"TRANSIT":getTimeString(Math.round(sumArr[j].TRANSIT/numNonRemote))
				};
			}

			var sectionWidth = ($(document).width() - 150 - 70 - 20)/travelTimes.length;
			var style = $('<style id="addedCSS" type="text/css">.addedAdjustedWidth {width:'+sectionWidth+'px;} .addedAdjustedWidthOver3 {width:'+((sectionWidth/3)-1)+'px;}</style>');
			$('html > head').append(style);
		}

		//Similar function to the one in the main controller. This one leaves out seconds for space reasons.
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

			var timeString = "";
			var hasDays = false;
			var hasHours = false;

			if (days > 0) {
				timeString += days + " days, ";
				hasDays = true;
			}
			if (hours > 0 || hasDays) {
				timeString += hours + " hrs, ";
				hasHours = true;
			}
			if (minutes > 0 || hasHours) {
				timeString += minutes + " min";
			}

			return timeString;
		}

		//This function is used for the work addresses. This geocodes them so that we can place their positions on the map.
		function geocodeAddresses() {
			var locations = CommuteServices.getGeocodedAddresses();
			var workAddresses = CommuteServices.getWorkLocations();
			calculateCenterLatLng(locations);
			codingIndex = 0;
			codeAddresses(workAddresses);
		}

		//This function is used along with the one above it.
		function codeAddresses(mappedArr) {
			if (codingIndex < mappedArr.length) {
				setTimeout(function () {
					codeAddress(mappedArr[codingIndex], mappedArr);
				}, geocodeDelay);
			}
			else {
				createMapMarkers();
			}
		}

		//This function geocodes a single address
		function codeAddress(addressObj, mappedArr) {
			var geocoder = new google.maps.Geocoder();

			var address = addressObj.address;
			geocoder.geocode( { 'address': address}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					addressObj.lat = results[0].geometry.location.lat();
					addressObj.lng = results[0].geometry.location.lng();
					codedWorkArr.push(addressObj);
					codingIndex++;
					codeAddresses(mappedArr);
				} else {
					if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
						geocodeDelay++;
						codeAddresses(mappedArr);
					}
					else {
						alert("Geocode was not successful for the following reason: " + status);
					}
				}
			});
		}

		//This function calls all other map marker functions so that they are displayed on the map.
		function createMapMarkers() {
			var locations = CommuteServices.getGeocodedAddresses();
			//Create the destination markers for the work Locations
			createDestinationMarkers(codedWorkArr);
			//Create the "heat map" circle markers for the employee locations
			createEmployeeMarkers(locations);
		}

		//This function will (not yet) create a "heat map" of sorts with the locations of the employees. Currently just shows a faded marker.
		function createEmployeeMarkers(locations) {
			for (var i = 0; i < locations.length; i++) {
				var location = locations[i];

				var marker = new google.maps.Marker({
					position: {lat: location.lat, lng: location.lng},
					map: map,
					title: location.name
				}).setOpacity(.5);
			}
		}

		//This function marks the locations of all the work locations that have been selected.
		function createDestinationMarkers(destinations) {
			for (var i = 0; i < destinations.length; i++) {
				var destination = destinations[i];

				map.setCenter(centralLoc);

				var marker = new google.maps.Marker({
					position: {lat: destination.lat, lng: destination.lng},
					map: map,
					title: destination.address
				}).setOpacity(1.0);
			}
		}

		//This functino finds the center of all the employees so that hopefully they will be shown.
		function calculateCenterLatLng(codedArr) {
			var latSum = 0;
			var lngSum = 0;
			for (var i in codedArr) {
				latSum += codedArr[i].lat;
				lngSum += codedArr[i].lng;
			}
			avgLat = latSum/codedArr.length;
			avgLng = lngSum/codedArr.length;

			avgLat -= .45;

			centralLoc = new google.maps.LatLng(avgLat,avgLng);
			initMap();
		}

		//Creates the google map
		function initMap() {
			map = new google.maps.Map(document.getElementById('map'), {
				zoom: 10,
				center: centralLoc
			});
		}

		//Initialize the travel mode
		$scope.changeSelectedType('d');
		//Initialize the view
		$scope.changeView('table');
		//Start geocoding locations while on another page.
		geocodeAddresses();
	}]);



























