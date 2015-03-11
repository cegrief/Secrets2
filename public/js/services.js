'use strict';

/* Services */


angular.module('secrets.services', []).
    factory('parse', function($rootScope, $http){

        var Secret = Parse.Object.extend("NorthwesternSecrets");
        var Submission = Parse.Object.extend("Submission");
        var parseFactory = {};

        //gets list of secrets from parse
        parseFactory.getList = function() {
            return $http.get('/api/list', {});
        };

        parseFactory.parseList = function(results){
            var list = [];
            for(var i = 0; i<results.length; i++){
                console.log(results[i])
                list[i]= {
                    id: results[i].objectId,
                    category: results[i].category,
                    title: results[i].title,
                    summary: results[i].summary,
                    location: results[i].location,
                    image: results[i].image,
                    done: results[i].completed,
                    task: results[i].task,
                    attempted : results[i].submissions
                };
            }
            return list;
        };

        parseFactory.submitSecret = function(secret){

            return $http.post('/api/secret/', {secret:secret});

        };

        parseFactory.getSecret = function(id){

            return $http.get('/api/secret/'+id, {});

        };
        parseFactory.login = function(user, pass){
            $http.post('/api/login/', {
                username: user,
                password: pass
            }).then(function(res){
                $rootScope.currentUser = res.data;
            });
        };

//TODO: make everything below this line use the api


        parseFactory.submit = function(secret, submission, img){

            return $http.post('/api/submission/', {
                secret: secret,
                submission: submission,
                image:img
            });

        };


        parseFactory.getKnown = function(){
            return $http.get('/api/known/')
        };

        parseFactory.getWant = function(){
            return $http.get('/api/wanted/')
        };

        parseFactory.getOwned = function(){
            return $http.get('/api/owned')
        };

        parseFactory.getReview = function(){
            return $http.get('/api/review')
        };

        parseFactory.delete = function(secret){
            return secret.destroy();
        };

        parseFactory.approve = function(sub){
            return $http.post('/api/submission/approve',
                {submission: sub})
        };

        parseFactory.deny = function(sub){
            return $http.post('/api/submission/deny',
                {submission: sub})
        };

        return parseFactory;
    })
    .factory('mail', function(){
        var mailFactory = {};

        mailFactory.submit = function(owner, type){
            var req = $.ajax( {url: "http://secrets.ci.northwestern.edu:3000",
                type: "GET",
                data: {name: owner.get("username"),
                    email: owner.get("email"),
                    type:type }
            });

            return req;

        };

        return mailFactory;
    })
    .factory('geoloc', function(){

        var geoLocation = {};

        var getPosition = function(position){
            geoLocation.lat = position.coords.latitude;
            geoLocation.lng = position.coords.longitude;
            geoLocation.accuracy = position.coords.accuracy;
        };

        var getError = function (error) {
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    geoLocation.error = "User denied the request for Geolocation."
                    break;
                case error.POSITION_UNAVAILABLE:
                    geoLocation.error = "Location information is unavailable."
                    break;
                case error.TIMEOUT:
                    geoLocation.error = "The request to get user location timed out."
                    break;
                case error.UNKNOWN_ERROR:
                    geoLocation.error = "An unknown error occurred."
                    break;
            }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(getPosition, getError);
        }
        else {
            $scope.error = "Geolocation is not supported by this browser.";
        }

        geoLocation.getLat = function() {
            return geoLocation.lat;
        };

        geoLocation.getLong = function() {
            return geoLocation.lng;
        };

        geoLocation.getAcc = function() {
            return geoLocation.accuracy;
        };

        return geoLocation;
    });
