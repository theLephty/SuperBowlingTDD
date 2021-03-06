/*globals angular, console */

"use strict";

var app = angular.module('bowlApp', []);

var nRolls = 21,
    nFrames = 10,
    nRollsPerFrame = 2,
    nRollsLastFrame = 3,
    aButtonText = [["Noooo!", 0], ["One", 1], ["Two", 2], ["Three", 3], ["Four", 4], ["Five", 5], ["Six", 6], ["Seven", 7], ["Eight", 8], ["Nine", 9], ["Tacos!", 10]];

function blankArray(nLength, nFiller) {
    var aNegative = [];
    for (var i = 0; i < nLength; i++) {
        aNegative.push(nFiller);
    }
    return aNegative;
}

function createButtons(aIn) {
    var aTemp = [];
    for (var i = 0; i < aIn.length; i++) {
        aTemp.push({
            nVal: aButtonText[i][1],
            sName: aButtonText[i][0]
        });

    }
    return aTemp;
}

function createWorld() {
    var oWorld = {
        hideForm: false,
        nPlayers: function () {
            return this.aPlayers.length;
        },
        aPlayers: [],
        nRPF: nRollsPerFrame,
        nRLF: nRollsLastFrame,
        aButtonInfo: createButtons(aButtonText)
    };
    return oWorld;
}

var theWorld = createWorld();

//borrowed shuffle code, haven't followed it's logic, seems legit
function shuffle(o) {
    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}



app.controller('GameController', ['$scope', function ($scope) {

    this.labelFrame = function (player, j) {
        if (j === 9) {
            return "10th Frame";
        } else if (player.scorecard[(j * 2)] === -1 && player.scorecard[(j * 2) + 1] === -1) {
            return "empty";
        } else if (player.scorecard[(j * 2) + 1] === "/") {
            return "spare";
        } else if (player.scorecard[(j * 2) + 1] === "X") {
            return "strike";
        } else if (player.scorecard[(j * 2)] >= 0 && player.scorecard[(j * 2 + 1)] >= 0) {
            return "normal";
        }
    };

    this.scoreFrame = function (player, j) {
        if (player.frameLabel[j] === "strike" && player.frameLabel[j + 1] === "strike" && player.frameLabel[j + 2] === "strike") {
            return 30;
        } else if (player.frameLabel[j] === "strike" && player.frameLabel[j + 1] === "strike" && player.frameLabel[j + 2] === "spare") {
            return (20 + player.scorecard[(j * 2 + 4)]);
        } else if (player.frameLabel[j] === "strike" && player.frameLabel[j + 1] === "strike" && player.frameLabel[j + 2] !== "empty") {
            return (20 + player.scorecard[(j * 2 + 4)]);
        } else if (player.frameLabel[j] === "strike" && player.frameLabel[j + 1] === "spare") {
            return 20;
        } else if (player.frameLabel[j] === "strike" && player.frameLabel[j + 1] === "normal") {
            return 10 + player.scorecard[(j * 2 + 2)] + player.scorecard[(j * 2 + 2)];
        } else if (player.frameLabel[j] === "spare" && player.frameLabel[j + 1] === "strike") {
            return 20;
        } else if (player.frameLabel[j] === "spare" && player.frameLabel[j + 1] !== "empty") {
            return 10 + player.scorecard[(j * 2 + 2)];
        } else if (player.frameLabel[j] === "normal") {
            return player.rollcard[(j * 2)] + player.scorecard[(j * 2 + 1)];
        }
    };



    this.updateFrameScore = function () {

        for (var i = 0; i < theWorld.nPlayers(); i++) {
            for (var j = 0; j < theWorld.aPlayers[i].frameScore.length; j++) {
                theWorld.aPlayers[i].frameLabel[j] = this.labelFrame(theWorld.aPlayers[i], j);
                /*                theWorld.aPlayers[i].frameScore[j] = this.scoreFrame(theWorld.aPlayers[i], j);*/
            }
        }

        for (var i = 0; i < theWorld.nPlayers(); i++) {
            for (var j = 0; j < theWorld.aPlayers[i].frameScore.length; j++) {
                /*                theWorld.aPlayers[i].frameLabel[j] = this.labelFrame(theWorld.aPlayers[i], j);*/
                theWorld.aPlayers[i].frameScore[j] = this.scoreFrame(theWorld.aPlayers[i], j);
            }
        }
    };


    this.displayValue = function (value) {
        if (value > -1 || value === "X" || value === "/") {
            return true;
        } else {
            return false;
        }
    };

    $scope.theWorld = theWorld;

    var nFrame = 0;
    var nTurn = 0;
    $scope.nRoll = 0;

    this.deleteAll = function () {
        theWorld.aPlayers = [];
    };

    this.userPush = function (user, players) {
        players.push(angular.copy(user));
        $scope.user = {};
    };

    this.startDisabled = function () {
        if (theWorld.nPlayers()) {
            return false;
        } else {
            return true;
        }
    };

    this.nextPlayer = function () {
        if (nTurn >= theWorld.nPlayers()) {
            nTurn = 0;
            nFrame += 1;
        }
        if (theWorld.aPlayers[nTurn].frames[nFrame] === -1) {
            /*            alert(theWorld.aPlayers[nTurn].name + " you are up!");*/

        } else {
            nTurn += 1;
            this.nextPlayer();
        }
        /*      loop through player Array (find player who has frames remaining)
        if frame not done, request/accept roll value
              calculate frame (2 rolls or 10 pins)
              populate players frame data*/
        /*        for (var i = 0; i < theWorld.nPlayers(); i++) {


                }*/
    };



    this.startGame = function () {
        for (var i = 0; i < theWorld.nPlayers(); i++) {
            var player = theWorld.aPlayers[i];
            player.rollcard = blankArray(nRolls, -1);
            player.scorecard = blankArray(nRolls, -1);
            player.frames = blankArray(nFrames, -1);
            player.frameScore = blankArray(nFrames, -1);
            player.frameLabel = blankArray(nFrames, -1);
            player.inputOrder = i + 1;
            player.nRollNumber = 0;

        }
        shuffle(theWorld.aPlayers);
        $scope.isHidden = true;
        this.nextPlayer();
    };

    $scope.isHidden = false;



    this.writeRolls = function (pins) {

        var currentRoll = theWorld.aPlayers[nTurn].nRollNumber;
        var currentPlayer = theWorld.aPlayers[nTurn];



        if ($scope.nRoll < 2 && nFrame < 9) {
            if (pins === 10) {
                if ((currentPlayer.nRollNumber + 1) % 2) {
                    currentPlayer.scorecard[currentRoll] = -2;
                    currentPlayer.scorecard[currentRoll + 1] = "X";
                    currentPlayer.rollcard[currentRoll] = -2;
                    currentPlayer.rollcard[currentRoll + 1] = 10;
                    $scope.nRoll += 1;
                    theWorld.aPlayers[nTurn].nRollNumber += 1;
                } else {
                    currentPlayer.scorecard[currentRoll] = "/";
                    currentPlayer.rollcard[currentRoll] = 10 - currentPlayer.rollcard[currentRoll - 1];
                }
            } else if (((currentPlayer.nRollNumber) % 2) && currentPlayer.rollcard[currentRoll - 1] + pins >= 10) {
                currentPlayer.scorecard[currentRoll] = "/";
                currentPlayer.rollcard[currentRoll] = 10 - currentPlayer.rollcard[currentRoll - 1];
            } else {
                currentPlayer.rollcard[currentRoll] = pins;
                currentPlayer.scorecard[currentRoll] = pins;

            }

            $scope.nRoll += 1;
            theWorld.aPlayers[nTurn].nRollNumber += 1;
        } else if ($scope.nRoll < 2 && nFrame === 9) {

            if (currentRoll === 18) {
                if (pins === 10) {
                    currentPlayer.scorecard[currentRoll] = "X";
                    currentPlayer.rollcard[currentRoll] = 10;
                    $scope.nRoll -= 1;
                } else {
                    currentPlayer.rollcard[currentRoll] = pins;
                    currentPlayer.scorecard[currentRoll] = pins;
                }

            } else if (currentRoll === 19) {
                if (pins === 10 && currentPlayer.rollcard[currentRoll - 1] === 10) {
                    currentPlayer.scorecard[currentRoll] = "X";
                    currentPlayer.rollcard[currentRoll] = 10;
                    $scope.nRoll -= 1;
                } else if (currentPlayer.rollcard[currentRoll - 1] + pins >= 10) {
                    currentPlayer.scorecard[currentRoll] = "/";
                    currentPlayer.rollcard[currentRoll] = 10 - currentPlayer.rollcard[currentRoll - 1];
                    $scope.nRoll -= 1;
                } else {
                    currentPlayer.rollcard[currentRoll] = pins;
                    currentPlayer.scorecard[currentRoll] = pins;
                }
            } else if (currentRoll === 20) {
                if (pins === 10 && currentPlayer.rollcard[currentRoll - 1] + currentPlayer.rollcard[currentRoll - 2] >= 20) {
                    currentPlayer.scorecard[currentRoll] = "X";
                    currentPlayer.rollcard[currentRoll] = 10;

                } else if (pins === 10 && currentPlayer.scorecard[currentRoll - 1] == "/") {
                    currentPlayer.scorecard[currentRoll] = "X";
                    currentPlayer.rollcard[currentRoll] = 10;
                } else if (pins === 10 && currentPlayer.rollcard[currentRoll - 1] < 10) {
                    currentPlayer.scorecard[currentRoll] = "/";
                    currentPlayer.rollcard[currentRoll] = 10 - currentPlayer.rollcard[currentRoll - 1];

                } else {
                    currentPlayer.rollcard[currentRoll] = pins;
                    currentPlayer.scorecard[currentRoll] = pins;
                }
            }

            $scope.nRoll += 1;
            theWorld.aPlayers[nTurn].nRollNumber += 1;
        } else {
            $scope.nRoll = 0;
            theWorld.aPlayers[nTurn].frames[nFrame] = "done";
            this.nextPlayer();
            this.writeRolls(pins);

        }
        this.updateFrameScore();
    };



    /*    $scope.writeRolls = function (value) {
            for (var i = 0; i < $scope.theWorld.aPlayers[0].rollcard.length; i++) {
                if ($scope.theWorld.aPlayers[0].rollcard[i] === -1) {
                    if (value === 10) {
                        if (i >= $scope.theWorld.aPlayers[0].rollcard.length - 3) {
                            $scope.theWorld.aPlayers[0].scorecard[i] = "X";

                            $scope.theWorld.aPlayers[0].rollcard[i] = 10;
                            break;
                        } else if ((i + 1) % 2) {

                            $scope.theWorld.aPlayers[0].scorecard[i] = -2;
                            $scope.theWorld.aPlayers[0].scorecard[i + 1] = "X";
                            $scope.theWorld.aPlayers[0].rollcard[i] = -2;
                            $scope.theWorld.aPlayers[0].rollcard[i + 1] = 10;
                            break;
                        } else {
                            $scope.theWorld.aPlayers[0].scorecard[i] = "/";
                            $scope.theWorld.aPlayers[0].rollcard[i] = 10;
                        }
                    } else {
                        $scope.theWorld.aPlayers[0].rollcard[i] = value;
                        $scope.theWorld.aPlayers[0].scorecard[i] = value;
                        break;
                    }
                    break;
                }



            }
        };*/

    $scope.advanceTurn = function () {

    };

            }]);

/*app.controller('bowlController', ['$scope', function ($scope) {


            }]);*/

/*    this.scoreGo = function (player, j) {
        if (this.spareReady(player, j) && player.scorecard[(j * 2) + 1] === "/") {
            if (player.scorecard[(j * 2) + 2] === -2) {
                return 20;
            } else {
                return player.rollcard[(j * 2) + 2] + 10;
            }
        } else if (this.strikeReady(player, j) && player.scorecard[(j * 2) + 1] === "X") {
            if (player.scorecard[(j * 2) + 2] === -2) {
                return 20 + player.rollcard[(j * 2) + 3];
            } else {
                return player.rollcard[(j * 2) + 2] + player.rollcard[(j * 2) + 3] + 10;
            }
        } else if (this.normalReady(player, j)) {
            return player.rollcard[(j * 2)] + player.rollcard[(j * 2 + 1)];
        }
    };



    this.spareReady = function (player, j) {
        if (player.scorecard[(j * 2) + 2] !== -1) {
            return true;
        } else {
            return false;
        }

    };

    this.strikeReady = function (player, j) {
        if (player.scorecard[(j * 2) + 2] !== -1 && player.scorecard[(j * 2) + 3] !== -1) {
            return true;
        } else {
            return false;
        }

    };

    this.normalReady = function (player, j) {
        if (player.scorecard[(j * 2) + 1] !== -1) {
            return true;
        } else {
            return false;
        }

    };*/