angular.module("bingo.service", []);

angular.module("bingo.directive", []);

angular.module("bingo.filter", []);

var bingo = angular.module("bingo", ["bingo.service", "bingo.directive", "bingo.filter", "ngCookies"]);

bingo.config(["$routeProvider", function($routeProvider) {
        $routeProvider.
            when("/games", {
                templateUrl : "partials/list.html",
                controller : "BingoGameListCtrl"
            }).
            when("/games/:gameId", {
                templateUrl : "partials/game.html",
                controller : "BingoGameCtrl"
            }).
            otherwise({redirectTo: "/games"});
    }
]);

bingo.controller("BingoGameListCtrl", ["$scope", "$cookies", "$location",
    function($scope, angularFire, $cookies, $location) {
        var socket = io.connect();
        
        $scope.games = [];
        
        if(typeof $cookies.bpbId === "undefined" || $cookies.bpbId === '') {
            $scope.userId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });
            $cookies.bpbId = $scope.userId;
        } else {
            $scope.userId = $cookies.bpbId;
        }
        
        
        socket.on("bingoGame", function(bingo) {
           console.log("added the bingo " + bingo.name);
           $scope.games.push(bingo);
           $scope.$apply();
        });
        
        socket.on("cleanBingoList", function() {
            $scope.games = [];
        });
        
        $scope.newName = "";       
        
        $scope.createBingo = function() {
            socket.emit('createBingo', { name: $scope.newName, owner: $scope.userId });
            $scope.newName = "";       
        };
        
        $scope.delete = function(id) {
            socket.emit('deleteBingo', { id: id, user: $scope.userId });
        };
        
        $scope.join = function(id) {
            
        }
    }
]);

bingo.controller("BingoGameCtrl", ["$scope", "$routeParams", "$http", "$cookies",
    function($scope, angularFire, $routeParams, $http, $cookies) {
        $scope.test = "0";
        $scope.gameId = $routeParams.gameId;
        $scope.userId = $cookies.bpbId;
        
        $scope.vote = function(index) {
        };
                
        $scope.isOwner = function() {
        }
    }
]);
