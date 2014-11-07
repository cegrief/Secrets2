'use strict';

/* Directives */


angular.module('secrets.directives', [])
    .directive('tabDir', function(){
        var linkFn = function (scope, element) {
            $(element).on("click", function (event){
                event.preventDefault();
            });
        };

        return {
            restrict: 'A',
            link: linkFn
        }
    });
