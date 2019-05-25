import {turnOptions} from './snake.mjs';

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

function dangerRight(snake) {
    return 0;
}

function dangerLeft(snake) {
    return 1;
}

function dangerAhead(snake) {
    return 2;
}

function foodAhead(snake) {
    return 1;
}

function foodBehind(snake) {
    return 2;
}


export const terminals = turnOptions.map(option => new Terminal(option));

const nonterminalFunctions = [ dangerRight, dangerLeft, dangerAhead, foodAhead, foodBehind ];
export const nonTerminals = nonterminalFunctions.map(func => new NonTerminal(func));