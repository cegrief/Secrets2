'use strict';

/* Controllers */

angular.module('secrets.controllers', [])
    .controller('listController', ['$scope', 'parse', function($scope, parse) {
        $scope.listPage = true;

        parse.getList().then(function(res){
            $scope.secretsList = parse.parseList(res);
            $scope.$apply();
        });
    }])
    .controller('pageController', ['$scope','parse','$routeParams', "mail", 'geoloc', '$location', function($scope,parse,$routeParams, mail, geoloc, $location) {

        $scope.listPage = false;
        parse.getSecret($routeParams.id).then(function(res){
            //get the secret values on the scope
            $scope.secret = res;
            $scope.submission = '';
            $scope.$apply();

            $scope.coordinates = {
                latitude: geoloc.getLat(),
                longitude: geoloc.getLong()
            };

            //submits image and submission to parse
            $scope.submit = function() {
                parse.submit($scope.secret, $scope.submission, $scope.image, $scope.coordinates).then(function(res){
                        //send email to owner
                        mail.submit($scope.secret.get("ownerID"), "submit");
                        //TODO redirect page to list with success message
                        $location.path("/secretsList")
                    },
                    function(error){
                        console.log(error);
                    });
            };


            //TODO make this not require a jquery event handler.
            var upload= function(myfile) {
                var reader = new FileReader();
                reader.onload = function(event){
                    var object = {};
                    object.filename = myfile.name;
                    object.data = event.target.result;
                    object.data = object.data.slice(object.data.indexOf('base64')+7, object.data.length);
                    $.ajax({
                        url: 'https://api.imgur.com/3/image',
                        method:'POST',
                        headers:{
                            Authorization:'Client-ID 25452dcdd5e816d'
                        },
                        data: {
                            image: object.data,
                            type:'base64'
                        },
                        success: function(obj, stat, xhr){
                            $('#mypic').attr("src", JSON.parse(xhr.responseText).data.link)
                        }
                    });
                };
                reader.readAsDataURL(myfile)

            };
            $('#picture').change(function(event){
                $.each(event.target.files, function(index, file){
                    var myfile = file;
                    upload(myfile)
                });
            });

        });

    }])
    .controller('loginController', ['$scope', 'parse', '$location', function($scope, parse, $location){
        $scope.loginPage = true;
        $scope.listPage = false;
        $scope.login = function(user, pass){
            parse.login(user, pass);
            $scope.loggedIn = true;
            $location.path('/secretsList');
        }
    }])
    .controller('dashboardController', ['$scope', 'parse', 'mail', '$location', '$route', function($scope, parse, mail, $location, $route){
        $scope.listPage = false;
        $scope.dashboardPage = true;

        $scope.isActive = function(route){
            return route === $location.path();
        };

        parse.getKnown().then(function(res){

            console.log("getting known")
            $scope.knownSecrets = res;
            $scope.$apply()
            console.log($scope.knownSecrets)
        });

        parse.getWant().then(function(res){
            $scope.wantedSecrets = res;
            $scope.$apply();
        });

        parse.getOwned().then(function(res){
            $scope.ownedSecrets = res;
            $scope.edit = function(id){
                $location.path('/submit/'+id);
            };

            $scope.delete = function(secret){
                parse.delete(secret);
                $route.reload()
            };
            $scope.$apply();
        });

        parse.getReview().then(function(res) {
            $scope.submissions = res;
            $scope.approve = function (sub) {
                parse.approve(sub).then(function (res) {
                    $scope.approve = true;
                });
            };

            $scope.deny = function (sub) {
                parse.deny(sub).then(function (res) {
                    $scope.deny = true;
                });
            };
            $scope.$apply();
        });
    }])
    .controller('submitController', ['$scope', 'parse', '$routeParams', '$location', function($scope, parse, $routeParams, $location){
        $scope.secret = {
            image:"secret.jpg"
        };

        $(".form-control").not(".category").popover({
            animation:true,
            title:"Examples",
            placement:"bottom",
            trigger:'focus',
            html:true
        });

        var allCategories = [
            {word: "corey"},
            {word: "carey"}
        ];
        var catnames = new Bloodhound({
            datumTokenizer: function(d) {return Bloodhound.tokenizers.whitespace(d.word)},
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            local: allCategories
        });
        catnames.initialize();
        $('input.tagsinput').tagsinput({typeaheadjs: {
            name: 'catnames',
            displayKey: 'word',
            valueKey: 'word',
            source: catnames.ttAdapter()
        }});

        if($routeParams.id){
            parse.getSecret($routeParams.id).then(function(res){
               $scope.secret = {
                   title:res.get("Secret"),
                   category:res.get("Category"),
                   location:res.get("secretLocation"),
                   description:res.get("Summary"),
                   task:res.get("conditionForSharingWithSomeoneElse"),
                   image:res.get("Image"),
                   secret:res.get("Directions"),
                   id:res.id
               };
                $scope.$apply();
            });
        }

        $scope.submit = function() {
            if($scope.secret.category == "Other"){
                $scope.secret.category = $scope.secret.otherCat;
            }
            parse.submitSecret($scope.secret).then(function(res){
                $scope.success = true;
            });
        };

        $('#picture').change(function(event){
            $.each(event.target.files, function(index, file){
                var myfile = file;
                upload(myfile)
            });
        });

        var upload= function(myfile) {
            var reader = new FileReader();
            reader.onload = function(event){
                var object = {};
                object.filename = myfile.name;
                object.data = event.target.result;
                object.data = object.data.slice(object.data.indexOf('base64')+7, object.data.length);
                $.ajax({
                    url: 'https://api.imgur.com/3/image',
                    method:'POST',
                    headers:{
                        Authorization:'Client-ID 25452dcdd5e816d'
                    },
                    data: {
                        image: object.data,
                        type:'base64'
                    },
                    success: function(obj, stat, xhr){
                        $scope.secret.image = JSON.parse(xhr.responseText).data.link;
                        $scope.$apply();
                        console.log($scope);
                    }
                });
            };
            reader.readAsDataURL(myfile)

        };

    }]);