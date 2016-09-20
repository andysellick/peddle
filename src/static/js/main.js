/* globals angular */

//angular.module('peddler', []).controller('peddlerController',function($scope,$http,$window,$timeout,$compile){
angular.module('peddler', []).controller('peddlerController',function($scope,$timeout) {
	$scope.obj = {
		'clicks':0, //how many times clicked
		'pedals':0, //based on times clicked and extras
		'distance':0, //total distance covered, based on pedals
	};

	//on load, check localstorage for previous save
	$scope.init = function(){
		var saved = localStorage.getItem('peddler');
		console.log(saved);
		if(saved !== null){
			console.log('loading');
			saved = JSON.parse(saved);
			$scope.obj = saved;
		}

		$timeout(function(){
			console.log('timeout done');
		},2000);

	};

	//save all data to local storage
	$scope.save = function(){
		console.log('saving');
		localStorage.setItem('peddler', JSON.stringify(this.obj));
	};

	//clear localstorage
	$scope.deleteSave = function(){
		console.log('delete');
		localStorage.setItem('peddler', '');
	};

	$scope.clicker = function(){
		this.obj.clicks++;
		console.log('click');
	};
	
	$scope.loop = function(){

	};
});
