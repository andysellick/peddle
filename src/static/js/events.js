
var events = [
{	'name':'Flat tyre',
	'message':'You got a puncture.',
	'timepenalty':0,
	'bikedamage':1,
	'healthdamage':0,

	'result': function(){
		//console.log('puncture');
	}
},
{	'name':'Accident',
	'message':'You were involved in an accident.',
	'result': function(){
		//console.log('accident');
	}
},
{	'name':'Picture',
	'message':'You stopped to take a picture',
	'result': function(){
		//console.log('picture');
	}
},
];

/*
	possible events/interactions

	puncture/fix puncture
	random achievement related things e.g. take photo
	be injured/stop at a hospital
	change tires/other bike gear - might need varying terrain, weather
	how about if you're actually running the game you go faster? or need less rests?

*/