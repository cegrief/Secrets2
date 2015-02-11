'use strict';

angular.module('secrets', [
    'ngRoute',
    'ngCookies',
    'secrets.services',
    'secrets.directives',
    'secrets.controllers',
    'secrets.filters'
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
}]).run(function($rootScope, $window, $cookieStore){
    var APP_ID = 'fp7oxuptKJ9ysesuXOeV4Ieul8ErSZklVwRslkJW';
    var MASTER_KEY = 'HLpukqho21z1LaL7dUrPMRWI0jAu38NqmmL9qIfo';
    Parse.initialize(APP_ID, MASTER_KEY);

    if($cookieStore.get('user')){
        $rootScope.currentUser = $cookieStore.get('user');
    }

    $rootScope.logout = function(){
        $rootScope.currentUser = null;
        $cookieStore.remove('user');
    };

    $rootScope.goBack = function(){
        $window.history.back();
    }
});
