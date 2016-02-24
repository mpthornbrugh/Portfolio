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
				"color":"#354458"
			},
			{
				"description":"About Me",
				"color":"#3A9AD9"
			},
			{
				"description":"Social",
				"color":"#29ABA4"
			},
			{
				"description":"Welcome Message",
				"color":"#ADC4CC"
			},
			{
				"description":"Projects",
				"color":"#EB7260"
			},
			{
				"description":"Contact Me",
				"color":"#A3D39C"
			},
			{
				"description":"Picture",
				"color":"#354458"
			},
			{
				"description":"Resume",
				"color":"#3A9AD9"
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


























