const NeoBlessed = require('neo-blessed');
const AbstractClasses = require('./shared/abstract-classes');

/**
 * Class in charge of:
 * - a view layer for the currently playing song
 */
class NowPlaying extends AbstractClasses.TerminalItemBox {

    _createBoxChild(content) {

        return NeoBlessed.box({
            ...this._childConfig,
            top: 0,
            content: `>>> ${content}`
        });
    }
}

module.exports = NowPlaying;
