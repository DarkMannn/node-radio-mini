const NeoBlessed = require('neo-blessed');
const AbstractClasses = require('./abstract-classes');
const Utils = require('../utils');
const { keys }  = require('../config');

class _ScrollRememberer {

    constructor() {
        this._borderHitAndShouldScroll = null;
    }

    shouldScrollUp() {
        return this._borderHitAndShouldScroll === 'up';
    }

    shouldScrollDown() {
        return this._borderHitAndShouldScroll === 'down';
    }

    startScrollUp() {
        this._borderHitAndShouldScroll = 'up';
    }

    startScrollDown() {
        this._borderHitAndShouldScroll = 'down';
    }

    stopScroll() {
        this._borderHitAndShouldScroll = null;
    }
}

class Playlist extends AbstractClasses.TerminalItemBox {

    constructor(params) {

        super(params);
        this._scrollRememberer = new _ScrollRememberer();
    }

    _doChildrenOverflow() {
        return this._getHeight() < this._getChildrenLength();
    }

    _createBoxChild(content) {

        return NeoBlessed.box({
            ...this._childConfig,
            top: this.box.children.length - 1,
            content: `- ${content}`
        });
    }

    _fillWithItems(items) {

        for (const item of items) {
            this.createBoxChildAndAppendToBox(item);
        }
    }

    fillWithItemsAndRender(items) {

        this._fillWithItems(items);
        this.preFocus();
    }

    getFocusedSong() {

        const index = this._focusIndexer.get();
        const child = this.box.children[index];
        const content = child && child.content;
        return content;
    }

    circleList(key) {

        if (this.box.children.length === 1) {
            return;
        }

        if (key === keys.SCROLL_UP && this._scrollRememberer.shouldScrollUp()) {
            const temp = this.box.children[this.box.children.length - 1].content;
            this.box.children.reduceRight((lowerChild, upperChild) => {

                lowerChild.content = upperChild.content;
                return upperChild;
            });
            this.box.children[1].content = temp;
        }
        else if (key === keys.SCROLL_DOWN && this._scrollRememberer.shouldScrollDown()) {
            const temp = this.box.children[1].content;
            this.box.children.reduce((upperChild, lowerChild, index) => {

                if (index > 1) {
                    upperChild.content = lowerChild.content;
                }
                return lowerChild;
            });
            this.box.children[this.box.children.length - 1].content = temp;
        }
        else if (
            (this._focusIndexer.get() === 1 && this._doChildrenOverflow()) ||
            this._focusIndexer.get() === this._getHeight()
        ) {
            key === keys.SCROLL_UP
                ? this._scrollRememberer.startScrollUp()
                : this._scrollRememberer.startScrollDown();
        }
        else {
            this._scrollRememberer.stopScroll();
        }
    }
}

class Queue extends AbstractClasses.TerminalItemBox {

    _createBoxChild(content) {

        return NeoBlessed.box({
            ...this._childConfig,
            top: this.box.children.length - 1,
            content: `${this.box.children.length}. ${content}`
        });
    }

    _discardFromBox(index) {
        this.box.remove(this.box.children[index]);
    }

    _orderBoxChildren() {
        
        this.box.children.forEach((child, index) => {

            if (index !== 0) {
                child.top = index - 1;
                child.content = `${index}. ${Utils.discardFirstWord(child.content)}`;
            }
        });
    }

    removeFromQueueWindow({ fromTop } = {}) {

        const index = fromTop ? 1 : this._focusIndexer.get();
        const child = this.box.children[index];
        const content = child && child.content;

        if (!content) {
            return {};
        }

        this._discardFromBox(index);
        this._orderBoxChildren();
        this._focusIndexer.decr();

        return { content, index };
    }

    changeOrderQueueWindow(key) {

        if (this.box.children.length === 1) {
            return;
        }

        const index1 = this._focusIndexer.get();
        const child1 = this.box.children[index1];

        if (key === keys.MOVE_UP) {
            this._focusIndexer.decr();
        }
        else if (key === keys.MOVE_DOWN) {
            this._focusIndexer.incr();
        }

        const index2 = this._focusIndexer.get();
        const child2 = this.box.children[index2];

        child1.style.bg = this._bgPlain;
        child2.style.bg = this._bgFocus;
        [child1.content, child2.content] = [
            `${Utils.getFirstWord(child1.content)} ${Utils.discardFirstWord(child2.content)}`,
            `${Utils.getFirstWord(child2.content)} ${Utils.discardFirstWord(child1.content)}`,
        ];

        return { index1, index2 };
    }
}

class NowPlaying extends AbstractClasses.TerminalItemBox {

    _createBoxChild(content) {

        return NeoBlessed.box({
            ...this._childConfig,
            top: 0,
            content: `>>> ${content}`
        });
    }
}

class Controls extends AbstractClasses.TerminalBox {

    constructor(config) {

        super(config);
        this.setPlaylistTips();
    }

    setPlaylistTips() {
        
        this.box.content = 
            ` ${keys.FOCUS_QUEUE}  -  focus queue  |  ${keys.SCROLL_UP} - go up\n` +
            `${keys.QUEUE_ADD} - enqueue song | ${keys.SCROLL_DOWN} - go down\n`;
    }

    setQueueTips() {
        
        this.box.content = 
            ` ${keys.MOVE_UP} - move song up   | ${keys.SCROLL_UP} - go up\n` +
            ` ${keys.MOVE_DOWN} - move zong down | ${keys.SCROLL_DOWN} - go down\n` +
            ` ${keys.FOCUS_PLAYLIST} - focus playlist | ${keys.QUEUE_REMOVE} - dequeue son`;
    }
}

module.exports = {
    Playlist,
    Queue,
    NowPlaying,
    Controls
};
