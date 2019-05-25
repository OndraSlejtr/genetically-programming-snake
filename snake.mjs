// import { Node } from './tree.js';
import {
    getRand
} from './utils.mjs';

const LEFT = {
    'x': -1,
    'y': 0
};
const RIGHT = {
    'x': 1,
    'y': 0
};
const UP = {
    'x': 0,
    'y': 1
};
const DOWN = {
    'x': 0,
    'y': -1
};
const directions = [UP, RIGHT, DOWN, LEFT];

const FORWARD = 0;
const LEFTTURN = 1;
const RIGHTTURN = 2;
export const turnOptions = [FORWARD, LEFTTURN, RIGHTTURN];

function getTurnOption(turnId) {
    return turnOptions[turnId];
}

function getDirection(directionId) {
    return directions[directionId];
}

export class Snake {
    constructor(game) {
        this.game = game;
        this.decisionFunction = undefined;
        this.pieces = [];
        this.pieces.push(this.game.getEmptyTile());
        this.facing = getRand(3);
        this.eating = false;

        console.log('Snake created at', this.pieces[0].x, this.pieces[0].y);
    }

    setDecisionFunction(func) {
        this.decisionFunction = func;
    }

    getHead() {
        return this.pieces[0];
    }

    notLocatedOn(x, y) {
        return this.pieces.filter(piece => piece.x === x && piece.y === y) === [];
    }

    makeDecision() {
        if (this.decisionFunction !== undefined) {
            return this.decisionFunction(this);
        }
        return getRand(turnOptions.length);
    }

    eat() {
        this.eating = true;
    }

    hasEaten() {
        return this.pieces.length;
    }

    considerTurn() {
        const direction = this.makeDecision();

        if (direction === FORWARD) {
            // do nothing
        } else if (direction === LEFTTURN) {
            this.facing = (4 + this.facing - 1) % 4
        } else if (direction === RIGHTTURN) {
            this.facing = (4 + this.facing + 1) % 4
        }
    }

    move() {
        if (!this.game.manualControl) {
            this.considerTurn();
        }
        const newPiece = this.pieces[0].plus(getDirection([this.facing]));
        console.log('Moving to:', newPiece.x, newPiece.y);
        this.pieces.unshift(newPiece);

        if (!this.eating) {
            this.pieces.pop();
        } else {
            this.eating = false;
        }

        // let str = '';
        // this.pieces.forEach(piece => str += piece.x + ":" + piece.y + "\n");
        // console.log(str);
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

export class Game {

    constructor(visible, manualControl, maxTurns = 250, width = 50, height = 50, foodCount = 500) {

        this.manualControl = manualControl;
        this.finished = false;
        this.maxTurns = maxTurns;
        this.currentTurn = 0;

        // this.width = getRand(50, 5);
        // this.height = getRand(50, 5);
        this.width = width;
        this.height = height;
        this.visible = visible;

        this.foodList = [];

        foodCount = foodCount <= width * height ? foodCount : width * height - 1;
        Array(foodCount).fill().forEach(() => this.addFood());

        //this.foodList.push(this.getEmptyTile());
        console.log('Food created at', this.foodList[0].x, this.foodList[0].y);

        this.snake = new Snake(this);

        if (this.visible === true) {
            this.drawSpeed = 1000;
            this.createCanvas();
        }
    }

    createCanvas() {
        this.scale = 20;

        $('body').append('<canvas id="jsSnake">');
        this.canvas = $('#jsSnake');

        this.canvas.attr('width', this.width * this.scale);
        this.canvas.attr('height', this.height * this.scale);
        this.canvas.attr('style', 'border:1px solid #000000;');
        console.log('Canvas created with width: ' + this.width, 'height:', this.height);

        this.canvas = document.getElementById('jsSnake');

        this.ctx = this.canvas.getContext('2d');
    }

    gameFinished() {
        return (this.maxTurns <= this.currentTurn || this.finished);
    }

    start() {
        if (this.visible) {
            this.gameloop();

            var interval = setInterval((() => {
                this.gameloop();

                if (this.gameFinished()) {
                    clearInterval(interval);
                }
            }).bind(this), this.drawSpeed);
        } else {
            
            while (!this.gameFinished()) {
                this.gameloop();
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width * this.scale, this.height * this.scale);

        this.ctx.fillStyle = "#00FF00";
        this.foodList.forEach(food => {
            this.ctx.fillRect((food.x + 0) * this.scale, (food.y + 0) * this.scale,
                this.scale, this.scale);
        });

        this.ctx.fillStyle = "#FF0000";
        this.snake.pieces.slice(0,1).forEach(piece => {
            this.ctx.fillRect((piece.x + 0) * this.scale, (piece.y + 0) * this.scale,
                this.scale, this.scale);
        });

        this.ctx.fillStyle = "#000000";
        this.snake.pieces.slice(1).forEach(piece => {
            this.ctx.fillRect((piece.x + 0) * this.scale, (piece.y + 0) * this.scale,
                this.scale, this.scale);
        });
    }

    isEmptyTile(x, y) {

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
        this.checkEatingConditions();
        this.checkLoseConditions();
    }



    // Snake loses if he crashes with himself or with wall of the arena
    checkLoseConditions() {

        const snakeHead = this.snake.getHead();

        if (this.snake.pieces.slice(1).some(piece => piece.x === snakeHead.x && piece.y === snakeHead.y)) {
            console.log('Snake has crashed into itself.');
            this.finished = true;
        }

        if (snakeHead.x < 0 || snakeHead.x >= this.width || snakeHead.y < 0 || snakeHead.y >= this.height) {
            console.log('Snake has crashed into the wall.');
            this.finished = true;
        }
    }
    checkEatingConditions() {

        const snakeHead = this.snake.getHead();
        const index = this.foodList.findIndex(food => food.x === snakeHead.x && food.y === snakeHead.y);        

        if (index !== -1) {
            this.snake.eat();
            this.foodList.splice(index, 1);
            this.addFood();
        }
    }


    addFood() {
        const emptyTile = this.getEmptyTile();

        console.log('Food added at', emptyTile.x, emptyTile.y);
        this.foodList.push(new Coord(emptyTile.x, emptyTile.y));
    }

    gameloop() {
        if (this.visible) {
            this.draw();
        }

        this.snake.move();
        this.currentTurn++;        
        this.checkCollision();
    }
}
