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
				"class":"tile1",
				"redirect": ""
			},
			{
				"description":"Welcome Message",
				"class":"tile4",
				"redirect": ""
			},
			{
				"description":"About Me",
				"class":"tile2",
				"redirect": "/about"
			},
			{
				"description":"Social",
				"class":"tile3",
				"redirect": "/social" //May want to adjust this to just have the social buttons on the tile
			},
			{
				"description":"Projects",
				"class":"tile5",
				"redirect": "/projects"
			},
			{
				"description":"Contact Me",
				"class":"tile6",
				"redirect": "/contact"
			},
			{
				"description":"Picture",
				"class":"tile7",
				"redirect": ""
			},
			{
				"description":"Resume",
				"class":"tile8",
				"redirect": "/resume"
			}
		];

		$scope.itemClick = function (tile) {
			if (tile.class == "tile4") {
				tile.class = "tile9";
			}
			else if (tile.class == "tile9") {
				tile.class = "tile4";
			}
		};

		var calculatedWidth = ($(window).width() - 58)/2;
		var calculatedHeight = MIN_HEIGHT_OF_TILES;

		$("<style>.tile { width: " + calculatedWidth + "px; height: " + calculatedHeight + "px; float: left; }</style>").appendTo('body');

		var wrapper = $("#wrapper");
		wrapper.height(($scope.tiles.length/2) * calculatedHeight);

		window.onresize = function () {
			wrapper.height(($scope.tiles.length/2) * calculatedHeight);
		};

	}]);


























