const NeoBlessed = require('neo-blessed');

/**
 * Class that wraps the neo-blessed screen i.e. the entire view layer
 */
class View {

    constructor() {

        const screen = NeoBlessed.screen({ smartSCR: true });
        screen.title = 'Node Radio Mini';
        screen.key(['escape', 'C-c'], () => process.exit(0));   
        this._screen = screen;
    }

    appendBoxes(boxes) {
        for (const box of boxes) {
            this._screen.append(box);
        }
    }

    render() {
        this._screen.render();
    }
}

module.exports = View;
