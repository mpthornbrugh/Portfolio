'use strict';

angular.module('portfolio.social', ['ngRoute', 'ngAnimate'])

	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/social', {
			templateUrl: 'social/view.html',
			controller: 'SocialCtrl'
		});
	}])

	.controller('SocialCtrl', ['$scope', '$location', function ($scope, $location) {
		$scope.pageClass = 'page-social';

		$scope.showMenu = false;

		$scope.items = [
			{
				"title":"LinkedIn",
				"image":"images/linkedin_icon.png",
				"link":"https://www.linkedin.com/in/michaelthornbrugh"
			},
			{
				"title":"Facebook",
				"image":"images/facebook_icon.png",
				"link":"https://www.facebook.com/michael.thornbrugh.3"
			},
			{
				"title":"Indeed",
				"image":"images/indeed_icon.png",
				"link":"https://my.indeed.com/r/Michael-Thornbrugh/edc158bdf37cf329"
			},
			{
				"title":"Github",
				"image":"images/github_icon.svg",
				"link":"https://github.com/mpthornbrugh"
			}
		];
	}]);


























