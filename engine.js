'use strict';

const Stream = require('./streams');
const View = require('./views');


exports.startEngine = () => {

    Stream.startStreaming(Stream.getSongReadStreams());
    const { playlist, queue, terminal } = View.renderAndReturnWindows();
    View.fillPlaylist(View.readSongs());
    View.render();
};
