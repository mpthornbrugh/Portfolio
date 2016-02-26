'use strict';

angular.module('portfolio.about', ['ngRoute', 'ngAnimate'])

	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/about', {
			templateUrl: 'about/view.html',
			controller: 'AboutCtrl'
		});
	}])

	.controller('AboutCtrl', ['$scope', '$location', function ($scope, $location) {
		$scope.pageClass = 'page-home';


	}]);


























