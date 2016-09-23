/* globals angular */

//angular.module('peddler', []).controller('peddlerController',function($scope,$http,$window,$timeout,$compile){
angular.module('peddler', []).controller('peddlerController',function($scope,$interval) {
	//all these variables get saved
	$scope.obj = {
		'clicks':0, //how many times clicked FIXME not in use
		'pedals':0, //based on times clicked and extras FIXME not in use
		'distance':0, //total distance covered, based on pedals
		'seconds':0,
		'totaltime':0,
		'timespeed':1,
		'pause':0,
		'bike': {
			'weight':1,
		},
		'gear': [
			{
				'id':1,
				'condition':1
			},
			{
				'id':2,
				'condition':1
			}
		],
	};
	//variables that don't need to be saved
	$scope.gear = [
		{
			'id':1,
			'name':'Sunglasses',
			'weight':1,
		},
		{
			'id':2,
			'name':'Puncture resistant tyres',
			'weight':3,
		},
		{
			'id':3,
			'name':'Regular tyres',
			'weight':2,
		}
	];

	//on load, check localstorage for previous save
	$scope.init = function(){
		var saved = localStorage.getItem('peddler');
		console.log(saved);
		if(saved !== null && saved.length > 0){ //firefox and chrome seem to handle this differently
			console.log('loading');
			saved = JSON.parse(saved);
			$scope.obj = saved;
		}
		if(!$scope.obj.pause){
			$scope.start();
		}
		$scope.calculateSpeed();
	};

	var promise;
	//start timing interval
	$scope.start = function(){
		$scope.stop();
		promise = $interval(function(){
			$scope.loop();
		},1000);
	};

	//stop timing interval
	$scope.stop = function(){
		$interval.cancel(promise);
	};

	//function called on pause button
	$scope.pause = function(){
		if($scope.obj.pause){
			$scope.start();
			$scope.obj.pause = 0;
		}
		else {
			$scope.stop();
			$scope.obj.pause = 1;
		}
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

	//main loop, increases time
	$scope.loop = function(){
		//calculate time so far
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
		//calculate distance
	};

	//controls time speed
	$scope.setTimeSpeed = function(speed){
		$scope.obj.timespeed = speed;
	};
	
	//work out the speed that you should be currently travelling at
	$scope.calculateSpeed = function(){
		var totalweight = 0;
		for(var i = 0; i < $scope.obj.gear.length; i++){
			var curritem = $scope.obj.gear[i];
			for(var j = 0; j < $scope.gear.length; j++){
				if(curritem.id === $scope.gear[j].id){
					totalweight += $scope.gear[j].weight;
					break;
				}
			}
		}
		console.log('Total weight = ',totalweight);
	};
});
