/**
 * Created by Jonatan on 1/12/2015.
 */

(function () {
    "use strict";

    var userController = function ($scope, $location, userService, shareService, $routeParams) {

        $scope.init = function () {
            var userid = $routeParams.param;
            userService.searchUserFromId(userid).then(userFoundWithId);

            shareService.getSharesByUserId(userid, function (err, shares) {
                if (!err) {
                    $scope.shareFoundWithUserId = shares;
                    console.log($scope.shareFoundWithUserId);
                    var feelingImages = ["depressed", "sad", "common", "happy", "excited"];
                    angular.forEach(shares, function (share) {
                        share.moodImageSource = "./assets/" + feelingImages[giveFeelingsImageArrayNumber(share)] + ".png";
                        $scope.marker = new google.maps.Marker({
                            position: {lat: share.lat, lng: share.lng},
                            map: $scope.map,
                            icon: share.moodImageSource
                        });
                    });
                } else {
                    console.log("> error in shareService: " + err);
                }
            });
        };

        var userFoundWithId = function (res) {
            $scope.userfoundwithid = res;

            if (res.lat !== undefined && res.lat !== undefined) {
                $scope.map.setCenter(new google.maps.LatLng(res.lat, res.lng));
                if ($scope.marker !== undefined) {
                    $scope.marker.setMap(null); //verwijdert alle markers eerst
                }
                $scope.marker = new google.maps.Marker({
                    position: {lat: res.lat, lng: res.lng},
                    map: $scope.map,
                    icon: $scope.image
                });
            }
        };

        var giveFeelingsImageArrayNumber = function (share) {
            if (share.mood > 80) {
                return 4;
            }
            else {
                return Math.round(share.mood / 20);
            }
        };
    };

    angular.module("geofeelings").controller("userController", ["$scope", "$location", "userService", "shareService", "$routeParams", userController]);
})
();