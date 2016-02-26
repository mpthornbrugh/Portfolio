'use strict';

angular.module('portfolio.social', ['ngRoute', 'ngAnimate'])

	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/social', {
			templateUrl: 'social/view.html',
			controller: 'SocialCtrl'
		});
	}])

	.controller('SocialCtrl', ['$scope', '$location', function ($scope, $location) {
		$scope.pageClass = 'page-home';


	}]);


























