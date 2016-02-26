'use strict';

angular.module('portfolio.contact', ['ngRoute', 'ngAnimate'])

	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/contact', {
			templateUrl: 'contact/view.html',
			controller: 'ContactCtrl'
		});
	}])

	.controller('ContactCtrl', ['$scope', '$location', function ($scope, $location) {
		$scope.pageClass = 'page-home';


	}]);


























