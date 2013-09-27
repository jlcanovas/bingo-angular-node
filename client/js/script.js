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

var socket = io.connect();
        
bingo.controller("BingoGameListCtrl", ["$scope", "$cookies", "$location",
    function($scope, $cookies, $location) {
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
            $scope.$apply();
            console.log("games cleared");
        });
        
        $scope.newName = "";       
        
        $scope.createBingo = function() {
            socket.emit('createBingo', { name: $scope.newName, owner: $scope.userId });
            $scope.newName = "";       
        };
        
        $scope.delete = function(id) {
            socket.emit('deleteBingo', { id: id, user: $scope.userId });
        };
    }
]);

bingo.controller("BingoGameCtrl", ["$scope", "$routeParams", "$http", "$cookies",
    function($scope, $routeParams, $http, $cookies) {
        $scope.test = "0";
        $scope.gameId = $routeParams.gameId;
        $scope.userId = $cookies.bpbId;
        $scope.votes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        
        $scope.join = function() {
            socket.emit('joinBingo', { game: $scope.gameId, user: $scope.userId } , function(data) {
                $scope.votes = data; 
            });
        };
        
        socket.on("cellVoted", function(data) {
           $scope.votes[data.cell]++;
           $scope.$apply();
        });
        
        $http.get('json/bingo_en.json').success(function(data) {
            $scope.bingoTable = data;
        });
        
        $scope.vote = function(index) {
            console.log("voting for " + index),
            socket.emit('voteCell', { game: $scope.gameId, cell: index, user: $scope.userId });
        };
                
        $scope.isOwner = function() {
            
        }
    }
]);
