/* globals angular */

//angular.module('peddler', []).controller('peddlerController',function($scope,$http,$window,$timeout,$compile){
angular.module('peddler', []).controller('peddlerController',function($scope,$interval) {
	//all these variables get saved
	$scope.obj = {
		'distancem':0, //distance covered, metres
		'distancekm':0, 
		'distancemi':0,
		'seconds':0,
		'totaltime':0, //human readable form of time taken
		'speedm':0,
		'speedkmph':0,
		'speedmph':0,
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
	$scope.weight = 0;
	$scope.oneday = 86400; //number of seconds in one day
	$scope.onehour = 3600; //number of seconds in an hour


	//on load, check localstorage for previous save
	$scope.init = function(){
		//$scope.obj.speedm = 5.36448; //12mph is 5.36448 metres per second, 30kmph is 8.3333 metres per second, 20mph is about 9 metres per second
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
		$scope.recalcStuff();
	};

	//general single function to call if we change gear, weather, etc.
	$scope.recalcStuff = function(){
		$scope.calcWeight();
		$scope.calcSpeed();
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
	
	//look in the gear to see if a particular piece of gear equipped
	$scope.checkGearPresent = function(id){
		for(var i = 0; i < $scope.obj.gear.length; i++){
			if($scope.obj.gear[i].id === id){
				return true;
			}
		}
		return false;
	};
	//given a gear id, add or remove it from the equipped gear
	$scope.addGear = function(id){
		var found = 0;
		var foundlocation = 0;
		for(var i = 0; i < $scope.obj.gear.length; i++){
			if($scope.obj.gear[i].id === id){
				found = 1;
				foundlocation = i;
				break;
			}
		}
		//gear exists, unequip
		if(found){
			$scope.obj.gear.splice(foundlocation,1);
		}
		//gear is not equipped, equip
		else {
			$scope.obj.gear.push({'id':id,'condition':1});
		}
		$scope.recalcStuff();
	};

	//main loop, increases time
	$scope.loop = function(){
		//autosave

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

		//increment distance, based on speed
		$scope.obj.distancem = $scope.obj.distancem + ($scope.obj.speedm * $scope.obj.timespeed);
		$scope.obj.distancekm = Math.floor(($scope.obj.distancem / 1000) * 10) / 10; //to one decimal place
		$scope.obj.distancemi = Math.floor(($scope.obj.distancekm / 1.6) * 10) / 10;

		//check for status
		/*
			reduce energy level, altered by medical condition, overall weight
			reduce food level
			reduce bike status/health
			improve some health conditions
			reduce some health conditions
			store a day in seconds then use to create countdown variables, when zero do something 
				e.g. $scope.day = 86400, $scope.wear.bike = $scope.day * 3, loop through each, reduce by 1, if zero do something
		*/

		//check for random events
		/*
			don't do this every second
			check for:
				standard events e.g. puncture, accident
				country specific events e.g. altitude sickness, bandits
				navigation choice events
			only do one event at a time
			should all events pause time?

			after event choice, need to recalculate
				gear weight
				bike weight
				bike condition
				energy level
				health/injury level
		*/
	};

	//controls time speed
	$scope.setTimeSpeed = function(speed){
		$scope.obj.timespeed = speed;
	};
	
	//work out the speed that you should be currently travelling at
	$scope.calcWeight = function(){
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
		//console.log('Total weight = ',totalweight);
		$scope.weight = totalweight;
	};
	
	//should return metres to travel per second
	$scope.calcSpeed = function(){
		//add temperature as contributing factor
		//add clothing as gear - heavier clothing warmer, but more drag

		//calculate speed
		/*
			assume base speed, e.g. 20mph / 32kmph (10 miles approx 16km)

			based on:
				gear weight
				bike weight
				bike condition
				energy level
				health/injury level
				tyre pressure
				wind strength/direction and drag
			should be able to come up with a distance per second amount, weighted by these factors, that we then add to total distance
		*/
		$scope.obj.speedkmph = Math.round(($scope.obj.speedm / 1000) * 3600);
		$scope.obj.speedmph = Math.round($scope.obj.speedkmph / 1.60934);
	};
	
	$scope.changeSpeed = function(changeby){
		$scope.obj.speedm += changeby;
		$scope.calcSpeed();
	};
});
