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
            this.modified = 'subtree';
            return generateRandomTree(getRand(2, 5));
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
            this.children[mutationIndex] = this.children[mutationIndex].pointMutation(initialCoef + coefIncrease, mutationDepth / this.depth);
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
            this.children[mutationIndex] = this.children[mutationIndex].shrinkMutation(initialCoef + coefIncrease, mutationDepth / this.depth);
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
            this.children[mutationIndex] = this.children[mutationIndex].permutationMutation(initialCoef + coefIncrease, mutationDepth/ this.depth);
            return this;
        }
    }

    mutate() {
        const coef = this.depth !== 0 ? 1 / this.depth : 1;
        const coefIncrease = this.depth !== 0 ? 1.5 / this.depth : 1;

        const mutationTypes = [this.subtreeMutation, this.pointMutation, this.shrinkMutation /*, this.permutationMutation*/ ];

        if (this.depth >= 2) {
            // skip permutationMutation for shallow trees
            return mutationTypes[getRand(mutationTypes.length - 1)].bind(this)(coef, coefIncrease);
        }

    }
    getRandomSubtree(initialCoef, coefIncrease) {
        if (Math.random() <= initialCoef || this.depth <= 2) {
            this.modified = 'mating-random-subtree';
            return this;
        } else {
            const mutationIndex = getRand(this.childCount);
            return this.children[mutationIndex].getRandomSubtree(initialCoef + coefIncrease, 0.5 / this.depth); // TODO: Replace probability coef constant
        }
    }
    cutoffRandomSubtree() {
        const coef = this.depth !== 0 ? 1 / this.depth : 1;
        const coefIncrease = this.depth !== 0 ? 0.5 / this.depth : 1;

        const cutoff = _.cloneDeep(this.getRandomSubtree(coef, coefIncrease));
        let remains = cutoff.parent;
        let cutoff_point = -1;
        if (remains !== null) {
            cutoff_point = cutoff.parent.children[0] === cutoff ? 0 : 1;
            remains.children[cutoff_point] = null;
        }
        cutoff.parent = null;
        
        return [cutoff, cutoff_point, remains];
    }
    mate(otherParent) {
        let [cutoff1, cutoff_point1, remains1] = this.cutoffRandomSubtree();
        let [cutoff2, cutoff_point2, remains2] = otherParent.cutoffRandomSubtree();
        
        if (remains1 !== null) { // Check if we didn't cut tree off right at the root
            remains1.children[cutoff_point1] = cutoff2;
            cutoff2.parent = remains1;
        } else {
            remains1 = cutoff2;
        }

        if (remains2 !== null) {
            remains2.children[cutoff_point2] = cutoff1;
            cutoff1.parent = remains2;
        } else {
            remains2 = cutoff1;
        }
        const child1 = remains1.getRoot();
        const child2 = remains2.getRoot();
        return [child1, child2];
    }
}