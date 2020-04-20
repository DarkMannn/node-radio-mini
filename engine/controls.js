const AbstractClasses = require('./shared/abstract-classes');
const { keys }  = require('../config');

class Controls extends AbstractClasses.TerminalBox {

    constructor(config) {
        super(config);
        this.setPlaylistTips();
    }

    setPlaylistTips() {
        this.box.content = 
            ` ${keys.FOCUS_QUEUE}  -  focus queue  |  ${keys.SCROLL_UP} - go up\n` +
            ` ${keys.QUEUE_ADD} - enqueue song | ${keys.SCROLL_DOWN} - go down\n`;
    }

    setQueueTips() {
        this.box.content = 
            ` ${keys.MOVE_UP} - move song up   | ${keys.SCROLL_UP} - go up\n` +
            ` ${keys.MOVE_DOWN} - move zong down | ${keys.SCROLL_DOWN} - go down\n` +
            ` ${keys.FOCUS_PLAYLIST} - focus playlist | ${keys.QUEUE_REMOVE} - dequeue son`;
    }
}

module.exports = Controls;
