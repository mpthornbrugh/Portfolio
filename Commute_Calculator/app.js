'use strict';

angular.module('commuteCalculator', [
	'ngRoute',
	'commuteCalculator.service',
	'commuteCalculator.main',
	'commuteCalculator.vis'
])
	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.otherwise({redirectTo: '/main'});
	}]);
