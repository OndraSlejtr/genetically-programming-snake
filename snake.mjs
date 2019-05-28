// import { Node } from './tree.js';
import {
    getRand
} from './utils.mjs';
import {
    movingRight,
    dangerAhead,
    dangerLeft,
    dangerRight,
    foodAhead,
    foodUp,
    foodLeft,
    movingDown,
    movingLeft,
    movingUp
} from './genetics.mjs';

export const LEFT = {
    x: -1,
    y: 0
};
export const RIGHT = {
    x: 1,
    y: 0
};
export const UP = {
    x: 0,
    y: 1
};
export const DOWN = {
    x: 0,
    y: -1
};
export const directions = [UP, RIGHT, DOWN, LEFT];

const FORWARD = 0;
const LEFTTURN = 1;
const RIGHTTURN = 2;
export const turnOptions = [FORWARD, LEFTTURN, RIGHTTURN];

function getTurnOption(turnId) {
    return turnOptions[turnId];
}

export function changeDirectionToRight(origDirection) {
    return (4 + origDirection + 1) % 4
}
export function changeDirectionToLeft(origDirection) {
    return (4 + origDirection - 1) % 4
}

export function getDirection(directionId) {
    return directions[directionId];
}


function decide(decisionTree, snake) {

    // console.log('deciding');
    if (decisionTree.value.run === undefined) {
        return decisionTree.value;
    } else {
        let childDecision = decisionTree.value.run(snake) + 0;
        let child = decisionTree.children[childDecision];
        if (child === undefined) {
            console.log(decisionTree.children);
            console.log(decisionTree.value);
            console.log(decisionTree.modified);
        }
        return decide(child, snake);

    }

}

export class Snake {
    constructor(game) {
        this.game = game;
        this.decisionFunction = undefined;
        this.pieces = [];
        this.pieces.push(this.game.getEmptyTile());
        this.facing = getRand(3);
        this.eating = false;

        //console.debug('Snake created at', this.pieces[0].x, this.pieces[0].y);
    }

    setDecisionFunction(func) {
        this.decisionFunction = func;
    }

    getHead() {
        return this.pieces[0];
    }

    notLocatedOn(x, y) {
        return this.pieces.some(piece => piece.x === x && piece.y === y);
    }

    makeDecision() {
        if (this.decisionFunction !== undefined) {
            const dec = decide(this.decisionFunction, this).value;
            return dec;
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
            // log('Continuing forward');
        } else if (direction === LEFTTURN) {
            // log('Continuing to the left');
            this.facing = changeDirectionToLeft(this.facing)
        } else if (direction === RIGHTTURN) {
            // log('Continuing to the right');
            this.facing = changeDirectionToRight(this.facing)
        }
    }

    move() {
        if (!this.game.manualControl) {
            this.considerTurn();
        }
        const newPiece = this.pieces[0].plus(getDirection([this.facing]));
        //console.debug('Moving to:', newPiece.x, newPiece.y);
        this.pieces.unshift(newPiece);

        if (!this.eating) {
            this.pieces.pop();
        } else {
            this.eating = false;
        }
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

    constructor({
        visible,
        manualControl,
        maxTurns = 500,
        width = 10,
        height = 10,
        foodCount = 1
    }) {

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

        this.snake = new Snake(this);

        if (this.visible === true) {
            this.drawSpeed = 1000000;
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
        //console.debug('Canvas created with width: ' + this.width, 'height:', this.height);

        this.canvas = document.getElementById('jsSnake');

        this.ctx = this.canvas.getContext('2d');
    }

    gameFinished() {
        return (this.maxTurns <= this.currentTurn || this.finished);
    }

    start() {
        if (this.visible) {
            this.gameloop();

            const interval = setInterval((() => {
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
        this.snake.pieces.slice(0, 1).forEach(piece => {
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
        let snakeCheck = true;
        if (this.snake !== undefined) {
            snakeCheck = this.snake.notLocatedOn(x, y);
        }
        return foodCheck && snakeCheck;
    }

    getEmptyTile() {

        let x;
        let y;
        let count = 0;

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

    isWall(location) {
        return (location.x < 0 || location.x >= this.width || location.y < 0 || location.y >= this.height);
    }

    // Snake loses if he crashes with himself or with wall of the arena
    checkLoseConditions() {

        const snakeHead = this.snake.getHead();

        if (this.snake.pieces.slice(1).some(piece => piece.x === snakeHead.x && piece.y === snakeHead.y)) {
            // console.debug('Snake has crashed into itself after eating ', this.snake.hasEaten(), ' after ', this.currentTurn, 'turns.');
            this.finished = true;
        }

        if (this.isWall(snakeHead)) {
            // console.debug('Snake has crashed into the wall after eating ', this.snake.hasEaten(), ' after ', this.currentTurn, 'turns.');
            this.finished = true;
        }
    }
    checkEatingConditions() {

        const snakeHead = this.snake.getHead();
        const index = this.foodList.findIndex(food => food.x === snakeHead.x && food.y === snakeHead.y);

        if (index !== -1) {
            //console.debug("Snake has eaten. YUM");
            this.snake.eat();
            this.foodList.splice(index, 1);
            this.addFood();
        }
    }


    addFood() {
        const emptyTile = this.getEmptyTile();

        //console.debug('Food added at', emptyTile.x, emptyTile.y);
        this.foodList.push(new Coord(emptyTile.x, emptyTile.y));
    }

    gameloop() {
        if (this.visible) {
            this.draw();
            console.log('movingRight', movingRight(this.snake));
            console.log('movingLeft', movingLeft(this.snake));
            console.log('movingUp', movingUp(this.snake));
            console.log('movingDown', movingDown(this.snake));
            console.log('foodLeft', foodLeft(this.snake));
            console.log('foodUp', foodUp(this.snake));
            console.log('foodAhead', foodAhead(this.snake));
            console.log('dangerAhead', dangerAhead(this.snake));
            console.log('dangerLeft', dangerLeft(this.snake));
            console.log('dangerRight', dangerRight(this.snake));
            console.log('==========================================');
        }

        this.snake.move();
        this.currentTurn++;
        this.checkCollision();
    }
}