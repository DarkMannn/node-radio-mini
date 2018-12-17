'use strict';

const Stream = require('./streams');
const View = require('./views');


exports.startEngine = () => {
    Stream.loadSongReadStreams();
    Stream.startStreaming();

    const { playlist, queue, logger } = View.renderAndReturnWindows();
    View.fillPlaylist(View.readSongs());
    View.render();

    const {
        navigator: playlistNavigator,
        action: playlistAction
    } = View.createPlaylistKeyListeners();
    const {
        navigator: queueNavigator,
        action: queueAction
    } = View.createQueueKeyListeners();

    // playlist.on('keypress', playlistNavigator);
    playlist.key('k', playlistNavigator);
    playlist.key('l', playlistNavigator);
    playlist.key('enter', playlistAction);
    queue.key('k', queueNavigator);
    queue.key('l', queueNavigator);
    queue.key('d', queueAction);
    queue.key('p', playlist.focus.bind(playlist));
    playlist.key('q', queue.focus.bind(queue));
    playlist.focus();
    View.render();
};
