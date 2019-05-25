export function getRand(max, min) {
    if (min === undefined) {
        return Math.floor(Math.random() * Math.floor(max));
    }
    else {
        return Math.floor(Math.random() * Math.floor(max - min)) + min;
    }    
}

export function getRandomElement(array) {
    return array[getRand(array.length)];
}

export function coinflip() {
    return getRand(2) === 1;
}

