'use strict';

angular.module('services', ['ngRoute'])
	.service('Services', ['$q', '$http', function ($q, $http) {

		var hasBeenToProjects = false;

		var visitProjects = function() {
			hasBeenToProjects = true;
		};

		var checkBeenToProjects = function() {
			return hasBeenToProjects;
		};

		return {
			visitProjects:        visitProjects,
			checkBeenToProjects:  checkBeenToProjects
		};
	}]);