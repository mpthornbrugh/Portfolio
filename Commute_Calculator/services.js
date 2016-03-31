'use strict';

angular.module('commuteCalculator.service', ['ngRoute'])
	.service('CommuteServices', ['$q', '$http', function ($q, $http) {
		var employeeLocations = [];
		var geocodedEmployeeLocations = [];
		var workLocations = [];
		var travelTimes = [];
		var averages = [];
		var numEmployees = 0;

		var populateEmployeeLocations = function (locs) {
			employeeLocations = locs;
		};

		var getEmployeeLocations = function () {
			return employeeLocations;
		};

		var populateWorkLocations = function (locs) {
			workLocations = locs;
		};

		var getWorkLocations = function () {
			return workLocations;
		};

		var populateTravelTimes = function (times) {
			travelTimes = times;
		};

		var getTravelTimes = function () {
			return travelTimes;
		};

		var populateAverages = function (avgs) {
			averages = avgs;
		};

		var getAverages = function () {
			return averages;
		};

		var populateNumEmployees = function (num) {
			numEmployees = num;
		};

		var getNumEmployees = function () {
			return numEmployees;
		};

		var populateGeocodedAddresses = function (geocoded) {
			geocodedEmployeeLocations = geocoded;
		};

		var getGeocodedAddresses = function () {
			return geocodedEmployeeLocations;
		};

		return {
			populateEmployeeLocations:    populateEmployeeLocations,
			getEmployeeLocations:         getEmployeeLocations,
			populateWorkLocations:        populateWorkLocations,
			getWorkLocations:             getWorkLocations,
			populateTravelTimes:          populateTravelTimes,
			getTravelTimes:               getTravelTimes,
			populateAverages:             populateAverages,
			getAverages:                  getAverages,
			populateNumEmployees:         populateNumEmployees,
			getNumEmployees:              getNumEmployees,
			populateGeocodedAddresses:    populateGeocodedAddresses,
			getGeocodedAddresses:         getGeocodedAddresses
		};
	}]);