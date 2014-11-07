'use strict';


// Declare app level module which depends on filters, and services
angular.module('secrets', [
  'ngRoute',
  'secrets.filters',
  'secrets.services',
  'secrets.directives',
  'secrets.controllers'
]).config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/secretPage/:id',{templateUrl: 'partials/secretPage.html', controller: 'pageController'});
    $routeProvider.when('/secretsList',{templateUrl: 'partials/secretsList.html', controller: 'listController'});
    $routeProvider.when('/secretsList/:msg',{templateUrl: 'partials/secretsList.html', controller: 'listController'});
    $routeProvider.when('/login',{templateUrl: 'partials/login.html', controller: 'loginController'});
    $routeProvider.when('/dashboard',{redirectTo:'/dashboard/known'});
    $routeProvider.when('/dashboard/:page',{templateUrl: 'partials/dashboard.html', controller: 'dashboardController'});
    $routeProvider.when('/submit/',{templateUrl: 'partials/submit.html', controller: 'submitController'});
    $routeProvider.when('/submit/:id',{templateUrl: 'partials/submit.html', controller: 'submitController'});
    $routeProvider.otherwise({redirectTo:'/secretsList'});
}]).run(function($rootScope, $window){
    Parse.initialize("fp7oxuptKJ9ysesuXOeV4Ieul8ErSZklVwRslkJW", "HLpukqho21z1LaL7dUrPMRWI0jAu38NqmmL9qIfo");
    $rootScope.currentUser = Parse.User.current();
    $rootScope.logout = function(){
        Parse.User.logOut();
        $rootScope.currentUser = null;
    };
    $rootScope.goBack = function(){
        $window.history.back();
    }
});
