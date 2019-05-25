export function subchildCount(total, node) {
    if (node.childCount === 0) {
        return 0;
    }
    else {
        total += node.childCount;

        node.children.array.forEach(element => {
            total += subchildCount(0, element);
        });
        return total;
    }
}

export class Node {

    constructor(value) {
        this.value = value;
        this.children = [];
        this.parent = null;
    }

    getRoot() {
        if (this.parent === null){
            return this;
        }
        else {
            return this.parent;
        }
    }

    setParentNode (node) {
        this.parent = node;
    }

    getParentNode () {
        return this.parent;
    }

    addChild (node) {
        node.setParentNode(this);
        this.children[this.children.length] = node;
    }

    getChildren () {
        return this.children;
    }

    removeChildren () {
        this.children = [];
    }

    getChildrenCount() {
        return subchildCount(0, this);
    }

    get childCount(){
        return this.children.length;
    }
}

