'use strict';

angular.module('portfolio.resume', ['ngRoute'])

	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/resume', {
			templateUrl: 'resume/view.html',
			controller: 'ResumeCtrl'
		});
	}])

	.controller('ResumeCtrl', ['$scope', '$location', function ($scope, $location) {



	}]);


























