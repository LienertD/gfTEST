/**
 * Created by Jonatan on 4/12/2015.
 */


(function () {
    "use strict";

    var eventController = function ($scope, $location, $sce, $routeParams, eventService, shareService, profileService) {
        var eventid = $routeParams.param;
        $scope.newEvent = {};

        eventService.getEventById(eventid, function(err, event) {
            if(!err) {
                $scope.event = event;
                $scope.event.mood = 50;
                $scope.event.eventid = event.id;
                $scope.event.address1 = splitAddress($scope.event.address, 0);
                $scope.event.address2 = splitAddress($scope.event.address, 1);

                if(!$scope.event.eventimage) {
                    $scope.event.eventimage = "http://student.howest.be/jonatan.michiels/geofeelings/assets/event.png";
                }

                if($scope.event.authorid) {
                    profileService.getUser(function(err, user) {
                        if(!err) {
                            $scope.event.userid = user.id;

                            if(user.redirect) {
                                $location.path(user.redirect);
                            } else {
                                return $scope.event.authorid === user.id;
                            }
                        } else {
                            throw new ProfileServiceException(err);
                        }
                    });
                } else {
                    $scope.event.isAuthor = false;
                }

                shareService.getSharesByEventId(event.id, function(err, shares) {
                    if(!err) {
                        if(shares.redirect) {
                            $location.path(shares.redirect);
                        } else {
                            if(shares.length > 0) {
                                $scope.sharesforevent = shares;
                            } else {
                                $scope.noSharesForEvent = "<div>No shares for this event.</div>";
                            }
                        }
                    } else {
                        throw new ShareServiceException(err);
                    }
                });
            } else {
                throw new EventServiceException(err);
            }
        });

        $scope.renderHtml = function(html) {
            return $sce.trustAsHtml(html);
        };

        $scope.postShare = function() {
            $scope.event.time = new Date();
            shareService.postShareAsync($scope.event, function(err, data) {
                if(!err) {
                    if(data.redirect) {
                        $location.path(data.redirect);
                    } else if(data.error) {
                        $scope.error = data.error;
                    } else {
                        $scope.event = data;
                    }
                } else {
                    if(err === "ZERO_RESULTS") {
                        $scope.error = "No address found!";
                    } else {
                        $scope.error = "Something went wrong, try again later!";
                    }
                }
            });
        };

        $scope.updateEvent = function() {
            $scope.event.address = makeAddress($scope.event.address1, $scope.event.address2);
            eventService.updateEvent($scope.event, function(err, data) {
                if(!err) {
                    if(data.redirect) {
                        $location.path(data.redirect);
                    } else if(data.error) {
                        $scope.errorEvent = data.error;
                    } else {
                        $scope.event = data;
                        $scope.event.address1 = splitAddress($scope.event.address, 0);
                        $scope.event.address2 = splitAddress($scope.event.address, 1);
                    }
                } else {
                    if(err === "ZERO_RESULTS") {
                        $scope.errorEvent = "No address found! Street & Number and Zip & City are required! Make sure ther is a space between your input and no komma(,)";
                    } else {
                        $scope.errorEvent = "Something went wrong, try again later!";
                    }
                }
            });
        };

        $scope.convertMood = function(mood) {
            if(mood > 80) {
                return "excited";
            } else if(mood > 60) {
                return "happy";
            } else if(mood > 40) {
                return "common";
            } else if (mood > 20) {
                return "sad";
            } else {
                return "depressive";
            }
        };

        var splitAddress = function (address, part) {
            var split = address.split(",");
            return split[part];
        };

        var makeAddress = function (address1, address2) {
            return address1 + "," + address2;
        };
    };

    angular.module("geofeelings").controller("eventController", ["$scope", "$location", "$sce", "$routeParams", "eventService", "shareService", "profileService", eventController]);
})();