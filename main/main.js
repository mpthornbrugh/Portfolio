'use strict';

angular.module('portfolio.main', ['ngRoute'])

	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/main', {
			templateUrl: 'main/view.html',
			controller: 'MainCtrl'
		});
	}])

	.controller('MainCtrl', ['$scope', '$location', function ($scope, $location) {

		var MIN_WIDTH_OF_TILES = 300;
		var MIN_HEIGHT_OF_TILES = 200;

		$scope.tiles = [
			{
				"description":"Logo",
				"color":"red"
			},
			{
				"description":"About Me",
				"color":"blue"
			},
			{
				"description":"Social",
				"color":"green"
			},
			{
				"description":"Welcome Message",
				"color":"pink"
			},
			{
				"description":"Projects",
				"color":"blue"
			},
			{
				"description":"Contact Me",
				"color":"green"
			},
			{
				"description":"Picture",
				"color":"yellow"
			},
			{
				"description":"Resume",
				"color":"beige"
			}
		];

		var calculatedWidth = ($(window).width() - 58)/2;
		var calculatedHeight = MIN_HEIGHT_OF_TILES;

		$("<style>.tile { width: " + calculatedWidth + "px; height: " + calculatedHeight + "px; float: left; }</style>").appendTo('body');

		var wrapper = $("#wrapper");
		wrapper.height(($scope.tiles.length/2) * calculatedHeight);

		window.onresize = function () {
			wrapper.height(($scope.tiles.length/2) * calculatedHeight);
		};

	}]);


























