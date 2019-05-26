import {
    generateRandomTree
} from './tree.mjs';
import {
    terminals,
    nonTerminals
} from './genetics.mjs';
import {
    getRandomElement,
    coinflip,
    maskInfo
} from './utils.mjs';
import {
    Game,
    Snake
} from './snake.mjs';
import { getRand } from './utils.mjs';

var _ = require('lodash');

const options = terminals.concat(nonTerminals);

// function decide(decisionTree) {

//     // console.log(JSON.stringify(decisionTree, maskInfo));

//     return function (snake) {
//         if (decisionTree.value.run === undefined) {
//             return decisionTree.value;
//         } else {
//             return decide(snake, decisionTree.children[decisionTree.value.run(snake)]);
//         }
//     }
// }

function fitnessEval(decisionTree) {
    var total = 0;
    var repeats = 2;
    for (var i = 0; i < repeats; i++) {
        let game = new Game({visible: false, manualControl: false, foodCount: 1});
        game.snake.setDecisionFunction(decisionTree);
        game.start();
        total += game.snake.hasEaten();
    }
    return Math.floor(total / repeats);
}

class Population {
    constructor({
        size,
        crossover,
        elitism,
        mutation
    }) {
        this.size = size;
        this.crossover = crossover;
        this.elitism = elitism;
        this.mutation = mutation;

        const maximumInitialDepth = 10;
        this.tournamentSize = 3;

        this.pops = [];
        for (let i = 0; i < size; i++) {
            let tree = generateRandomTree(maximumInitialDepth, 10);
            tree.fitness = fitnessEval(tree);
            //console.log(tree);
            this.pops.push(tree);
        }
        this._sortPops();
    }
    _measureFitness() {        
        for (let i = 0; i < this.size; i++) {
            this.pops[i].fitness = fitnessEval(this.pops[i]);
        }
    }

    _sortPops() {
        this.pops.sort((e1, e2) => e2.fitness - e1.fitness);
    }

    tournamentSelection() {
        let best = this.pops[Math.floor(Math.random()*this.pops.length)];
        for (var i = 0; i < this.tournamentSize; i++) {
            let contender = this.pops[Math.floor(Math.random()*this.pops.length)];
            if (contender.fitness > best.fitness) {
                best = contender;
            }
        }
        return best;
    }

    selectParents() {
        return [this.tournamentSelection(), this.tournamentSelection()];
    }

    evolve() {
        const eliteCutoff = Math.floor(this.size * this.elitism);
        let elite = _.cloneDeep(this.pops.slice(0, eliteCutoff));

        while (elite.length < this.size) {
            if (Math.random() <= this.crossover){
                const [parent1, parent2] = this.selectParents();
                const children = parent1.mate(parent2);
                children.forEach(child => {
                    if (Math.random() < this.mutation) {
                        elite.push(child.mutate());
                    }
                    else {
                        elite.push(child);
                    }                    
                })
            }
            else {
                if (Math.random() <= this.mutation){
                    elite.push(this.pops[elite.length].mutate());
                }   
                else {
                    elite.push(this.pops[elite.length]);
                }
            }
        }
        this.pops = elite;
        this._measureFitness();
        this._sortPops();
        console.log(this.pops.map(pop => pop.fitness));
    }

    get maxFitness() {
        return this.pops[0].fitness;
    }
    get topPop() {
        return this.pops[0];
    }
}

const generations = 100;
const pop = new Population({
    size: 100,
    crossover: 0.8,
    elitism: 0.2,
    mutation: 0.3
});

var maxFitness = 0;

[...Array(generations).keys()].forEach(gen => {
    console.log('Running generation number', gen, 'current gen max fitness ', pop.maxFitness);
    if (pop.maxFitness > maxFitness) {
        maxFitness = pop.maxFitness;
        console.log('New top fitness found', maxFitness);
    }
    pop.evolve();
});

console.log('\n==============================\nEvolution over\n')
console.log('Maximum fitness achieved: ', maxFitness);
// console.log(JSON.stringify(pop.topPop, maskInfo));
// console.log(JSON.stringify(generateRandomTree(10), maskInfo));
