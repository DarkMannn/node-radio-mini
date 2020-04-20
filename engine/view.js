const NeoBlessed = require('neo-blessed');

class View {

    constructor() {

        const screen = NeoBlessed.screen({ smartSCR: true });
        screen.title = 'Node Radio Mini';
        screen.key(['escape', 'C-c'], () => process.exit(0));   
        this._screen = screen;
    }

    appendBoxes(boxes) {
        boxes.forEach((box) => {
            this._screen.append(box);
        });
    }

    render() {
        this._screen.render();
    }
}

module.exports = View;
