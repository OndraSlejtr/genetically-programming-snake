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


export function maskInfo(key, value) {
    if (key == "parent") {
        return
    }
    if (typeof value === 'function') {
        let func = ("" + value);
        return func.substring("function".length + 1, func.indexOf('('));
    }
    return value;
}
