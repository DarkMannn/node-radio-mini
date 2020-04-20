const NeoBlessed = require('neo-blessed');
const AbstractClasses = require('./shared/abstract-classes');
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

    _createBoxChild(content) {

        return NeoBlessed.box({
            ...this._childConfig,
            top: this.box.children.length - 1,
            content: `- ${content}`
        });
    }

    fillWithItems(items) {
        for (const item of items) {
            this.createBoxChildAndAppend(item);
        }
        this.focus();
    }

    getFocusedSong() {

        const index = this._focusIndexer.get();
        const child = this.box.children[index];
        const content = child && child.content;
        return content;
    }

    _doChildrenOverflow() {
        return this._getHeight() < this._getChildrenLength();
    }

    _circleList(key) {

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

    scroll(scrollKey) {
        super.scroll(scrollKey);
        this._circleList(scrollKey);
    }
}

module.exports = Playlist;
