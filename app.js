'use strict';

angular.module('portfolio', [
	'ngRoute',
	'portfolio.main',
	'portfolio.about',
	'portfolio.contact',
	'portfolio.projects',
	'portfolio.resume',
	'portfolio.social'
])
	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.otherwise({redirectTo: '/main'});
	}]);
