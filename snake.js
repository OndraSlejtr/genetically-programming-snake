// Max including 
function getRand(max) {
     return Math.floor(Math.random() * Math.floor(max + 1));
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

const LEFT =    {'x':-1, 'y': 0};
const RIGHT =   {'x': 1, 'y': 0};
const UP =      {'x': 0, 'y': 1};
const DOWN =    {'x': 0, 'y':-1};
const directions = [ UP, RIGHT, DOWN, LEFT ];

const FORWARD = 0;
const LEFTTURN = 1;
const RIGHTTURN = 2;
const turnOptions = [ FORWARD, LEFTTURN, RIGHTTURN ];

function getTurnOption(turnId) {
    return turnOptions[turnId];
}

function getDirection(directionId) {
    return directions[directionId];
}

class Snake {
    constructor(game) {
        this.game = game;
        this.pieces = [];
        this.pieces.push(this.game.getEmptyTile());
        this.facing = getRand(3);

        
    }

    notLocatedOn(x, y) {
        return this.pieces.filter(piece => piece.x === x && piece.y === y) === [];
    }
    
    makeDecision() {    
        return getRand(turnOptions.length);
    }

    considerTurn() {
        const direction = this.makeDecision();

        if (direction === FORWARD){
            // do nothing
        }
        else if (direction === LEFTTURN) {
            this.facing = (4 + this.facing - 1) % 4
        }
        else if (direction === RIGHTTURN) {
            this.facing = (4 + this.facing + 1) % 4
        }
    }

    // moveBy(xAdjustment, yAdjustment) {
    //     const leadingPiece = this.pieces[this.pieces.length - 1];
    //     const newLocation = new Coord(leadingPiece.x + xAdjustment, 
    //         leadingPiece.y + yAdjustment);
    // }

    move() {
        
       
        console.log(this.pieces[0]);

        this.considerTurn(); 
        const newPiece = this.pieces[0].plus(getDirection([this.facing]));
        this.pieces.push(newPiece);
        this.pieces.shift();
    }

    eat() {

    }
}

class Coord {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    plus(otherCoord) {
        return new Coord(this.x + otherCoord.x, this.y + otherCoord.y);
    }
}

class Game {
    createCanvas() {
        this.scale = 10;

        $('body').append('<canvas id="jsSnake">');
        this.canvas = $('#jsSnake');
        
        this.canvas.attr('width', this.width * this.scale);
        this.canvas.attr('height', this.height * this.scale);
        this.canvas.attr('style', 'border:1px solid #000000;');
        console.log('Canvas created ' + this.width, this.height, this.scale)
        
        this.canvas = document.getElementById('jsSnake');    

        this.ctx = this.canvas.getContext('2d');
    }

    constructor(visible) {
        this.maxTurns = 50;
        this.currentTurn = 0;
        this.width = getRand(100);
        this.height = getRand(100);
        this.visible = visible;
        this.foodSpawnRate = 3; // Aprox. how many turns it takes for one pieces of food to spawn

        this.foodList = [];

        this.snake = new Snake(this);

        if (this.visible === true) {
            this.drawSpeed = 300;
            this.createCanvas();
        }
    }

    start() {
        if (this.visible) {
            setInterval(this.gameloop.bind(this), this.drawSpeed);
        }
        else {
            while (this.maxTurns >= this.currentTurn) {
                this.gameloop();
            }
        }
    }

    draw() {

        this.ctx.clearRect(0, 0, this.width * this.scale, this.height * this.scale);

        this.ctx.fillStyle = "#000000";   
        this.snake.pieces.forEach(piece => {
            this.ctx.fillRect(piece.x * this.scale, piece.y * this.scale,
                              this.scale, this.scale);
        });
    }
    
    isEmptyTile(x ,y) {
        
        let foodCheck = this.foodList.filter(food => food.x === x && food.y === y).length === 0;
        var snakeCheck = true;
        if (this.snake !== undefined) {
            snakeCheck = this.snake.notLocatedOn(x, y);
        }
        return foodCheck && snakeCheck;
    }

    getEmptyTile() {

        var x;
        var y;
        var count = 0;

        do {
            x = getRand(this.width);
            y = getRand(this.height);
            count++;
        } while (!this.isEmptyTile(x, y) && count < 100);


        return new Coord(x, y);
    }

    checkCollision() {
        this.checkLoseConditions();
        this.checkEatingConditions();
    }

    // Snake loses if he crashes with himself or with wall of the arena
    checkLoseConditions() {

    }
    checkEatingConditions() {
        if (false) {
            this.addFood();
        }        
    }

    addFood() {
        const emptyTile = this.getEmptyTile();
        this.foodList.push(new Coord(emptyTile.x, emptyTile.y));
    }

    gameloop() {     
        if (this.visible) {
            this.draw();
        }        
        this.checkCollision();   
        this.addFood();

        this.snake.move();
        this.currentTurn++;
    }
}

// Driver
console.log('starting')
$(document).ready(() => {
    const game = new Game(true).start();
});