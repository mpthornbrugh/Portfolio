'use strict';

angular.module('portfolio.projects', ['ngRoute'])

	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/projects', {
			templateUrl: 'projects/view.html',
			controller: 'ProjectsCtrl'
		});
	}])

	.controller('ProjectsCtrl', ['$scope', '$location', function ($scope, $location) {



	}]);


























