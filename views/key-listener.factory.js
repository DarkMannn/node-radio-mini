const { Screen } = require('./screens-config');
const Utils = require('../utils');
const internals = {};

internals.render = Screen.render.bind(Screen);

exports.KeyListenerFactory = ({ box, actionFn, bgPlain, bgFocus }) => {

    const getHeight = () => box.height - 1;
    const getChildrenLength = () => box.children.length - 1;
    const doChildrenOverlflow = () => getHeight() < getChildrenLength();
    const getNavigationLimit = () => Math.min(box.children.length - 1, getHeight() - 1);
    const setActiveChildColor = (color) => {

        const activeChild = box.children[focusIndexer.get()];
        if (activeChild) {
            activeChild.style.bg = color;
        }
    };
    const focusIndexer = (function makeIndexer() {

        let index = 1;
        return {
            get: () => index,
            incr: () => index < getNavigationLimit() && ++index,
            decr: () => index > 1 && --index
        };
    })();
    const scrollRememberer = (function makeRememberer() {

        let borderHitAndShouldScroll = false;
        return {
            shouldScroll: (direction) => borderHitAndShouldScroll === direction,
            startScroll: (direction) => { borderHitAndShouldScroll = direction; },
            stopScroll: () => { borderHitAndShouldScroll = false; }
        };
    })();

    function navigator(key) {

        if (box.children.length === 1) {
            return;
        }

        const unfocusedIndex = focusIndexer.get();
        const unfocusedChild = box.children[unfocusedIndex];

        if (key === 'k') {
            focusIndexer.decr();
        }
        else if (key === 'l') {
            focusIndexer.incr();
        }

        const focusedIndex = focusIndexer.get();
        const focusedChild = box.children[focusedIndex];

        unfocusedChild.style.bg = bgPlain;
        focusedChild.style.bg = bgFocus;

        internals.render();
    }

    function action({ fromTop } = {}) {

        const index = fromTop ? 1 : focusIndexer.get();
        const child = box.children[index];
        const content = child && child.content;

        if (!content) {
            return {};
        }

        actionFn({
            content,
            index: focusIndexer.get(),
            cb: focusIndexer.decr
        });
        internals.render();

        return { content, index };
    }

    function preFocus() {
        setActiveChildColor(bgFocus);
    }

    function postFocus() {
        setActiveChildColor(bgPlain);
    }

    function changeOrder(key) {

        if (box.children.length === 1) {
            return;
        }

        const index1 = focusIndexer.get();
        const child1 = box.children[index1];

        if (key === 'a') {
            focusIndexer.decr();
        }
        else if (key === 'z') {
            focusIndexer.incr();
        }

        const index2 = focusIndexer.get();
        const child2 = box.children[index2];

        child1.style.bg = bgPlain;
        child2.style.bg = bgFocus;
        [child1.content, child2.content] = [
            `${Utils.getFirstWord(child1.content)} ${Utils.discardFirstWord(child2.content)}`,
            `${Utils.getFirstWord(child2.content)} ${Utils.discardFirstWord(child1.content)}`,
        ];

        internals.render();

        return { index1, index2 };
    }

    function circleList(key) {

        if (box.children.length === 1) {
            return;
        }

        if (key === 'k' && scrollRememberer.shouldScroll('up')) {
            const temp = box.children[box.children.length - 1].content;
            box.children.reduceRight((lowerChild, upperChild) => {

                lowerChild.content = upperChild.content;
                return upperChild;
            });
            box.children[1].content = temp;
        }
        else if (key === 'l' && scrollRememberer.shouldScroll('down')) {
            const temp = box.children[1].content;
            box.children.reduce((upperChild, lowerChild, index) => {

                if (index > 1) {
                    upperChild.content = lowerChild.content;
                }
                return lowerChild;
            });
            box.children[box.children.length - 1].content = temp;
        }
        else if (
            (focusIndexer.get() === 1 && doChildrenOverlflow()) ||
            focusIndexer.get() === getHeight() - 1
        ) {
            scrollRememberer.startScroll(key === 'k' ? 'up' : 'down');
        }
        else {
            scrollRememberer.stopScroll();
        }

        internals.render();
    }

    return {
        navigator,
        action,
        preFocus,
        postFocus,
        ...(box.children[0].content === 'Queue' && { changeOrder }),
        ...(box.children[0].content === 'Playlist' && { circleList })
    };
};

const FocusIndexer = class FocusIndexer {

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
};

const ScrollRememberer = class ScrollRememberer {

    constructor() {
        this._borderHitAndShouldScroll = null;
    }

    shouldScroll(direction) {
        return this._borderHitAndShouldScroll === direction;
    }

    startScroll(direction) {
        this._borderHitAndShouldScroll = direction;
    }

    stopScroll() {
        this._borderHitAndShouldScroll = null;
    }
};

exports.KeyListenerClass = class KeyListener {

    constructor({ box, actionFn, bgPlain, bgFocus }) {

        this._render = internals.render;
        this._box = box;
        this._actionFn = actionFn;
        this._bgPlain = bgPlain;
        this._bgFocus = bgFocus;
        this._focusIndexer = new FocusIndexer({
            getNavigationLimit: this._getNavigationLimit.bind(this)
        });
        this._scrollRememberer = new ScrollRememberer();
    }

    _getHeight() {
        return this._box.height - 1;
    }

    _getChildrenLength() {
        return this._box.children.length;
    }

    _doChildrenOverflow() {
        return this._getHeight() - 1 < this._getChildrenLength();
    }

    _getNavigationLimit() {
        return Math.min(this._box.children.length - 1, this._getHeight() - 1);
    }

    _setActiveChildColor(color) {

        const activeChild = this._box.children[this._focusIndexer.get()];
        if (activeChild) {
            activeChild.style.bg = color;
        }
    }

    navigator(key) { 
        
        if (this._box.children.length === 1) {
            return;
        }

        const unfocusedIndex = this._focusIndexer.get();
        const unfocusedChild = this._box.children[unfocusedIndex];

        if (key === 'k') {
            this._focusIndexer.decr();
        }
        else if (key === 'l') {
            this._focusIndexer.incr();
        }

        const focusedIndex = this._focusIndexer.get();
        const focusedChild = this._box.children[focusedIndex];

        unfocusedChild.style.bg = this._bgPlain;
        focusedChild.style.bg = this._bgFocus;

        this._render();
    }

    action({ fromTop } = {}) {

        const index = fromTop ? 1 : this._focusIndexer.get();
        const child = this._box.children[index];
        const content = child && child.content;

        if (!content) {
            return {};
        }

        this._actionFn({
            content,
            index: this._focusIndexer.get(),
            cb: this._focusIndexer.decr.bind(this._focusIndexer)
        });
        this._render();

        return { content, index };
    }

    preFocus() {
        this._setActiveChildColor(this._bgFocus);
    }

    postFocus() {
        this._setActiveChildColor(this._bgPlain);
    }

    changeOrder(key) {

        if (this._box.children.length === 1) {
            return;
        }

        const index1 = this._focusIndexer.get();
        const child1 = this._box.children[index1];

        if (key === 'a') {
            this._focusIndexer.decr();
        }
        else if (key === 'z') {
            this._focusIndexer.incr();
        }

        const index2 = this._focusIndexer.get();
        const child2 = this._box.children[index2];

        child1.style.bg = this._bgPlain;
        child2.style.bg = this._bgFocus;
        [child1.content, child2.content] = [
            `${Utils.getFirstWord(child1.content)} ${Utils.discardFirstWord(child2.content)}`,
            `${Utils.getFirstWord(child2.content)} ${Utils.discardFirstWord(child1.content)}`,
        ];

        this._render();

        return { index1, index2 };
    }

    circleList(key) {

        if (this._box.children.length === 1) {
            return;
        }

        if (key === 'k' && this._scrollRememberer.shouldScroll('up')) {
            const temp = this._box.children[this._box.children.length - 1].content;
            this._box.children.reduceRight((lowerChild, upperChild) => {

                lowerChild.content = upperChild.content;
                return upperChild;
            });
            this._box.children[1].content = temp;
        }
        else if (key === 'l' && this._scrollRememberer.shouldScroll('down')) {
            const temp = this._box.children[1].content;
            this._box.children.reduce((upperChild, lowerChild, index) => {

                if (index > 1) {
                    upperChild.content = lowerChild.content;
                }
                return lowerChild;
            });
            this._box.children[this._box.children.length - 1].content = temp;
        }
        else if (
            (this._focusIndexer.get() === 1 && this._doChildrenOverflow()) ||
            this._focusIndexer.get() === this._getHeight() - 1
        ) {
            this._scrollRememberer.startScroll(key === 'k' ? 'up' : 'down');
        }
        else {
            this._scrollRememberer.stopScroll();
        }

        this._render();
    }
};
