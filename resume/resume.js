'use strict';

angular.module('portfolio.resume', ['ngRoute', 'ngAnimate'])

	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider.when('/resume', {
			templateUrl: 'resume/view.html',
			controller: 'ResumeCtrl'
		});
	}])

	.controller('ResumeCtrl', ['$scope', '$location', function ($scope, $location) {
		var isMobile = false; //initiate as false
		// device detection
		if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
			|| /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
			isMobile = true;
		}

		if (!isMobile) {
			$scope.pageClass = 'page-resume';
		}

		//TODO: Need to do some sort of check for the size of the screen when it's long and skinny the text goes outside of the divs.

		$scope.isMobile = isMobile;

		$scope.showMenu = false;

		$scope.showMap = false;

		$scope.openMap = function (item) {
			geocoder.geocode( { 'address': item.location}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					$scope.map = new google.maps.Map(document.getElementById('map'), {
						center: {lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng()},
						scrollwheel: false,
						zoom: 12
					});
					geoCoderPlacement(item.location, item.name);
				}
			});

			$scope.showMap = true;
		};

		$scope.hideMap = function () {
			$scope.showMap = false;
		};

		$scope.experience = [
			{
				"name": "MobileUp Software by Essenza Software",
				"website": "http://www.mobileupsoftware.com/",
				"job_title": "Mobile Application Developer",
				"from": "May 2015",
				"to": "November 2015",
				"location": "11100 Ash St #101, Leawood, KS 66211",
				"description": "Worked in a small group (~10 people) to create mobile applications for alumni associations and university involvement using AngularJS, HTML and CSS. The apps were created for both IOS and Android.",
				"skills_used": "JavaScript, SQL, HTML, CSS, AngularJS, JQuery, Git, WebStorm"
			},
			{
				"name": "AllofE Solutions",
				"website": "http://www.allofe.com/",
				"job_title": "Software Engineer",
				"from": "May 2014",
				"to": "December 2014",
				"location": "2510 W 6th St, Lawrence, KS 66049",
				"description": "Worked as a part of a ~20 person to create school logistics software for schools and university. The software was used by the staff of the schools to determine if there are certain areas of your school that are doing better and need praise or if some areas need some more work.",
				"skills_used": "JavaScript, SQL, HTML, CSS, ExtJS, Git"
			}
		];

		$scope.skills = [
			{
				"skill": "JavaScript",
				"length": "3 Years"
			},
			{
				"skill": "C++",
				"length": "4 Years"
			},
			{
				"skill": "SQL",
				"length": "3 Years"
			},
			{
				"skill": "Git",
				"length": "4 Years"
			},
			{
				"skill": "HTML5",
				"length": "5 Years"
			},
			{
				"skill": "CSS3",
				"length": "3 Years"
			},
			{
				"skill": "Java",
				"length": "2 Years"
			},
			{
				"skill": "Scheme",
				"length": "2 Years"
			},
			{
				"skill": "PHP",
				"length": "1 Year"
			},
			{
				"skill": "Python",
				"length": "2 Years"
			},
			{
				"skill": "WebStorm",
				"length": "2 Years"
			},
			{
				"skill": "AngularJS",
				"length": "2 Years"
			},
			{
				"skill": "ExtJS",
				"length": "1 Year"
			},
			{
				"skill": "Customer Service",
				"length": "6 Years"
			},
			{
				"skill": "Web APIs",
				"length": "2.5 Years"
			}
		];

		$scope.education = [
			{
				"school_name": "The University of Kansas",
				"from": "August 2012",
				"to": "May 2016",
				"degree_type": "Bacelor's Degree",
				"degree_name": "Computer Science",
				"description": "As a student at the University of Kansas I have learned the fundamentals of what it means to be a computer scientist. I have learned necessary skills that are needed for the industry once I graduate.",
				"classes":[
					{
						"class_num": "EECS 649",
						"class_name": "Introduction to Artificial Intelligence",
						"description": "Learned the basics of machine learning as well as how to create an \"intelligent\" program."
					},
					{
						"class_num": "EECS 767",
						"class_name": "Introduction to Information Retrieval",
						"description": "Learned how search engines in the world operate as well as how to create one myself."
					},
					{
						"class_num": "EECS 665",
						"class_name": "Compiler Construction",
						"description": "Learned the basics of a compiler and how to create one."
					},
					{
						"class_num": "EECS 662",
						"class_name": "Programming Languages",
						"description": "Learned how programming languages are created. Learned various low level aspects of programming languages."
					},
					{
						"class_num": "EECS 660",
						"class_name": "Fundamentals of Computer Algorithms",
						"description": "Learned how to calculate the time complexity of an algorithm as well as learning about higher level algorithms."
					},
					{
						"class_num": "EECS 565",
						"class_name": "Introduction to Information and Computer Security",
						"description": "Learned how information is kept safe from attacks as well as how to attain that security with our own programs."
					},
					{
						"class_num": "EECS 560",
						"class_name": "Data Structures",
						"description": "Learned about a barrage of different data structures that are used in programs."
					}
				]
			}
		];

		$scope.other = [
			{
				"thing": "Martial Arts Instructor",
				"from": "October 2000",
				"to": "May 2012",
				"description": "After attaining a black belt I began working with Omega Martial Arts to instruct classes. This taught me self-discipline, the ability to work through obstacles and the ability to instruct others while also learning myself."
			}
		];


		/* GOOGLE MAP API STUFF
		 * ====================================================================== */
		var geocoder = new google.maps.Geocoder();

		function geoCoderPlacement(place, description) {
			$scope.geoCoder = new google.maps.Geocoder();

			$scope.geoCoder.geocode({'address': place}, function (results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					$scope.map.setCenter(results[0].geometry.location);
					var infowindow = new google.maps.InfoWindow({
						content: description
					});
					$scope.marker = new google.maps.Marker({
						position: results[0].geometry.location,
						title: description
					});
					$scope.marker.addListener('click', function () {
						infowindow.open($scope.map, $scope.marker);
					});
					$scope.marker.setMap($scope.map);
				}
				else {
					alert("Geocode was not successful for the following reason: " + status);
				}
			});
		}
	}]);


























