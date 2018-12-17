'use strict';

const Stream = require('./streams');
const View = require('./views');


exports.startEngine = () => {
    Stream.loadSongReadStreams();
    Stream.startStreaming();

    const { playlist, queue, logger } = View.renderAndReturnWindows();
    View.fillPlaylist(View.readSongs());
    View.render();

    const { playlistNavigator, playlistEnqueuer } = View.createPlaylistKeyListeners();
    playlist.on('keypress', playlistNavigator);
    playlist.key('enter', playlistEnqueuer);
    playlist.focus();
    View.render();
};
