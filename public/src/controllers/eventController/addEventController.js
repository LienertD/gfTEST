/**
 * Created by Jonatan on 30/12/2015.
 */

(function () {
    "use strict";

    var addEventController = function ($scope, $location, eventService, profileService) {
        $scope.newEvent = {};
        $scope.errorAddEvent = null;

        profileService.getUser(function(err, user) {
            if(!err) {
                if(user.redirect) {
                    $location.path(user.redirect);
                } else {
                    $scope.newEvent.authorid = user.id;
                }
            } else {
                throw new ProfileServiceException(err);
            }
        });

        $scope.createEvent = function() {
            $scope.newEvent.address = makeAddress($scope.newEvent.address1, $scope.newEvent.address2);
            eventService.postEvent($scope.newEvent, function (err, data) {
                if(!err) {
                    if(data.redirect) {
                        $location.path(data.redirect);
                    } else if(data.error) {
                        $scope.errorAddEvent = data.error;
                    } else {
                        $location.path("/event/" + data.event._id);
                    }
                } else {
                    if(err === "ZERO_RESULTS") {
                        $scope.errorAddEvent = "No address found! Street & Number and Zip & City are required! Make sure ther is a space between your input and no ,";
                    } else {
                        $scope.errorAddEvent = "Something went wrong, try again later!";
                    }
                }
            });
        };

        var makeAddress = function (address1, address2) {
            return address1 + "," + address2;
        };
    };

    angular.module("geofeelings").controller("addEventController", ["$scope", "$location", "eventService", "profileService", addEventController]);
})();