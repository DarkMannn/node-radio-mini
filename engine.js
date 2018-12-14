const { startStreaming } = require('./streaming');
const { renderAndReturnWindows, renderSongs, render } = require('./views');


exports.startEngine = () => {

    startStreaming();
    const { playlist, queue, terminal } = renderAndReturnWindows();
    renderSongs(playlist, queue);
    render();
};
