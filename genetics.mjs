
import {
    changeDirectionToRight,
    changeDirectionToLeft
} from './snake.mjs';
import { getDirection } from './snake.mjs';


const FORWARD = 0;
const LEFTTURN = 1;
const RIGHTTURN = 2;
const turnOptions = [FORWARD, LEFTTURN, RIGHTTURN];

// Remove when node module imports stop being s**t
// import {
//     LEFT,
//     RIGHT,
//     UP,
//     DOWN
// } from './snake.mjs';
const LEFT = {
    x: -1,
    y: 0
};
const RIGHT = {
    x: 1,
    y: 0
};
const UP = {
    x: 0,
    y: 1
};
const DOWN = {
    x: 0,
    y: -1
};
// Stop removing ty

export class Terminal {
    constructor(value) {
        this.value = value;
    }
}

export class NonTerminal {
    constructor(func) {
        this.func = func;
    }
    run(snake) {
        return this.func(snake);
    }
}

// Nonterminal functions should return integer signifying which of its children 
// were chosen to be evaluated
// TODO: Allow for nonbinary functions


export function dangerRight(snake) {
    const head = snake.getHead();
    const rightOfHead = head.plus(getDirection(changeDirectionToRight(snake.facing)));
    return (snake.notLocatedOn(rightOfHead.x, rightOfHead.y) || snake.game.isWall(rightOfHead));
}

export function dangerLeft(snake) {
    const head = snake.getHead();
    const leftOfHead = head.plus(getDirection(changeDirectionToLeft(snake.facing)));
    return (snake.notLocatedOn(leftOfHead.x,leftOfHead.y) || snake.game.isWall(leftOfHead));
}

export function dangerAhead(snake) {
    const head = snake.getHead();    
    const ahead = head.plus(getDirection(snake.facing));
    return (snake.notLocatedOn(ahead.x, ahead.y) || snake.game.isWall(ahead));
}

export function foodAhead(snake) {
    const head = snake.getHead();

    return snake.game.foodList.some(food => {
        if (snake.facing === LEFT) {
            return food.x < head.x;
        } else if (snake.facing === RIGHT) {
            return food.x > head.x;
        } else if (snake.facing === UP) {
            return food.y > head.y;
        } else if (snake.facing === DOWN) {
            return food.y < head.y;
        }
    });
}

export function foodUp(snake) {
    const head = snake.getHead();
    return snake.game.foodList.some(food => food.y > head.y);
}

export function foodLeft(snake) {
    const head = snake.getHead();
    return snake.game.foodList.some(food => food.x < head.x);
}

export function movingLeft(snake) {
    return snake.facing === 3;
}

export function movingRight(snake) {
    return snake.facing === 1;
}

export function movingUp(snake) {
    return snake.facing === 0;
}

export function movingDown(snake) {
    return snake.facing === 2;
}

export const terminals = turnOptions.map(option => new Terminal(option));

const nonterminalFunctions = [dangerRight, dangerLeft, dangerAhead, foodAhead, foodUp, foodLeft, movingLeft, movingRight, movingUp, movingDown];
export const nonTerminals = nonterminalFunctions.map(func => new NonTerminal(func));