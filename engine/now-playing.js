const NeoBlessed = require('neo-blessed');
const AbstractClasses = require('./shared/abstract-classes');

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
