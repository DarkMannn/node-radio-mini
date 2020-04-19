const NeoBlessed = require('neo-blessed');
const { keys }  = require('../config');

class FocusIndexer {

    constructor({ getNavigationLimit }) {
        this._index = 1;
        this._getNavigationLimit = getNavigationLimit;
    }

    get() {
        return this._index;
    }

    incr() {
        if (this._index < this._getNavigationLimit()) {
            this._index++;
        }
    }

    decr() {
        if (this._index > 1) this._index--;
    }
}

class TerminalBox {

    constructor(config) {

        this.box = NeoBlessed.box(config);
    }
}

class TerminalItemBox extends TerminalBox {

    constructor({
        config,
        childConfig,
        bgPlain,
        bgFocus
    }) {

        super(config);
        this._childConfig = childConfig;
        this._bgPlain = bgPlain;
        this._bgFocus = bgFocus;
        this._focusIndexer = new FocusIndexer({
            getNavigationLimit: this._getNavigationLimit.bind(this)
        });
    }

    _getHeight() {
        return this.box.height - 2;
    }

    _getChildrenLength() {
        return this.box.children.length;
    }

    _getNavigationLimit() {
        return Math.min(this.box.children.length - 1, this._getHeight());
    }

    _setActiveChildColor(color) {

        const activeChild = this.box.children[this._focusIndexer.get()];
        if (activeChild) {
            activeChild.style.bg = color;
        }
    }

    preFocus() {
        this._setActiveChildColor(this._bgFocus);
    }

    postFocus() {
        this._setActiveChildColor(this._bgPlain);
    }

    navigator(key) { 
        
        if (this.box.children.length === 1) {
            return;
        }

        const unfocusedIndex = this._focusIndexer.get();
        const unfocusedChild = this.box.children[unfocusedIndex];

        if (key === keys.SCROLL_UP) {
            this._focusIndexer.decr();
        }
        else if (key === keys.SCROLL_DOWN) {
            this._focusIndexer.incr();
        }

        const focusedIndex = this._focusIndexer.get();
        const focusedChild = this.box.children[focusedIndex];

        unfocusedChild.style.bg = this._bgPlain;
        focusedChild.style.bg = this._bgFocus;
    }

    _createBoxChild() {
        throw new Error('_createBoxChild() method not implemented');
    }

    createBoxChildAndAppendToBox(content) {

        const boxChild = this._createBoxChild(content);
        this.box.append(boxChild);
    }
}

module.exports = {
    TerminalBox,
    TerminalItemBox
};
