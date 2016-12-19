/* globals angular, dests, google */

if(!Date.now){
	Date.now = function(){ return new Date().getTime(); };
}

/*
	useful
	http://cyclehacker.com/route-to-cycle-around-the-world/
	https://www.google.com/maps/d/viewer?mid=1j8elWnGTrl4uC4zwmNI9Hspbr7s&ll=-1.867345112922028%2C0&z=2
	https://en.wikipedia.org/wiki/Mark_Beaumont
	https://en.wikipedia.org/wiki/Around_the_world_cycling_record

	http://www.dailyrecord.co.uk/news/scottish-news/scots-cyclist-mark-beaumont-tells-969029
	18,300 - The number of miles Mark cycled.
	13 - His average speed in mph.
	20 - The number of countries cycled through on the epic trip.
	3 - The number of crashes he had.
	12 - The number of tyres used.
	7 - The number of punctures.
	6 - The number of pairs of shorts worn out.
	115-120 - Mark's average heart rate measured in beats per minute.
	2000-6000 - How many calories he burned off every day.
	10-20 - The number of pints of liquid he drank every day.
	8 - The number of police cells Mark slept in.
*/

angular.module('peddler', []).controller('peddlerController',function($scope,$interval) {
	$scope.weight = 0;
	$scope.oneday = 86400; //number of seconds in one day
	$scope.onehour = 3600; //number of seconds in an hour

	$scope.numbermultiplier = 10000000; //some numbers e.g. seconds get stored as a tiny float otherwise it gets huge and breaks js

	$scope.mode = 1; //mode indicates whether we're running in realtime (1) or simulated (0, loading)
	$scope.timestep = 1; //defaults to 1 second, unless we're loading, in which case we negotiate time in larger chunks
	$scope.speednerf = 1;

	$scope.boatplanespeeds = [0,40,900];
	
	$scope.messagetypes = [
		{	'name':'Destinations',
			'show':true
		},
		{	'name':'Stops',
			'show':true
		},
		{	'name':'Events',
			'show':true
		},
	];

    //map variables
    $scope.map = 0;
    $scope.markers = [];
    //$scope.infolinks = [];
    $scope.infowindow = new google.maps.InfoWindow();
    $scope.routecolours = ['blue','green'];
    $scope.currcolour = 0;

	//all these variables get saved
	$scope.obj = {
		'distkm':0, //actual distance peddled
		'totaldistkm':0, //total distance including boats, planes etc.
		'currdest':1, //keeps track of which destination we're currently heading to
		'currdestdist':-1, //display distance to next location
		'currdesttime':-1, //time to current destination (doesn't need to be human readable)

		'starttime':'',
		'seconds':0,
		'totaltime':0, //human readable form of time taken
		'speedkmph':30,
		'speedkmphstored':0, //used to store our original speed while it changes e.g. if on a boat fixme
		'timespeed':1,
		'timestamp':0,
		'pause':0,

		//fixme maybe an option for how long between rests - that alters how much sleep needed?
		'awake':1, //trigger to tell if we're asleep or not
		'moving':1, //currently moving or not
		'tilstop':0,
		'tilgo':0,
		'tilsleep':0,
		'tilwake':0,
		'tilevent':0,

		//these are the stored values for resting/sleeping, will be used for resets and can be varied fixme
		'tilstopstored':$scope.onehour * 2, //how long you can go without a rest
		'tilgostored':$scope.onehour / 3, //how long before you can start going again
		'tilsleepstored':$scope.onehour * 15, //how long before you have to sleep
		'tilwakestored':$scope.onehour * 9, //how long before you wake up
		'tileventstored':$scope.onehour * 100, //how long until the next event, will be randomised, fixme currently set to really high to not conflict

		'onplaneboat':0, //flag to show if we're on a plane or a boat, as opposed to cycling. If not cycling, counts as a rest

		'health':1,
		'bike': {
			'weight':1,
			//rate of deterioration is amount to decrease condition by per km
			'parts':[
				{	'name':'Front tyre',
					'cond':1,
					'decay':1 / 3000,
				},
				{	'name':'Rear tyre',
					'cond':1,
					'decay':1 / 3000,
				},
				{	'name':'Front wheel',
					'cond':1,
					'decay':1 / 8000,
				},
				{	'name':'Rear wheel',
					'cond':1,
					'decay':1 / 8000,
				},
				{	'name':'Brakepads',
					'cond':1,
					'decay':1 / 400,
				},
				{	'name':'Chain',
					'cond':1,
					'decay':1 / 3000,
				},
				{	'name':'Frame',
					'cond':1,
					'decay':0,
				},
				{	'name':'Seat',
					'cond':1,
					'decay':0,
				},
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
			'name':'Tent',
			'weight':2,
		},
	];
	/*
		mattress
		sunglasses
		puncture kit? tools
		insect repellent
		suncream
		lights
		water bottles
	*/

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
			$scope.obj.tilstop = $scope.obj.tilstopstored;
			$scope.obj.tilgo = $scope.obj.tilgostored;
			$scope.obj.tilwake = $scope.obj.tilwakestored;
			$scope.obj.tilevent = $scope.obj.tileventstored;
			$scope.messages.create('You have begun your journey',$scope.getTimeNow(),0);
			$scope.obj.starttime = Date.now(); //stores the start time in timestamp milliseconds, will need later for loading calculations
			//work out what time is now, adjust sleep pattern accordingly
			var currhour = new Date();
			currhour = currhour.getHours();
			//assuming an 8 hour sleep, beginning at 11pm fixme maybe need to increase sleep to include time for eating, shopping
			if(currhour < 22 && currhour > 6){
				$scope.obj.tilsleep = (22 - currhour) * $scope.onehour;
			}
			else {
				$scope.obj.tilsleep = $scope.obj.tilsleepstored;
			}
		}
		if(!$scope.obj.pause){
			$scope.start();
		}
		//set up destination stuff
		$scope.checkDests();
		$scope.recalcStuff();
        $scope.doMap();
/*
        for(var m = 0; m < $scope.obj.messages.length; m++){
	        console.log($scope.obj.messages[m]);
		}
*/
		//reset for realtime operation
		$scope.timestep = 1;
		$scope.mode = 1;

	};
	
	//pad a digit with a given number of leading zeroes
	$scope.pad = function(n, width, z) {
		z = z || '0';
		n = n + '';
		return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
	};

	//get the actual date time right now
	$scope.getTimeNow = function(){
		var rd;
		if($scope.mode){
			rd = new Date();
		}
		else {
			rd = $scope.obj.starttime + (($scope.obj.seconds * $scope.numbermultiplier) * 1000); //convert obj.seconds to milliseconds
			rd = new Date(rd);
			//console.log('Started:',$scope.obj.starttime,'seconds:',($scope.obj.seconds * $scope.numbermultiplier) * 1000,'start date',rd);
		}
		return rd.getDate() + '/' + $scope.pad((rd.getMonth()+1),2)  + '/' + rd.getFullYear() + ' @ ' + $scope.pad(rd.getHours(),2) + ':' + $scope.pad(rd.getMinutes(),2) + ':' + $scope.pad(rd.getSeconds(),2);
	};

	//initialise destinations and change destinations
	$scope.checkDests = function(increment){
		//console.log('checkDests',$scope.obj.currdest,$scope.dests[$scope.obj.currdest]);
  		//change destination
		if(increment){
	  		$scope.currdest = $scope.dests[$scope.obj.currdest].name; //fixme this line is duplicated below
            $scope.obj.currdest++;
            $scope.obj.currdestdist = $scope.dests[$scope.obj.currdest].dist;
            //console.log($scope.obj.currdest,$scope.currdest,$scope.dests[$scope.obj.currdest].loc);
			//console.log('new destination,',$scope.obj.currdest,$scope.currdest,$scope.dests[$scope.obj.currdest].loc,$scope.obj.currdesttime);
            $scope.messages.create('You reached ' + $scope.currdest + ', ' + $scope.dests[$scope.obj.currdest - 1].loc + ' after ' + $scope.obj.totaltime,$scope.getTimeNow(),0);
			if($scope.dests[$scope.obj.currdest].hasOwnProperty('type')){ //if route type is a boat or plane
				$scope.getCurrDestTime();
				//console.log('currently on a boat/plane',$scope.obj.currdesttime);
				$scope.obj.onplaneboat = $scope.dests[$scope.obj.currdest].type;
				//fixme experimental - only reset sleep if the plane/boat journey time is longer than the time between now and sleep plus the length of sleep
				//would be good to do something a bit cleverer than this, but at least it keeps the sleep time consistent
				if($scope.obj.currdesttime > $scope.obj.tilsleep + $scope.obj.tilwake){
					$scope.timings.resets.resetTilsleep();
					$scope.timings.resets.resetTilwake();
				}
				$scope.timings.resets.resetTilstop();
				//console.log('type:',$scope.dests[$scope.obj.currdest].type);
				$scope.obj.speedkmphstored = $scope.obj.speedkmph;
				$scope.obj.speedkmph = $scope.boatplanespeeds[$scope.dests[$scope.obj.currdest].type];
			}
			else {
				if($scope.obj.onplaneboat){
					$scope.obj.onplaneboat = 0;
					$scope.obj.speedkmph = $scope.obj.speedkmphstored;
				}
			}
		}
  		$scope.currdest = $scope.dests[$scope.obj.currdest].name;
  		$scope.prevdest = Math.max(0,$scope.obj.currdest - 1);
	    $scope.prevdest = $scope.dests[$scope.prevdest].name;
  		$scope.currcountry = $scope.dests[$scope.obj.currdest].loc;
  		var tmp = Math.max(0,$scope.obj.currdest - 1);
  		$scope.prevcountry = $scope.dests[tmp].loc;
  		if($scope.obj.currdestdist === -1){
            $scope.obj.currdestdist = $scope.dests[$scope.obj.currdest].dist;
        }
    };
    
	//general single function to call if we change gear, weather, etc.
	$scope.recalcStuff = function(){
		$scope.calcWeight();
		//$scope.calcSpeed();
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
		$scope.mode = 0;
        var now = Math.floor(Date.now() / 1000);
        var diff = now - $scope.obj.timestamp;
        $scope.loaddiff = diff;
        console.log('Offline for:',diff);
        //$scope.calculateJourney(diff);
        $scope.loadLoop();
	};
	
	//given an array of numbers, return the index of the smallest
	$scope.timeComparison = function(compare){
		//console.log('timeComparison',compare);
		var ln = compare.length;
		var smallest = 10000000000;
		var smallestindex = 0;
		for(var b = 0; b < ln; b++){
			if(compare[b] < smallest){
				smallest = compare[b];
				smallestindex = b;
			}
		}
		return smallestindex;
	};

	//decide how long until next thing - sleep, rest, new destination, event
	//call newLoop with that time length and a call to the function to handle the upcoming thing
	$scope.loadLoop = function(){
		if($scope.loaddiff > 0){
			var comparing = [];
			var smallest = 0;
			if($scope.obj.awake){
				if($scope.obj.moving){
					//find which is smallest - time til next stop, next sleep, next event, etc.
					if($scope.obj.onplaneboat){ //if we're not cycling, don't consider time til next rest/sleep
						comparing = [
							$scope.loaddiff,
							$scope.obj.currdesttime,
						];
					}
					else {
						comparing = [
							$scope.loaddiff,
							$scope.obj.currdesttime,
							$scope.obj.tilstop,
							$scope.obj.tilsleep,
							//$scope.obj.tilevent //fixme events not implemented yet
						];
					}
					smallest = $scope.timeComparison(comparing);
					//smallestindex is now the index of the item in the array that is the smallest
					switch(smallest){
						case 0:
							$scope.timestep = $scope.loaddiff;
							//console.log('loaddiff is next thing to happen',$scope.timestep);
							break;
						case 1:
							$scope.timestep = $scope.obj.currdesttime;
							//console.log('currdesttime is next thing to happen',$scope.timestep);
							break;
						case 2:
							$scope.timestep = $scope.obj.tilstop;
							//console.log('tilstop is next thing to happen',$scope.obj.tilstop);
							break;
						case 3:
							$scope.timestep = $scope.obj.tilsleep;
							//console.log('tilsleep is next thing to happen',$scope.timestep);
							break;
					}
				}
				else { //not moving, so on a rest
					comparing = [
						$scope.loaddiff,
						$scope.obj.tilgo,
					];
					smallest = $scope.timeComparison(comparing);
					switch(smallest){
						case 0:
							$scope.timestep = $scope.loaddiff;
							//console.log('loaddiff is next thing to happen',$scope.timestep);
							break;
						case 1:
							$scope.timestep = $scope.obj.tilgo;
							//console.log('tilgo is next thing to happen',$scope.timestep);
							break;
					}
				}
			}
			else { //asleep
				comparing = [
					$scope.loaddiff,
					$scope.obj.tilwake,
				];
				smallest = $scope.timeComparison(comparing);
				switch(smallest){
					case 0:
						$scope.timestep = $scope.loaddiff;
						//console.log('loaddiff is next thing to happen',$scope.timestep);
						break;
					case 1:
						$scope.timestep = $scope.obj.tilwake;
						//console.log('tilwake is next thing to happen',$scope.timestep);
						break;
				}
			}
			$scope.loaddiff = Math.max(0,$scope.loaddiff - $scope.timestep);
			$scope.newLoop();
		}
		else {
			console.log('diff used up, returning to normal operation');
			$scope.mode = 1;
		}
    };
    
    //calculate how long to current destination at current speed
    $scope.getCurrDestTime = function(){
		//console.log($scope.currdest);
		if($scope.obj.moving && $scope.currdest){ //sometimes there isn't a currdest, so large loading calculations can break horribly, hence this check
			if(!$scope.obj.onplaneboat){
				$scope.obj.currdesttime = ($scope.obj.currdestdist / ($scope.obj.speedkmph * $scope.speednerf)) * $scope.onehour;
			}
			else {
				$scope.obj.currdesttime = ($scope.obj.currdestdist / $scope.obj.speedkmph) * $scope.onehour;
			}
			//console.log('recalculating CurrDestTime',$scope.obj.currdesttime,$scope.obj.currdestdist,$scope.currdest);
		}
	};

	//calculate time so far
	$scope.calcTime = function(){
		var totaltime = $scope.obj.seconds * $scope.numbermultiplier;
		var days = Math.floor(totaltime / 86400);
		totaltime -= days * 86400;
		var hours = Math.floor(totaltime / 3600) % 24;
		totaltime -= hours * 3600;
		var minutes = Math.floor(totaltime / 60) % 60;
		totaltime -= minutes * 60;
		var seconds = Math.floor(totaltime % 60);
		//fixme maybe not output zero values?
		$scope.obj.totaltime = days + ' days, ' + hours + ' hours, ' + minutes + ' minutes, ' + seconds + ' seconds';
	};
	
	//generic function to increase the amount of time that has elapsed.
	//called both by the main loop (per second) and by the load functionality
	$scope.incrementTime = function(){
		$scope.obj.seconds += ($scope.timestep * $scope.obj.timespeed) / $scope.numbermultiplier;
	};
	
	//increment distance, based on speed
	$scope.incrementDistance = function(incrementby){
		var newdist = 0;
		if(!$scope.obj.onplaneboat){
			newdist = ((($scope.obj.speedkmph * $scope.speednerf) / 3600) * $scope.obj.timespeed) * incrementby; //distance in km we've travelled since last
			$scope.obj.distkm = $scope.obj.distkm + newdist; //total peddalled
		}
		else {
			newdist = (($scope.obj.speedkmph / 3600) * $scope.obj.timespeed) * incrementby;
		}
		$scope.obj.totaldistkm = $scope.obj.totaldistkm + newdist; //total travelled
		$scope.obj.currdestdist = Math.max(0,$scope.obj.currdestdist - newdist);

	};

	//main loop
	$scope.newLoop = function(){
		//console.log('newLoop, timestep is:',$scope.timestep);
		$scope.incrementTime();
		$scope.calcTime();
		if(!$scope.obj.onplaneboat){
			$scope.timings.checkRest();
			$scope.timings.checkSleep(); //fixme need to decide what to do about sleep on a boat/plane, also need to set speed accordingly
		}

		if($scope.obj.awake && $scope.obj.moving){
			$scope.incrementDistance($scope.timestep);
			$scope.health.updatePartStatus();
			if($scope.obj.currdestdist === 0){
	            $scope.checkDests(1);
	            if($scope.mode){ //only draw the map once the loading has finished, otherwise geocoder gets really confused
		            $scope.doMap();
				}
	        }
		}

		//if we're not running in realtime, call loadloop again
		//otherwise newLoop is called by an interval
		$scope.getCurrDestTime();
		if(!$scope.mode){
			//console.log('mode = loading, continuing');
			if($scope.loaddiff){
				$scope.loadLoop();
			}
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
	//fixme what is the point of this function??? will be useful later, presumably
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
		//$scope.obj.speedkmph = $scope.obj.speedkmph; //fixme this used to be rounded to display a sensible number in the FE but now it's redundant
	};

	//fixme this is just for testing and breaks some of the functionality
	$scope.changeSpeed = function(changeby){
        //console.log($scope.obj.speedkmph,changeby);
		$scope.obj.speedkmph += changeby;
		//$scope.calcSpeed();
	};

	$scope.messages = {
		//message types: 1 destinations, 2 rest/sleep, 3 events
		create: function(m,datetime,mtype){
			$scope.obj.messages.push({'text':m,'show':1,'datetime':datetime,'type':mtype});
		},
		/* not in use anymore
		hide: function(i){
			console.log(i);
			$scope.obj.messages[i].show = 0;
		},
		*/
		showOfType: function(show){
			var len = $scope.obj.messages.length;
			for(var m = 0; m < len; m++){
				console.log($scope.obj.messages[m]);
				if($scope.obj.messages[m].type === show || show === 0){
					$scope.obj.messages[m].show = 1;
				}
				else {
					$scope.obj.messages[m].show = 0;
				}
			}
		},
		filterMessages: function(){
			var len = $scope.obj.messages.length;
			for(var m = 0; m < len; m++){

			}
		}
	};

	$scope.health = {
		//calculate wear on parts based on rate of wear and distance travelled
		updatePartStatus: function(){
			var h = 1;
			var havg = 0;
			var ln = $scope.obj.bike.parts.length;
			//$scope.timestep
			for(var x = 0; x < ln; x++){
				var fixedat = 0;
				if($scope.obj.bike.parts[x].hasOwnProperty('fixedat')){
					fixedat = $scope.obj.bike.parts[x].fixedat;
				}
				$scope.obj.bike.parts[x].cond = Math.max(0,1 - ($scope.obj.bike.parts[x].decay * ($scope.obj.distkm - fixedat)));
				//console.log($scope.obj.bike.parts[x].name,$scope.obj.bike.parts[x].cond);
				havg += 1 - $scope.obj.bike.parts[x].cond;
			}
			//work out average wear on parts, will be used as negative multiplier on overall speed
			havg = havg / ln;
			$scope.speednerf = 1 - havg;
		},
		//fix part of the bike
		fixPart: function(which){
			console.log($scope.obj.bike.parts[which]);
			$scope.obj.bike.parts[which].fixedat = $scope.obj.distkm;
		}
	};

	//functions relating to countdowns for sleep, event occurrence, etc.
	$scope.timings = {
		//check to see if we need to sleep or wake
		//fixme need to zero speed
		checkSleep: function(){
			if($scope.obj.awake){
				$scope.obj.tilsleep = Math.max(0,$scope.obj.tilsleep - ($scope.timestep * $scope.obj.timespeed));
				if($scope.obj.tilsleep === 0){
					$scope.messages.create('You stopped to sleep',$scope.getTimeNow(),1);
					$scope.obj.awake = 0;
					$scope.obj.moving = 0;
				}
			}
			else {
				$scope.obj.tilwake = Math.max(0,$scope.obj.tilwake - ($scope.timestep * $scope.obj.timespeed));
				if($scope.obj.tilwake === 0){
					//fixme add time here
					$scope.messages.create('You woke up',$scope.getTimeNow(),1);
					$scope.obj.awake = 1;
					$scope.obj.moving = 1;
					$scope.timings.resets.resetTilsleep();
					$scope.timings.resets.resetTilwake();
					$scope.timings.resets.resetTilstop();
				}
			}
		},
		//check to see if we need to stop for a rest or not
		//fixme need to zero speed
		checkRest: function(){
			if($scope.obj.awake){
				if($scope.obj.moving){
					$scope.obj.tilstop = Math.max(0,$scope.obj.tilstop - ($scope.timestep * $scope.obj.timespeed));
					//console.log($scope.obj.tilstop);
					if($scope.obj.tilstop === 0){
						$scope.messages.create('You stopped for a rest',$scope.getTimeNow(),1);
						$scope.obj.moving = 0;
					}
				}
				else {
					$scope.obj.tilgo = Math.max(0,$scope.obj.tilgo - ($scope.timestep * $scope.obj.timespeed));
					if($scope.obj.tilgo === 0){
						$scope.messages.create('You set off again',$scope.getTimeNow(),1);
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
				$scope.obj.tilstop = $scope.obj.tilstopstored;
			},
			resetTilgo: function(){
				$scope.obj.tilgo = $scope.obj.tilgostored;
			},
			resetTilsleep: function(){
				$scope.obj.tilsleep = $scope.obj.tilsleepstored;
			},
			resetTilwake: function(){
				$scope.obj.tilwake = $scope.obj.tilwakestored;
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
								strokeOpacity: 0.5,
								strokeWeight: 5,
								map: $scope.map
							});
						}
						else { //plot an actual driving route
							var request = {
								origin: latlngpoints[0],
								destination: latlngpoints[1],
								travelMode: google.maps.TravelMode.BICYCLING
							};
							//fixme must be a cleaner way of doing this, also might want to expand at some point
							if($scope.currcolour === 0){
								$scope.currcolour = 1;
							}
							else {
								$scope.currcolour = 0;
							}
							var directionsDisplay = new google.maps.DirectionsRenderer({
								suppressMarkers: true,
								polylineOptions: {
									strokeColor: $scope.routecolours[$scope.currcolour],
									strokeOpacity: 0.5,
									strokeWeight: 5
							    }
							});
							directionsDisplay.setMap($scope.map);
							var directionsService = new google.maps.DirectionsService();
							directionsService.route(request, function (response, status) {
								if (status === google.maps.DirectionsStatus.OK) {
									directionsDisplay.setDirections(response);
									console.log('Directions service returned:',response);
									directionsDisplay.setMap($scope.map);
								} else {
									console.log('Directions Request from ' + request.origin.toUrlValue(6) + ' to ' + request.destination.toUrlValue(6) + ' failed: ' + status);
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
