'use strict';

/* Services */


angular.module('secrets.services', []).
    factory('parse', function($rootScope, $http){

        var Secret = Parse.Object.extend("NorthwesternSecrets");
        var Submission = Parse.Object.extend("Submission");
        var parseFactory = {};

        //gets list of secrets from parse
        parseFactory.getList = function() {
            var query = new Parse.Query(Secret);
            return query.find();
        };

        parseFactory.parseList = function(results){
            var list = [];
            for(var i = 0; i<results.length; i++){
                list[i]= {
                    id: results[i].id,
                    category: results[i].get("Category"),
                    title: results[i].get("Secret"),
                    summary: results[i].get("Summary"),
                    location: results[i].get("secretLocation"),
                    image: results[i].get("Image"),
                    done: results[i].get("done"),
                    task: results[i].get("conditionForSharingWithSomeoneElse")
                };
            }
            return list;
        };

        parseFactory.getSecret = function(id){
            var query = new Parse.Query(Secret);
            query.include("ownerID");
            return query.get(id, {});
        };

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

        parseFactory.submitSecret = function(secret){

            var sec = new Secret();
            sec.set("objectId", secret.id);
            sec.set("Name", $rootScope.currentUser.get("username"));
            sec.set("Secret", secret.title);
            sec.set("Category", secret.category);
            sec.set("secretLocation", secret.location);
            sec.set("Directions", secret.secret);
            sec.set("conditionForSharingWithSomeoneElse", secret.task);
            sec.set("Summary", secret.description);
            sec.set("Image", secret.image);
            sec.set("ownerID", $rootScope.currentUser);
            sec.set("completedCount",0);
            sec.set("count", 0);

            return sec.save();

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
            var query = new Parse.Query(Submission);
            query.include("secretID");
            query.equalTo("done", "yes");
            query.equalTo("UserID", Parse.User.current());
            return query.find();
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
