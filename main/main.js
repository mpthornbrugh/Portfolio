'use strict';

angular.module('portfolio.main', ['ngRoute'])

	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/main', {
			templateUrl: 'main/view.html',
			controller: 'MainCtrl'
		});
	}])

	.controller('MainCtrl', ['$scope', '$location', function ($scope, $location) {

	}]);


























