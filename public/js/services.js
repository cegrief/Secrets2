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

//TODO: make everything below this line use the api


        parseFactory.submit = function(secret, submission, img, coordinates){
            //update secret count
            var sec = new Parse.Query(Secret);
            sec.get(secret.id, {
                success:function(res){
                    res.increment("count");
                    res.save();
                },
                error:function(err){
                    console.log(err);
                }
            });

            //make submission
            var sub = new Submission();
            sub.set("secretID", secret);
            sub.set("done", "IP");
            sub.set("new", true);
            sub.set("submission", submission);
            sub.set("image", img);
            sub.set("UserID", Parse.User.current());
            sub.set("ownerID", secret.get("ownerID"));
            sub.set("lat", coordinates.latitude);
            sub.set("long", coordinates.longitude);

            if((Math.abs(coordinates.latitude - secret.get('lat')) < 1) &&(Math.abs(coordinates.longitude - secret.get('long')) <1)){
                sub.set("done","done");
            }
            return sub.save(null, {});

        };


        parseFactory.login = function(user, pass){
            $http.post('/api/login/', {
                username: user,
                password: pass
            }).then(function(res){
                $rootScope.currentUser = res.data;
            });
        };

        parseFactory.getKnown = function(){
            $http.get('/api/known/').then(function(res){
                console.log(res.body);
                return res.body;
            });
        };

        parseFactory.getWant = function(){
            var query = new Parse.Query(Submission);
            query.include("secretID");
            query.equalTo("UserID", $rootScope.currentUser);
            return query.find();
        };

        parseFactory.getOwned = function(){
            var query = new Parse.Query(Secret);
            query.equalTo("ownerID", $rootScope.currentUser);
            return query.find();
        };

        parseFactory.getReview = function(){
            console.log("asdf");
            var query = new Parse.Query(Submission);
            query.include("secretID");
            query.include("UserID");
            query.equalTo("done", "IP");
            query.equalTo("ownerID", $rootScope.currentUser);
            return query.find();
        };

        parseFactory.delete = function(secret){
            return secret.destroy();
        };

        parseFactory.approve = function(sub){
            var query = new Parse.Query(Secret);
            console.log(sub.get("secretID").id);
            query.equalTo("objectId", sub.get("secretID").id);
            query.find().then(function(res){
                res[0].increment("completedCount");
                res[0].save();
            });

            sub.set("done", "yes");
            return sub.save();
        };

        parseFactory.deny = function(sub){
            sub.set("done", "no");
            return sub.save();
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
