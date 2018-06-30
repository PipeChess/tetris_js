
var tetris = {
    gmatrix: [],
    size_height: 22,
    size_width: 10,
    speed: 1,
    gameInterval: null,
    currentBlock: null,
    upcomingBlock: null,
    initialSpeed: 1000,
    enabledCommands: false,
    totalPoints: 0,
    gamePaused: false,
    canvas: null,
    ctx: null,
    blocks: [],
    playArea: null,
    interacted: false,
    play: function (playArea) {
        this.playArea = document.getElementById(playArea);
        this.createHTML();
        this.initialize();
    },
    initialize: function () {
        this.gmatrix = [];
        this.size_height = 22;
        this.size_width = 10;
        this.speed = 1;
        this.gameInterval = null;
        this.currentBlock = null;
        this.upcomingBlock = null;
        this.initialSpeed = 1000;
        this.enabledCommands = false;
        this.gamePaused = false;
        this.totalPoints = 0;
        this.currentLevel = 0;
        this.canvas = document.getElementById("tetris_canvas");
        this.ctx = this.canvas.getContext("2d");
        this.blocks = [{
                coords: [[-2, 4], [-2, 5], [-1, 4], [-1, 5]],
                color: 'yellow',
                pivot: null,
                name: 'O-block'
            }, {
                coords: [[-3, 4], [-2, 4], [-1, 4], [-1, 3]],
                color: 'blue',
                pivot: 1,
                name: 'J-block'
            }, {
                coords: [[-3, 4], [-2, 4], [-1, 4], [-1, 5]],
                color: 'orange',
                pivot: 1,
                name: 'L-Block'
            }, {
                coords: [[-3, 4], [-2, 4], [-2, 5], [-1, 5]],
                color: 'green',
                pivot: 1,
                name: 'S-Block'
            }, {
                coords: [[-3, 5], [-2, 5], [-2, 4], [-1, 4]],
                color: 'red',
                pivot: 1,
                name: 'Z-Block'
            }, {
                coords: [[-4, 4], [-3, 4], [-2, 4], [-1, 4]],
                color: 'cyan',
                pivot: 1,
                name: 'I-Block'
            }, {
                coords: [[-2, 5], [-1, 4], [-1, 5], [-1, 6]],
                color: 'purple',
                pivot: 2,
                name: 'T-Block'
            }];
    },
    createHTML: function () {
        this.playArea.style.textAlign = "center";
        //set body
        document.body.style.backgroundColor = "#123456";
        document.body.style.fontFamily = "Arial";
        document.body.style.color = "white";
        document.body.setAttribute('onkeydown', 'tetris.keyPress(event);');

        //set play area style
        document.getElementById("playArea").style.margin = "auto";
        document.getElementById("playArea").style.width = "30%";
        document.getElementById("playArea").style.padding = "10px";
        document.getElementById("playArea").style.border = "1px dashed beige";

        //Logo
        var logo = document.createElement("span");
        logo.id = "logo";
        logo.style.fontFamily = "Verdana";
        logo.style.fontSize = "40px";
        var logoText = document.createTextNode("TETRIS js");
        logo.appendChild(logoText);
        this.playArea.appendChild(logo);
        this.playArea.innerHTML += "<br />";

        //Score display
        var score = document.createElement("span");
        score.id = 'score';
        var scoreText = document.createTextNode("0 points");
        score.appendChild(scoreText);
        score.style.fontSize = "10px";
        score.style.fontWeight = "bold";
        score.style.padding = "10px";
        this.playArea.appendChild(score);

        //Level display
        var level = document.createElement("span");
        level.id = 'level';
        var levelText = document.createTextNode("level 1");
        level.appendChild(levelText);
        level.style.fontSize = "10px";
        level.style.fontWeight = "bold";
        level.style.padding = "10px";
        this.playArea.appendChild(level);

        //Info display
        var info = document.createElement("span");
        info.id = 'info';
        var infoText = document.createTextNode("");
        info.appendChild(infoText);
        info.style.fontSize = "10px";
        info.style.fontWeight = "bold";
        info.style.padding = "10px";
        this.playArea.appendChild(info);
        this.playArea.innerHTML += "<br />";

        //Buttons display
        var btn = document.createElement("button");
        btn.id = 'startGameBtn';
        btn.setAttribute('onclick', 'tetris.startRoutine(true);');
        var btnText = document.createTextNode("new game");
        btn.appendChild(btnText);
        btn.style.borderRadius = "5px";
        btn.style.fontSize = "11px";
        this.playArea.appendChild(btn);

        btn = document.createElement("button");
        btn.id = 'endGameBtn';
        btn.setAttribute('onclick', 'tetris.endGame(false);');
        btnText = document.createTextNode("end game");
        btn.appendChild(btnText);
        btn.style.borderRadius = "5px";
        btn.style.fontSize = "11px";
        this.playArea.appendChild(btn);

        btn = document.createElement("button");
        btn.id = 'pauseGameBtn';
        btn.setAttribute('onclick', 'tetris.pauseGame();');
        btnText = document.createTextNode("pause game");
        btn.appendChild(btnText);
        btn.style.borderRadius = "5px";
        btn.style.fontSize = "11px";
        this.playArea.appendChild(btn);

        this.playArea.innerHTML += "<br />";
        this.playArea.innerHTML += "<br />";

        var canvas = document.createElement("canvas");
        canvas.id = 'tetris_canvas';
        canvas.height = "440";
        canvas.width = "200";
        this.playArea.appendChild(canvas);

        this.playArea.innerHTML += "<br />";

        //Level display
        var gameMessage = document.createElement("span");
        gameMessage.id = 'gameMessage';
        this.playArea.appendChild(gameMessage);
    },
    /**
     * Start routine to initialize game matrix, interval & commands.
     * Generates a new block & triggers update event
     * @param boolean newgame
     * @returns void
     */
    startRoutine: function (newgame) {
        this.interacted = true;
        if (newgame && this.gameInterval === null) {
            this.enabledCommands = true;
            this.initializeGameMatrix();

            var that = this;
            this.gameInterval = setInterval(function () {
                that.updateBlockPosition('down');
            }, this.initialSpeed);
        }
        this.newRandomBlock();
        this.updateBlockPosition('down');
    },
    /**
     * Ends game interval resets game matrix disables commands
     * @param boolean lost
     * @returns viod
     */
    endGame: function (lost) {
        clearInterval(this.gameInterval);
        this.gameInterval = null;
        this.initializeGameMatrix();
        this.drawDisplay();
        this.enabledCommands = false;
        if (lost) {
            this.ctx.beginPath();
            this.ctx.font = "30px Arial";
            this.ctx.fillStyle = "blue";
            this.ctx.textAlign = "center";
            this.ctx.fillText("YOU LOST", this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = "15px Arial";
            this.ctx.fillStyle = "blue";
            this.ctx.textAlign = "center";
            this.ctx.fillText(this.totalPoints + " points", this.canvas.width / 2, this.canvas.height / 2 + 40);
        } else {
            this.ctx.beginPath();
            this.ctx.font = "20px Arial";
            this.ctx.fillStyle = "blue";
            this.ctx.textAlign = "center";
            this.ctx.fillText("Don't chicken out", this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.fillText("Try again!", this.canvas.width / 2, this.canvas.height / 2 + 20);
        }
    },
    /**
     * Either pauses or un-pauses game. Blocks or allows commands, either clears
     * or reinitiates game interval
     * @returns void
     */
    pauseGame: function () {
        if (this.gamePaused) {
            this.enabledCommands = true;

            var that = this;
            this.gameInterval = setInterval(function () {
                that.updateBlockPosition('down');
            }, this.initialSpeed);
            this.gamePaused = false;
            document.getElementById("pauseGameBtn").innerHTML = "pause game";
        } else {
            this.gamePaused = true;
            clearInterval(this.gameInterval);
            this.gameInterval = null;
            this.enabledCommands = false;
            document.getElementById("pauseGameBtn").innerHTML = "resume";
        }
    },
    /**
     * Based on direction either moves the block left, right, down or performs
     * a 2D rotation & and updates the current block with the new coordinates
     * @param string dir
     * @returns void
     */
    updateBlockPosition: function (dir, clockwise) {
        var tmpBlock = JSON.parse(JSON.stringify(this.currentBlock));
        for (var i = 0; i < tmpBlock.coords.length; i++) {
            switch (dir) {
                case 'down':
                    tmpBlock.coords[i][0] += 1;
                    break;
                case 'left':
                    tmpBlock.coords[i][1] -= 1;
                    break;
                case 'right':
                    tmpBlock.coords[i][1] += 1;
                    break;
                case 'turn':
                    if (tmpBlock.pivot == null) {
                        break;
                    }
                    var angle = clockwise ? -80 : 80;
                    for (var i = 0; i < tmpBlock.coords.length; i++) {
                        if (i != tmpBlock.pivot) {
                            var op_x = tmpBlock.coords[i][1];
                            var op_y = tmpBlock.coords[i][0];
                            var c_x = tmpBlock.coords[tmpBlock.pivot][1];
                            var c_y = tmpBlock.coords[tmpBlock.pivot][0];
                            var px = Math.round(Math.cos(angle) * (op_x - c_x) - Math.sin(angle) * (op_y - c_y) + c_x);
                            var py = Math.round(Math.sin(angle) * (op_x - c_x) - Math.cos(angle) * (op_y - c_y) + c_y);
                            tmpBlock.coords[i][1] = px;
                            tmpBlock.coords[i][0] = py;
                        }
                    }
                    break;
            }
        }
        this.checkBlock(tmpBlock, dir);
    },
    /**
     * Routine to check if rows are completed, removing them and creating new top
     * row, after calculating all completed rows calls score. 
     * @returns void
     */
    checkGameMatrixForRowCompletion: function () {
        var rowsRemoved = 0;
        for (var i = 0; i < this.gmatrix.length; i++) {
            var row = true;
            for (var j = 0; j < this.gmatrix[i].length; j++) {
                if (typeof this.gmatrix[i][j] !== 'object') {
                    row = false;
                }
            }
            if (row) {
                for (var m = i; m >= 0; m--) {
                    if (m == 0) {
                        for (var n = 0; n < this.gmatrix[0].length; n++) {
                            this.gmatrix[0][n] = false;
                        }
                    } else {
                        this.gmatrix[m] = JSON.parse(JSON.stringify(this.gmatrix[m - 1]));
                    }
                }
                rowsRemoved++;
            }
        }
        this.score(rowsRemoved);
    },
    /**
     * Based on user input, decides if tmp block either exceeds game are boundaries
     * or overlaps with other placed blocks. If so the move will be ignore, otherwise
     * the block gets either placed or if after placement the currentblock is not totally
     * within game area, the game will be ended.
     * @param blockObject tmpBlock
     * @param direction dir
     * @returns void
     */
    checkBlock: function (tmpBlock, dir) {
        for (var i = 0; i < tmpBlock.coords.length; i++) {
            if (tmpBlock.coords[i][0] >= 0) {
                //reached left or right edge of game area
                if (tmpBlock.coords[i][1] < 0 || tmpBlock.coords[i][1] > this.size_width - 1) {
                    return;
                }
                //reached bottom of game area
                if (tmpBlock.coords[i][0] > this.size_height - 1) {
                    this.setCurrentBlockFixed();
                    return;
                }
                //collision with other blocks
                if (typeof this.gmatrix[tmpBlock.coords[i][0]][tmpBlock.coords[i][1]] === 'object') {
                    if (dir === 'down') {
                        for (var m = 0; m < this.currentBlock.coords.length; m++) {
                            for (var n = 0; n < this.currentBlock.coords[m].length; n++) {
                                if (this.currentBlock.coords[m][0] < 0) {
                                    this.endGame(true);
                                    return;
                                }
                            }
                        }
                        this.setCurrentBlockFixed();
                    }
                    return;
                }
            }
        }
        this.currentBlock = tmpBlock;
        this.setBlock();
    },
    /**
     * Sets a block fixed by adding it to the game area (display matrix)
     * @returns  void
     */
    setCurrentBlockFixed: function () {
        for (var i = 0; i < this.currentBlock.coords.length; i++) {
            this.gmatrix[this.currentBlock.coords[i][0]][this.currentBlock.coords[i][1]] = this.currentBlock;
        }
        this.checkGameMatrixForRowCompletion();
        this.startRoutine(false);
    },
    /**
     * Calls reset and sets newly updated block on display array if within
     * game area
     * @returns void
     */
    setBlock: function () {
        this.resetGameMatrix();
        for (var i = 0; i < this.currentBlock.coords.length; i++) {
            var x = this.currentBlock.coords[i][0];
            var y = this.currentBlock.coords[i][1];
            if (x >= 0 && y >= 0) {
                this.gmatrix[x][y] = 1;
            }
        }
        this.drawDisplay();
    },
    /**
     * Adds to score if rows where removed. Adjusts the game level based on score
     * 
     * @param int rowAmount
     * @returns void
     */
    score: function (rowAmount) {
        switch (rowAmount) {
            case 1:
                this.totalPoints += 10;
                this.playSound("removed-1");
                break;

            case 2:
                this.totalPoints += 40;
                this.playSound("removed-1");
                break;

            case 3:
                this.totalPoints += 80;
                this.playSound("removed-1");
                break;

            case 4:
                this.totalPoints += 150;
                this.playSound("removed-4");
                break;
        }
        document.getElementById("score").innerHTML = this.totalPoints + " points";

        //todo: handle level & difficulty adjustments
        var speedVal = Math.round(this.totalPoints / 100);
        this.initialSpeed = (speedVal > 1 ? 1000 - (speedVal * 50) : 1000);

        if (this.currentLevel != speedVal + 1) {
            this.currentLevel = (speedVal + 1);
            this.playSound("level-up");
        }
        document.getElementById("level").innerHTML = "level " + this.currentLevel;
    },
    /**
     * Clear the display redraws background, all updated blocks and fills them
     * @returns void
     */
    drawDisplay: function () {
        document.getElementById("info").innerHTML = "next: " + this.upcomingBlock.name;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.beginPath();
        this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "beige";
        this.ctx.fill();
        this.ctx.strokeStyle = "#000";
        this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
        for (var i = 0; i < this.gmatrix.length; i++) {
            for (var j = 0; j < this.gmatrix[i].length; j++) {
                if (this.gmatrix[i][j] !== false) {
                    var color = "";
                    if (this.gmatrix[i][j] === 1) {
                        color = this.currentBlock.color;
                    } else {
                        color = this.gmatrix[i][j].color;
                    }
                    var x = j * 20;
                    var y = i * 20;
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = "#000";
                    this.ctx.moveTo(x, y);
                    this.ctx.lineTo(x + 20, y);
                    this.ctx.moveTo(x + 20, y);
                    this.ctx.lineTo(x + 20, y + 20);
                    this.ctx.moveTo(x + 20, y + 20);
                    this.ctx.lineTo(x, y + 20);
                    this.ctx.moveTo(x, y + 20);
                    this.ctx.lineTo(x, y);
                    //draw borders
                    this.ctx.stroke();
                    //fill color
                    this.ctx.rect(x, y, 20, 20);
                    this.ctx.fillStyle = color;
                    this.ctx.fill();
                }
            }
        }
    },
    /**
     * Resets all no-fixed array positions back to false/empty 
     * @returns void
     */
    resetGameMatrix: function () {
        for (var i = 0; i < this.gmatrix.length; i++) {
            for (var j = 0; j < this.gmatrix[i].length; j++) {
                if (typeof this.gmatrix[i][j] !== 'object') {
                    this.gmatrix[i][j] = false;
                }
            }
        }
    },
    /**
     * Initializes a 22 x 10 array and sets all positons to false/empty
     * @returns void
     */
    initializeGameMatrix: function () {
        this.gmatrix = new Array(this.size_height);
        for (var i = 0; i < this.gmatrix.length; i++) {
            this.gmatrix[i] = new Array(this.size_width);
            for (var j = 0; j < this.gmatrix[i].length; j++) {
                this.gmatrix[i][j] = false;
            }
        }
    },
    /**
     * Command function for movement of blocks
     * @param event ev
     * @returns void
     */
    keyPress: function (ev) {
        this.interacted = true;
        var key = ev.which || ev.keyCode;
        if (this.enabledCommands) {
            switch (key) {
                case 37:
                    this.updateBlockPosition('left');
                    break;
                case 40:
                    this.updateBlockPosition('down');
                    break;
                case 39:
                    this.updateBlockPosition('right');
                    break;
                case 16:
                    this.updateBlockPosition('turn', false);
                    this.playSound("turn");
                    break;
                case 17:
                    this.updateBlockPosition('turn', true);
                    this.playSound("turn");
                    break;
                default:
                    break;
            }
        }
        switch (key) {
            case 32:
                this.pauseGame();

                break;
            default:
                break;

        }
    },
    playSound: function (type) {
        if (this.interacted) {
            switch (type) {
                case "turn":
                    var audio = new Audio('./sounds/turn.wav');
                    audio.play();

                    break;

                case "level-up":
                    var audio = new Audio('./sounds/level-up.wav');
                    audio.play();

                    break;

                case "removed-1":
                    var audio = new Audio('./sounds/removed-1.wav');
                    audio.play();

                    break;

                case "removed-4":
                    var audio = new Audio('./sounds/removed-4.wav');
                    audio.play();

                    break;
            }
        }
    },
    /**
     * Sets a new random block
     * @returns void
     */
    newRandomBlock: function () {
        this.currentBlock = (this.upcomingBlock ? this.upcomingBlock : this.blocks[Math.floor((Math.random() * 60)) % 7]);
        this.upcomingBlock = this.blocks[Math.floor((Math.random() * 60)) % 7];
    }
};
