'use strict';

const { startStreaming } = require('./streaming');
const { renderAndReturnWindows, renderSongs, renderRadio } = require('./views');


exports.startEngine = () => {

    startStreaming();
    const { playlist, queue, terminal } = renderAndReturnWindows();
    renderSongs(playlist, queue);
    renderRadio();
};
