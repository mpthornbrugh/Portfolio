'use strict';

angular.module('portfolio.social', ['ngRoute'])

	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/social', {
			templateUrl: 'social/view.html',
			controller: 'SocialCtrl'
		});
	}])

	.controller('SocialCtrl', ['$scope', '$location', function ($scope, $location) {



	}]);


























