const NeoBlessed = require('neo-blessed');
const AbstractClasses = require('./shared/abstract-classes');
const { keys }  = require('../config');

/**
 * Class in charge of:
 * - view layer for the list of available songs
 */
class Playlist extends AbstractClasses.TerminalItemBox {

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
        const child = this.box.children[this._focusIndexer.get()];
        return child && child.content;
    }

    _doChildrenOverflow() {
        return this._getHeight() < this.box.children.length;
    }

    _circleChildrenUp() {
        const temp = this.box.children[this.box.children.length - 1].content;
        this.box.children.reduceRight((lowerChild, upperChild) => {

            lowerChild.content = upperChild.content;
            return upperChild;
        });
        this.box.children[1].content = temp;
    }

    _circleChildrenDown() {
        const temp = this.box.children[1].content;
        this.box.children.reduce((upperChild, lowerChild, index) => {

            if (index > 1) {
                upperChild.content = lowerChild.content;
            }
            return lowerChild;
        });
        this.box.children[this.box.children.length - 1].content = temp;
    }

    _circleList(key) {
        if (this._focusIndexer.get() === 1 && key === keys.SCROLL_UP) {
            this._circleChildrenUp();
        }
        else if (this._focusIndexer.get() === this._getHeight() && key === keys.SCROLL_DOWN) {
            this._circleChildrenDown();
        }
    }

    scroll(scrollKey) {
        if (this.box.children.length > 2 && this._doChildrenOverflow()) {
            this._circleList(scrollKey); 
        }
        super.scroll(scrollKey);
    }
}

module.exports = Playlist;
