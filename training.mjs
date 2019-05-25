import {
    Node
} from './tree.mjs';
import {
    terminals,
    nonTerminals
} from './genetics.mjs';
import {
    getRandomElement,
    coinflip
} from './utils.mjs';
import {
    Game,
    Snake
} from './snake.mjs';

const options = terminals.concat(nonTerminals);

function generateRandomTree(maxDepth) {
    if (coinflip() || maxDepth <= 1) {
        return new Node(getRandomElement(terminals));
    } else {
        let node = new Node(getRandomElement(nonTerminals));
        node.addChild(generateRandomTree(maxDepth - 1));
        node.addChild(generateRandomTree(maxDepth - 1));
        return node;
    }
}

function decide(decisionTree) {
    return function (snake) {
        if (decisionTree.value.run === undefined) {
            return decisionTree.value;
        } else {
            return decide(snake, decisionTree.children[decisionTree.value.run(snake)]);
        }
    }
}

function fitnessEval(decisionTree) {
    let game = new Game(false, false);
    game.snake.setDecisionFunction(decide(decisionTree));
    game.start();
    return game.snake.hasEaten();
}

const tree = generateRandomTree(5);
console.log(fitnessEval(tree));