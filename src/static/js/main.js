/* globals angular, dests, google */

//angular.module('peddler', []).controller('peddlerController',function($scope,$http,$window,$timeout,$compile){
angular.module('peddler', []).controller('peddlerController',function($scope,$interval) {
	$scope.weight = 0;
	$scope.oneday = 86400; //number of seconds in one day
	$scope.onehour = 3600; //number of seconds in an hour

	$scope.mode = 1; //mode indicates whether we're running in realtime (1) or simulated (0, loading)
	$scope.timestep = 1; //defaults to 1 second, unless we're loading, in which case we negotiate time in larger chunks

    //map variables
    $scope.map = 0;
    $scope.markers = [];
    //$scope.infolinks = [];
    $scope.infowindow = new google.maps.InfoWindow();

	//all these variables get saved
	$scope.obj = {
		'actualdistkm':0, //actual distance peddled, no rounding
		'totaldistkm':0, //total distance including boats, planes etc.
		'distancekm':0, //display distance, rounded
		'distancemi':0,
		'currdest':1, //keeps track of which destination we're currently heading to
		'actualcurrdestdist':0, //actual distance to next location (not rounded, used for calculation)
		'currdestdist':-1, //display distance to next location (rounded, used for display)

		'starttime':'',
		'seconds':0,
		'totaltime':0, //human readable form of time taken
		'speedkmph':30,
		'speedmph':0,
		'timespeed':1,
		'timestamp':0,
		'pause':0,

		'awake':1, //trigger to tell if we're asleep or not
		'moving':1, //currently moving or not
		'tilstop':$scope.onehour * 2, //how long you can go without a rest fixme this could be varied
		'tilgo':$scope.onehour / 2, //how long before you can start going again fixme this could be varied
		'tilsleep':$scope.onehour * 16, //how long before you have to sleep
		'tilwake':$scope.onehour * 7, //how long before you wake up
		'tilevent':$scope.onehour * 100, //how long until the next event, will be randomised, fixme currently set to really high to not conflict

		'bike': {
			'weight':1,
			'parts':[
				{	'name':'Front tyre',
					'cond':1,
				},
				{	'name':'Rear tyre',
					'cond':1,
				}
			]
		},
		'gear': [
			{	'id':1,
				'condition':1
			},
			{	'id':2,
				'condition':1
			}
		],
		'messages': [],
		'options': {
			'fastjourneys':1, //make boat journeys happen instantly, just increment the time
		}
	};
	//variables that don't need to be saved
	$scope.gear = [
		{	'id':1,
			'name':'Sunglasses',
			'weight':1,
		},
		{	'id':2,
			'name':'Puncture resistant tyres',
			'weight':3,
		},
		{	'id':3,
			'name':'Regular tyres',
			'weight':2,
		}
	];

	//on load, check localstorage for previous save
	$scope.init = function(){
		//$scope.obj.speedm = 5.36448; //12mph is 5.36448 metres per second, 30kmph is 8.3333 metres per second, 20mph is about 9 metres per second
		var saved = localStorage.getItem('peddler');
		//if there's a save file, load it
		$scope.dests = dests; //need to do this prior to loading
		//if there's a saved file, load it
		if(saved !== null && saved.length > 0){ //firefox and chrome seem to handle this differently
			console.log('loading');
			saved = JSON.parse(saved);
			$scope.obj = saved;
			$scope.load();
		}
		//otherwise do some initial setup
		else {
			$scope.messages.create('You have begun your journey, ' + $scope.getTimeNow());
		}
		if(!$scope.obj.pause){
			$scope.start();
		}
		//set up destination stuff
		$scope.checkDests();
		$scope.recalcStuff();
        $scope.doMap();

        for(var m = 0; m < $scope.obj.messages.length; m++){
	        console.log($scope.obj.messages[m]);
		}

		//reset for realtime operation
		$scope.timestep = 1;
		$scope.mode = 1;
	};

	//get the actual date time right now
	$scope.getTimeNow = function(){
		var currentdate = new Date();
		return currentdate.getDate() + '/' + (currentdate.getMonth()+1)  + '/' + currentdate.getFullYear() + ' @ ' + currentdate.getHours() + ':' + currentdate.getMinutes() + ':' + currentdate.getSeconds();
	};

	//initialise destinations and change destinations
	$scope.checkDests = function(increment){
		//console.log('checkDests',$scope.obj.currdest,$scope.dests[$scope.obj.currdest]);
  		$scope.currdest = $scope.dests[$scope.obj.currdest].name;
  		//change destination
		if(increment){
            $scope.obj.currdest++;
            $scope.obj.actualcurrdestdist = $scope.dests[$scope.obj.currdest].dist;
            //console.log($scope.obj.currdest,$scope.currdest,$scope.dests[$scope.obj.currdest].loc);
            $scope.messages.create('You reached ' + $scope.currdest + ', ' + $scope.dests[$scope.obj.currdest - 1].loc + ' after ' + $scope.obj.totaltime);
            if($scope.dests[$scope.obj.currdest].hasOwnProperty('type')){
				//console.log('type:',$scope.dests[$scope.obj.currdest].type);
				//if type, draw polyline
				//if not, draw directions
			}
		}
  		$scope.prevdest = Math.max(0,$scope.obj.currdest - 1);
	    $scope.prevdest = $scope.dests[$scope.prevdest].name;
  		$scope.currcountry = $scope.dests[$scope.obj.currdest].loc;
  		if($scope.obj.currdestdist === -1){
            $scope.obj.actualcurrdestdist = $scope.dests[$scope.obj.currdest].dist;
        }
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
			$scope.newLoop();
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

	//clear localstorage
	$scope.deleteSave = function(){
		console.log('delete');
		localStorage.setItem('peddler', '');
	};

	//save all data to local storage
	$scope.save = function(){
		console.log('saving');
		$scope.obj.timestamp = Math.floor(Date.now() / 1000);
		//localStorage.setItem('peddler', JSON.stringify($scope.obj));
		localStorage.setItem('peddler', angular.toJson($scope.obj));
	};

	//called on init if save found
	$scope.load = function(){
        var now = Math.floor(Date.now() / 1000);
        var diff = now - $scope.obj.timestamp;
        $scope.loaddiff = diff;
        console.log(diff);
        //$scope.calculateJourney(diff);
        $scope.loadLoop();
	};

	//decide how long until next thing - sleep, rest, new destination, event
	//call newLoop with that time length and a call to the function to handle the upcoming thing
	//fixme we need to limit all of this within the size of the diff calculated above (when loading)
	$scope.loadLoop = function(){
		console.log('loadLoop');
		if($scope.loaddiff > 0){
			var comparing = [
				$scope.loaddiff,
				$scope.obj.tilsleep,
				$scope.obj.tilstop,
				$scope.obj.tilwake,
				//$scope.obj.tilevent
			];
			var ln = comparing.length;
			var smallest = 10000000000;
			var smallestindex = 0;
			for(var b = 0; b < ln; b++){
				if(comparing[b] < smallest){
					smallest = comparing[b];
					smallestindex = b;
				}
			}
			//smallestindex is now the index of the item in the array that is the smallest
			if($scope.obj.awake){
				if($scope.obj.moving){
					switch(smallestindex){
						case 0:
							$scope.timestep = $scope.loaddiff;
						case 1:
							$scope.timestep = $scope.tilsleep;
						case 2:
							$scope.timestep = $scope.tilstop;
					}
				}
				else {
				}
			}
			//argh FIXME FIXME FIXME

			if($scope.obj.awake){
				if($scope.obj.moving){
					//find which is smallest - time til next stop, next sleep, next event
					if($scope.obj.tilsleep < $scope.obj.tilstop && $scope.obj.tilsleep < $scope.obj.tilevent){ //tilsleep happens first
						$scope.timestep = $scope.obj.tilsleep;
					}
					else if($scope.obj.tilstop < $scope.obj.tilevent && $scope.obj.tilstop < $scope.obj.tilsleep){ //tilstop happens first
						$scope.timestep = $scope.obj.tilstop;
					}
					else { //tilevent happens first
						$scope.timestep = $scope.obj.tilevent;
					}
				}
				//no events occur while stopped
				else {
					$scope.timestep = $scope.obj.tilgo;
					//fixme now reset tilgo
				}
			}
			//if not awake, do nothing but sleep until awake
			else {
				$scope.timestep = $scope.obj.tilwake;
				//fixme now reset tilwake
			}
			console.log($scope.timestep);
			$scope.newLoop();
		}
    };
    
	//fixme need to include sleeping in here now
	//given a length of time, work out locations passed through in that time
	$scope.calculateJourney = function(time){
		//given time, translate time and current speed into distance covered in that time, km
		var dist = ($scope.obj.speedkmph / $scope.onehour) * time;
		console.log('You would have travelled ',dist,'km');
		var tmp = 0;
		//loop through destinations
		for(var x = $scope.obj.currdest; x < $scope.dests.length; x++){
			//fixme does this account for the fact that we're likely to be midway between destinations?
			if(dist > $scope.obj.actualcurrdestdist){
				//calculate how much time should be used up getting to this destination
				//subtract from diff (time) and add to $scope.obj.seconds
				tmp = ($scope.dests[x].dist / $scope.obj.speedkmph) * $scope.onehour;
				$scope.incrementTime(tmp);
				time -= tmp;
				$scope.calcTime();
				$scope.checkDests(1); //call function to check destinations and increment to next one
				dist -= $scope.dests[x].dist;
				$scope.obj.actualdistkm += $scope.dests[x].dist;
			}
			else {
				//add remaining time from diff (time) to $scope.obj.seconds
				$scope.obj.seconds += time;
				$scope.obj.actualcurrdestdist -= dist;
				$scope.obj.actualdistkm += dist;
				break;
			}
		}
	};

	//calculate time so far
	$scope.calcTime = function(){
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
	
	//generic function to increase the amount of time that has elapsed.
	//called both by the main loop (per second) and by the load functionality
	$scope.incrementTime = function(incrementby){
		$scope.obj.seconds += (incrementby * $scope.obj.timespeed);
	};
	
	$scope.newLoop = function(){
		console.log('newLoop',$scope.timestep);
		$scope.incrementTime($scope.timestep);
		$scope.calcTime();
		$scope.timings.checkRest();
		$scope.timings.checkSleep();
		
		if($scope.obj.awake && $scope.obj.moving){
			if($scope.obj.actualcurrdestdist === 0){
	            $scope.checkDests(1);
	            $scope.doMap();
	        }

			//increment distance, based on speed
			var newdist = ($scope.obj.speedkmph / 3600) * $scope.obj.timespeed; //distance in km we've travelled since last
			//console.log('newdist',newdist);
			$scope.obj.actualdistkm = $scope.obj.actualdistkm + newdist; //add to total travelled

			$scope.obj.distancemi = $scope.oneDecimal($scope.obj.actualdistkm / 1.6); //convert km travelled to miles travelled
			$scope.obj.distancekm = $scope.oneDecimal($scope.obj.actualdistkm);
			$scope.obj.actualcurrdestdist = Math.max(0,$scope.obj.actualcurrdestdist - newdist);
			$scope.obj.currdestdist = $scope.oneDecimal($scope.obj.actualcurrdestdist);
		}

		//fixme autosave

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

		//if we're not running in realtime, just call this function again
		//otherwise it's already handled by an interval
		if(!$scope.mode){
			$scope.loadLoop();
		}
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
		//$scope.obj.speedkmph = Math.round(($scope.obj.speedm / 1000) * 3600);
		$scope.obj.speedkmph = $scope.oneDecimal($scope.obj.speedkmph);
		$scope.obj.speedmph = $scope.oneDecimal(Math.round($scope.obj.speedkmph / 1.60934));
	};
	
	$scope.changeSpeed = function(changeby){
        //console.log($scope.obj.speedkmph,changeby);
		$scope.obj.speedkmph += changeby;
		$scope.calcSpeed();
	};
	
	$scope.messages = {
		create: function(m){
			$scope.obj.messages.push({'text':m,'show':1});
		},
		hide: function(i){
			console.log(i);
			$scope.obj.messages[i].show = 0;
		}
	};
	
	//functions relating to countdowns for sleep, event occurrence, etc.
	$scope.timings = {
		//check to see if we need to sleep or wake
		checkSleep: function(){
			if($scope.obj.awake){
				$scope.obj.tilsleep = Math.max(0,$scope.obj.tilsleep - ($scope.timestep * $scope.obj.timespeed));
				if($scope.obj.tilsleep === 0){
					//fixme add time here
					$scope.messages.create('You stopped to sleep,' + $scope.getTimeNow());
					$scope.obj.awake = 0;
					$scope.moving = 0;
				}
			}
			else {
				$scope.obj.tilwake = Math.max(0,$scope.obj.tilwake - ($scope.timestep * $scope.obj.timespeed));
				if($scope.obj.tilwake === 0){
					//fixme add time here
					$scope.messages.create('You woke up,' + $scope.getTimeNow());
					$scope.obj.awake = 1;
					$scope.obj.moving = 1;
					$scope.timings.resets.resetTilsleep();
					$scope.timings.resets.resetTilwake();
					$scope.timings.resets.resetTilstop();
				}
			}
		},
		//check to see if we need to stop for a rest or not
		checkRest: function(){
			if($scope.obj.awake){
				if($scope.obj.moving){
					$scope.obj.tilstop = Math.max(0,$scope.obj.tilstop - ($scope.timestep * $scope.obj.timespeed));
					//console.log($scope.obj.tilstop);
					if($scope.obj.tilstop === 0){
						$scope.messages.create('You stopped for a rest,' + $scope.getTimeNow());
						$scope.obj.moving = 0;
					}
				}
				else {
					$scope.obj.tilgo = Math.max(0,$scope.obj.tilgo - ($scope.timestep * $scope.obj.timespeed));
					if($scope.obj.tilgo === 0){
						$scope.messages.create('You set off again,' + $scope.getTimeNow());
						$scope.obj.moving = 1;
						$scope.timings.resets.resetTilstop();
						$scope.timings.resets.resetTilgo();
					}
				}
			}
		},
		//putting all the resets in one place so I don't have to hunt for them
		resets: {
			resetTilstop: function(){
				$scope.obj.tilstop = $scope.onehour * 2;
			},
			resetTilgo: function(){
				$scope.obj.tilgo = $scope.onehour / 2;
			},
			resetTilsleep: function(){
				$scope.obj.tilsleep = $scope.onehour * 16; //reset time til next sleep
			},
			resetTilwake: function(){
				$scope.obj.tilwake = $scope.onehour * 7; //reset length of sleep
			}
		}
	};
	
	//fixme might need to clear up previous markers/lines
	$scope.doMap = function(){
        //only create a map if it doesn't exist already
        if($scope.map === 0){
            $scope.map = new google.maps.Map(document.getElementById('map'), {
                zoom: 4,
                disableDefaultUI: true
            });
		}
		else {
			$scope.deleteMarkers();
		}
		var bounds = new google.maps.LatLngBounds(null);
		var points = [
			$scope.dests[$scope.obj.currdest].name + ', ' + $scope.dests[$scope.obj.currdest].loc,
			$scope.dests[$scope.obj.currdest - 1].name + ', ' + $scope.dests[$scope.obj.currdest - 1].loc,
		];
		//console.log(points);
		var latlngpoints = []; //store the results of the geocoder
		var lastloop = 0;
		var geocoder =  new google.maps.Geocoder();
		for(var i = 0; i < points.length; i++){
			geocoder.geocode( { 'address': points[i]}, function(results, status) { //fixme need to check geocoder is getting the destinations right, spoiler, it isn't, see turkey
				if(status === google.maps.GeocoderStatus.OK) {
					lastloop++;
					var latlong = {lat:results[0].geometry.location.lat(), lng:results[0].geometry.location.lng()};
					latlngpoints.push(latlong);
					//console.log(latlong);
					var marker = new google.maps.Marker({
						position: latlong,
						map: $scope.map,
						//icon: $scope.url_mediapath + markerimg,
						zoom:1
					});
					$scope.markers.push(marker);
					bounds.extend(marker.position);

					if(lastloop === points.length){
						lastloop = 0;
						//console.log('last',$scope.dests[$scope.obj.currdest].type);
						//draw route between the two points
						if($scope.dests[$scope.obj.currdest].hasOwnProperty('type')){ //if route type is a boat or plane, just draw a straight line
							var line = new google.maps.Polyline({
								path: [
									latlngpoints[0],
									latlngpoints[1]
								],
								strokeColor: '#FF0000',
								strokeOpacity: 0.6,
								strokeWeight: 5,
								map: $scope.map
							});
						}
						else { //plot an actual driving route
							var request = {
								origin: latlngpoints[0],
								destination: latlngpoints[1],
								travelMode: google.maps.TravelMode.DRIVING
							};
							var directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});
							directionsDisplay.setMap($scope.map);
							var directionsService = new google.maps.DirectionsService();
							directionsService.route(request, function (response, status) {
								if (status === google.maps.DirectionsStatus.OK) {
									directionsDisplay.setDirections(response);
									directionsDisplay.setMap($scope.map);
								} else {
									//alert("Directions Request from " + start.toUrlValue(6) + " to " + end.toUrlValue(6) + " failed: " + status);
								}
							});
						}

						//fitbounds doesn't work the second time, leaves the map too zoomed out
						//hacky but works: http://stackoverflow.com/questions/3873195/calling-map-fitbounds-multiple-times-in-google-maps-api-v3-0
						setTimeout(function() {$scope.map.fitBounds(bounds);},1);
					}
				}
				else {
					console.log('Something wrong with geocoder ' + status);
				}
			});
		}
    };
    
    //remove markers from map
    $scope.deleteMarkers = function() {
		console.log('Deleting markers',$scope.markers);
        if($scope.markers.length){
            for(var i = 0; i < $scope.markers.length; i++) {
                if($scope.markers[i]){
                    $scope.markers[i].setMap(null);
                }
            }
        }
        $scope.markers = [];
        $scope.map.setZoom(20);
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

	$scope.oneDecimal = function(num){
        return(Math.round(num * 10) / 10);
    };
});
