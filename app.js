'use strict';

angular.module('portfolio', [
	'ngRoute',
	'portfolio.main'
])
	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.otherwise({redirectTo: '/main'});
	}]);
