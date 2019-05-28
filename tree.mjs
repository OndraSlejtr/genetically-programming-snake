import {
    getRand
} from "./utils.mjs";
import {
    getRandomElement
} from "./utils.mjs";
import {
    nonTerminals,
    terminals
} from "./genetics.mjs";

const _ = require('lodash');
const mutationDepth = 1.5;
const DEBUG = false;

export function subchildCount(total, node) {
    if (node.childCount === 0) {
        return 0;
    } else {
        total += node.childCount;

        node.children.array.forEach(element => {
            total += subchildCount(0, element);
        });
        return total;
    }
}

function log(text) {
    if (DEBUG) {
        console.log(text);
    }
}

export function generateRandomTree(depth) {
    if (depth <= 0) {
        let node = new Node(getRandomElement(terminals));
        node.modified = 'random';
        return node;

    } else {
        let node = new Node(getRandomElement(nonTerminals));
        node.addChild(generateRandomTree(depth - 1));
        node.addChild(generateRandomTree(depth - 1));
        return node;
    }
}

export class Node {

    constructor(value) {
        this.value = value;
        this.children = [];
        this.parent = null;
    }

    getRoot() {
        if (this.parent === null) {
            return this;
        } else {
            return this.parent;
        }
    }

    setParentNode(node) {
        this.parent = node;
    }

    getParentNode() {
        return this.parent;
    }

    addChild(node) {
        node.setParentNode(this);
        this.children[this.children.length] = node;
    }

    getChildren() {
        return this.children;
    }

    removeChildren() {
        this.children = [];
    }

    getChildrenCount() {
        return subchildCount(0, this);
    }

    get childCount() {
        return this.children.length;
    }
    get depth() {
        if (this.childCount === 0) {
            return 1;
        }
        return Math.max(...this.children.map(child => 1 + child.depth));
    }

    // Mutations
    // TODO: Refactor into more unified reusable variant
    subtreeMutation(initialCoef, coefIncrease) {

        log(initialCoef, coefIncrease);

        if (Math.random() <= initialCoef || this.depth <= 1) {
            // return generateRandomTree(getRand(10, 2));
            this.modified = 'subtree';
            return generateRandomTree(getRand(2, 10));
        } else {
            const mutationIndex = getRand(this.childCount);
            this.children[mutationIndex] = this.children[mutationIndex].subtreeMutation(initialCoef + coefIncrease, mutationDepth / this.depth);
            this.children[mutationIndex].parent = this;

            return this;
        }
    }
    pointMutation(initialCoef, coefIncrease) {
        log('pointMutation');
        if (Math.random() <= initialCoef || this.depth <= 2) {
            this.value = getRandomElement(nonTerminals); // TODO: Add support for nonbinary nonterminals
            this.modified = 'point';
            return this;
        } else {
            let mutationIndex = getRand(this.childCount);
            while (this.children[mutationIndex].value.run === undefined) {
                mutationIndex = getRand(this.childCount);
            }
            // this.children[mutationIndex].pointMutation(initialCoef + coefIncrease, mutationDepth / this.depth);
            this.children[mutationIndex] = this.children[mutationIndex].pointMutation(initialCoef + coefIncrease, mutationDepth/ this.depth);
            this.children[mutationIndex].parent = this;

            return this;
        }
    }
    shrinkMutation(initialCoef, coefIncrease) {
        if (Math.random() <= initialCoef || this.depth <= 1) {
            this.value = getRandomElement(terminals); // TODO: Add support for nonbinary nonterminals
            this.children = [];
            this.modified = 'shrink';
            return this;
        } else {
            const mutationIndex = getRand(this.childCount)
            this.children[mutationIndex] = this.children[mutationIndex].shrinkMutation(initialCoef + coefIncrease, 1.5 / this.depth);
            this.children[mutationIndex].parent = this;

            return this;
        }
    }
    permutationMutation(initialCoef, coefIncrease) {
        if (Math.random() <= initialCoef || this.depth <= 2) {
            [this.children[0], this.children[1]] = [this.children[1], this.children[0]];
            return this;
        } else {
            const mutationIndex = getRand(this.childCount)
            this.children[mutationIndex] = this.children[mutationIndex].permutationMutation(initialCoef + coefIncrease, 1.5 / this.depth);
            return this;
        }
    }

    mutate() {
        // console.log('mutation starting');

        // console.log('depth is', this.depth);

        const coef = this.depth !== 0 ? 1 / this.depth : 1;
        const coefIncrease = this.depth !== 0 ? 1.5 / this.depth : 1;

        // console.log(coef, coefIncrease);

        const mutationTypes = [this.subtreeMutation, this.pointMutation, this.shrinkMutation/*, this.permutationMutation*/];

        if (this.depth >= 2) {
            // skip permutationMutation for shallow trees
            return mutationTypes[getRand(mutationTypes.length - 1)].bind(this)(coef, coefIncrease);
        }

    }

    //Mating TODO
    mate(otherParent) {
        let child1 = _.cloneDeep(this);
        let child2 = _.cloneDeep(otherParent);

        return [child1, child2];
    }
}