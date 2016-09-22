/* globals angular */

//angular.module('peddler', []).controller('peddlerController',function($scope,$http,$window,$timeout,$compile){
angular.module('peddler', []).controller('peddlerController',function($scope,$interval) {
	$scope.obj = {
		'clicks':0, //how many times clicked
		'pedals':0, //based on times clicked and extras
		'distance':0, //total distance covered, based on pedals
		'seconds':0, 
		'totaltime':0,
		'timespeed':1,
	};

	//on load, check localstorage for previous save
	$scope.init = function(){
		var saved = localStorage.getItem('peddler');
		console.log(saved);
		if(saved !== null && saved.length > 0){ //firefox and chrome seem to handle this differently
			console.log('loading');
			saved = JSON.parse(saved);
			$scope.obj = saved;
		}
		$interval(function(){
			$scope.loop();
		},1000);
	};

	//save all data to local storage
	$scope.save = function(){
		console.log('saving');
		localStorage.setItem('peddler', JSON.stringify($scope.obj));
	};

	//clear localstorage
	$scope.deleteSave = function(){
		console.log('delete');
		localStorage.setItem('peddler', '');
	};

	$scope.clicker = function(){
		$scope.obj.clicks++;
		console.log('click');
	};
	
	$scope.loop = function(){
		$scope.obj.seconds += (1 * $scope.obj.timespeed);
		var totaltime = $scope.obj.seconds;
		var days = Math.floor(totaltime / 86400);
		totaltime -= days * 86400;
		var hours = Math.floor(totaltime / 3600) % 24;
		totaltime -= hours * 3600;
		var minutes = Math.floor(totaltime / 60) % 60;
		totaltime -= minutes * 60;
		var seconds = totaltime % 60;
		$scope.obj.totaltime = days + ' days, ' + hours + ' hours, ' + minutes + ' minutes, ' + seconds + ' seconds';
	};

	$scope.setTimeSpeed = function(speed){
		$scope.obj.timespeed = speed;
	};
});
