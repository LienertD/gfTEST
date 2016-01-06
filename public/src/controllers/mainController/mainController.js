/**
 * Created by Jonatan on 21/11/2015.
 */

(function () {
    "use strict";

    var mainController = function ($scope, googleMapsService, shareService, profileService, $location, $routeParams) {


        var socket = io.connect("http://localhost:3001");
        $scope.chatMessages = []; 


        $scope.init = function () {
            profileService.getUser(function (err, userData) { //zend je id naar de server om te zeggen dat je er bent en welk socketid je hebt
                if (!err) {
                    if (userData.redirect) {
                        //userid niet logged in, nog toevoegen dat hij zen id stuurt bij inloggen!
                    } else {
                        socket.emit("loginMessage", userData.id);
                    }
                } else {
                    console.log("error while getting user: " + err);
                }
            });
        };

        socket.on("sharePostedNotify", function (sharedata) {
            googleMapsService.showOnePostMarker(sharedata);
        });

        socket.on("chatMessage", function (data) { //ontvangen bericht
            $scope.chatMessages.push({text: data.text, sender: data.senderUsername, cssClass: "other"}); //pushen naar scope om chatbubble te tonen
            $scope.$apply(); //dit zorgt ervoor dat de chatbubbles er direct komen, niet verplaatsen!
        });

        $scope.sendChatMsgToServer = function () { //verzenden bericht
            var inputtext = document.getElementById("inputTextChat");
            if (inputtext.value !== "") {
                profileService.getUser(function (err, userData) {
                    if (!err) {
                        if (userData.redirect) { //user is nog niet ingelogd bij het chatten
                            shareVarsBetweenCtrl.setExtraLoginInfo("You need to be logged in to chat.");
                            $location.path(userData.redirect);
                        } else {

                            var messageObj = {
                                text: inputtext.value,
                                sender: userData.id,
                                receiver: $routeParams.param,
                                senderUsername: userData.username
                            };
                            socket.emit("chatMessage", messageObj);
                            $scope.chatMessages.push({
                                text: inputtext.value,
                                sender: userData.username,
                                cssClass: "me"
                            }); //pushen naar scope om chatbubble te tonen
                            inputtext.value = "";
                        }
                    } else {
                        console.log("error while getting user: " + err);
                    }
                });
            }
        };

        //chat einde

        shareService.getAllShares(function (err, shares) {
            if (!err) {
                googleMapsService.showLocationOnMap();
                $scope.shares = shares;
                $scope.timelapse = 0;
                $scope.timestamp = "last hour";
            } else {
                throw new ShareServiceException(err);
            }
        });

        $scope.$watch("timelapse", function() {
            if($scope.timelapse == 100) {
                $scope.timestamp = "All time";
                googleMapsService.removeMarkers();
                googleMapsService.showAllMarkers(filterSharesOnTime("all"));
            } else if($scope.timelapse == 80) {
                $scope.timestamp = "Last year";
                googleMapsService.removeMarkers();
                googleMapsService.showAllMarkers(filterSharesOnTime("year"));
            } else if($scope.timelapse == 60) {
                $scope.timestamp = "Last month";
                googleMapsService.removeMarkers();
                googleMapsService.showAllMarkers(filterSharesOnTime("month"));
            } else if($scope.timelapse == 40) {
                $scope.timestamp = "Last week";
                googleMapsService.removeMarkers();
                googleMapsService.showAllMarkers(filterSharesOnTime("week"));
            } else if($scope.timelapse == 20) {
                $scope.timestamp = "Last day";
                googleMapsService.removeMarkers();
                googleMapsService.showAllMarkers(filterSharesOnTime("day"));
            } else if($scope.timelapse === 0) {
                $scope.timestamp = "last hour";
                googleMapsService.removeMarkers();
                googleMapsService.showAllMarkers(filterSharesOnTime("hour"));
            }
        });

        var filterSharesOnTime = function(time) {
            var shares = [];

            switch (time) {
                case "all":
                    return $scope.shares;
                case "year":
                    angular.forEach($scope.shares, function(share) {
                        console.log(new Date().getYear() - new Date(share.time).getYear());
                        if((new Date().getTime() - new Date(share.time).getTime()) <= ((360000 * 24) * 365))
                            shares.push(share);
                    });
                    return shares;
                case "month":
                    angular.forEach($scope.shares, function(share) {
                        if((new Date().getTime() - new Date(share.time).getTime()) <= ((360000 * 24) * 31))
                            shares.push(share);
                    });
                    return shares;
                case "week":
                    angular.forEach($scope.shares, function(share) {
                        if((new Date().getTime() - new Date(share.time).getTime()) <= ((360000 * 24) * 7))
                            shares.push(share);
                    });
                    return shares;
                case "day":
                    angular.forEach($scope.shares, function(share) {
                        if((new Date().getTime() - new Date(share.time).getTime()) <= (360000 * 24))
                            shares.push(share);
                    });
                    return shares;
                case "hour":
                    angular.forEach($scope.shares, function(share) {
                        if((new Date().getTime() - new Date(share.time).getTime()) <= 360000)
                            shares.push(share);
                    });
                    return shares;
            }
        };
    };
    angular.module("geofeelings").controller("mainController", ["$scope", "googleMapsService", "shareService", "profileService", "$location", "$routeParams", mainController]);
})();