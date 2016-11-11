/* globals angular, dests, google */

//angular.module('peddler', []).controller('peddlerController',function($scope,$http,$window,$timeout,$compile){
angular.module('peddler', []).controller('peddlerController',function($scope,$interval) {

	//all these variables get saved
	$scope.obj = {
		'actualdistkm':0, //actual distance peddled, no rounding
		'totaldistkm':0, //total distance including boats, planes etc.
		'distancekm':0, //display distance, rounded
		'distancemi':0,
		'currdest':1, //keeps track of which destination we're currently heading to
		'actualcurrdestdist':0, //actual distance to next location (not rounded, used for calculation)
		'currdestdist':-1, //display distance to next location (rounded, used for display)

		'seconds':0,
		'totaltime':0, //human readable form of time taken
		'speedkmph':60,
		'speedmph':0,
		'timespeed':1,
		'timestamp':0,
		'pause':0,
		
		'awake':1, //trigger to tell if we're asleep or not
		'stopped':0, //
		'tilstop':$scope.onehour * 4, //how long you can go without a rest fixme this could be varied
		'tilgo':$scope.onehour / 2, //how long before you can start going again fixme this could be varied
		'tilsleep':$scope.onehour * 16, //how long before you have to sleep
		'sleeptime':$scope.onehour * 8, //how long you must sleep fixme this could be varied


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
			{
				'id':1,
				'condition':1
			},
			{
				'id':2,
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

    //map variables
    $scope.map = 0;
    //$scope.markers = [];
    //$scope.infolinks = [];
    $scope.infowindow = new google.maps.InfoWindow();

	//on load, check localstorage for previous save
	$scope.init = function(){
		//$scope.obj.speedm = 5.36448; //12mph is 5.36448 metres per second, 30kmph is 8.3333 metres per second, 20mph is about 9 metres per second
		var saved = localStorage.getItem('peddler');
		console.log(saved);
		//if there's a save file, load it
		$scope.dests = dests; //need to do this prior to loading
		if(saved !== null && saved.length > 0){ //firefox and chrome seem to handle this differently
			console.log('loading');
			saved = JSON.parse(saved);
			$scope.obj = saved;
			$scope.load();
		}
		if(!$scope.obj.pause){
			$scope.start();
		}
		//set up destination stuff
		$scope.checkDests();
		$scope.recalcStuff();
        $scope.doMap();
	};

	//initialise and switch destinations
	$scope.checkDests = function(increment){
		//console.log('checkDests',$scope.obj.currdest,$scope.dests[$scope.obj.currdest]);
  		$scope.currdest = $scope.dests[$scope.obj.currdest].name;
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
		$scope.obj.timestamp = Math.floor(Date.now() / 1000);
		localStorage.setItem('peddler', JSON.stringify($scope.obj));
	};

	//called on init if save found
	$scope.load = function(){
        var now = Math.floor(Date.now() / 1000);
        var diff = now - $scope.obj.timestamp;
        console.log(diff);
        /*
        	decide when next event will be
        	from saved time until that time, calculate distance covered, places passed through etc.
        	call event, adjust speed, etc.
        	repeat until now
        */
        $scope.calculateJourney(diff);
    };

	//clear localstorage
	$scope.deleteSave = function(){
		console.log('delete');
		localStorage.setItem('peddler', '');
	};

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
				$scope.obj.seconds += tmp;
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

	//main loop, increases time
	$scope.loop = function(){
		//autosave

		$scope.obj.seconds += (1 * $scope.obj.timespeed);
		$scope.calcTime();

		//console.log('currdest',$scope.obj.currdest);
		if($scope.obj.actualcurrdestdist === 0){
            $scope.checkDests(1);
        }

		//increment distance, based on speed
		var newdist = ($scope.obj.speedkmph / 3600) * $scope.obj.timespeed; //distance in km we've travelled since last
		//console.log('newdist',newdist);
		$scope.obj.actualdistkm = $scope.obj.actualdistkm + newdist; //add to total travelled

		$scope.obj.distancemi = $scope.oneDecimal($scope.obj.actualdistkm / 1.6); //convert km travelled to miles travelled
		$scope.obj.distancekm = $scope.oneDecimal($scope.obj.actualdistkm);
		$scope.obj.actualcurrdestdist = Math.max(0,$scope.obj.actualcurrdestdist - newdist);
		$scope.obj.currdestdist = $scope.oneDecimal($scope.obj.actualcurrdestdist);

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
	
	$scope.doMap = function(){
        //only create a map if it doesn't exist already
        if($scope.map === 0){
            $scope.map = new google.maps.Map(document.getElementById('map'), {
                zoom: 4,
                disableDefaultUI: true
            });
            var bounds = new google.maps.LatLngBounds(null);
            var points = [
                $scope.dests[$scope.obj.currdest].name + ', ' + $scope.dests[$scope.obj.currdest].loc,
                $scope.dests[$scope.obj.currdest - 1].name + ', ' + $scope.dests[$scope.obj.currdest - 1].loc,
            ];
            console.log(points);
            var latlngpoints = []; //store the results of the geocoder
            var lastloop = 0;
            var geocoder =  new google.maps.Geocoder();
            for(var i = 0; i < points.length; i++){
                geocoder.geocode( { 'address': points[i]}, function(results, status) {
                    if(status === google.maps.GeocoderStatus.OK) {
                        lastloop++;
                        //results[0].geometry.location.lat()
                        //results[0].geometry.location.lng()
                        //console.log(results[0].geometry.location);
                        var latlong = {lat:results[0].geometry.location.lat(), lng:results[0].geometry.location.lng()};
                        latlngpoints.push(latlong);
                        //console.log(latlong);
                        var marker = new google.maps.Marker({
                            position: latlong,
                            map: $scope.map,
                            //zIndex: zindex,
                            //icon: $scope.url_mediapath + markerimg,
                            zoom:1
                        });
                        bounds.extend(marker.position);
                        if(lastloop === points.length){
                            lastloop = 0;
                            console.log('last',$scope.dests[$scope.obj.currdest].type);
                            //draw route between the two points
                            if($scope.dests[$scope.obj.currdest].hasOwnProperty('type')){ //if route type is a boat or plane, just draw a straight line
                                var line = new google.maps.Polyline({
                                    path: [
                                        //new google.maps.LatLng(37.4419, -122.1419),
                                        //new google.maps.LatLng(37.4519, -122.1519)
                                        latlngpoints[0],
                                        latlngpoints[1]
                                    ],
                                    strokeColor: '#FF0000',
                                    strokeOpacity: 1.0,
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
                                var directionsDisplay = new google.maps.DirectionsRenderer();
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

        }
        else {
            //console.log('clearing map');
            $scope.deleteMarkers();
        }
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
