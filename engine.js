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
        action: playlistAction,
        preFocus: playlistPre,
        postFocus: playlistPost
    } = View.createPlaylistKeyListeners();
    const {
        navigator: queueNavigator,
        action: queueAction,
        preFocus: queuePre,
        postFocus: queuePost,
        changeOrder
    } = View.createQueueKeyListeners();

    playlist.key('j', playlistNavigator);
    playlist.key('k', playlistNavigator);
    playlist.key('enter', playlistAction);
    queue.key('j', queueNavigator);
    queue.key('k', queueNavigator);
    queue.key('h', changeOrder);
    queue.key('l', changeOrder);
    queue.key('d', () => {
        queueAction();
        queuePre();
        View.render();
    });
    queue.key('p', () => {
        queuePost();
        playlistPre();
        playlist.focus();
        View.render();
    });
    playlist.key('q', () => {
        playlistPost();
        queuePre();
        queue.focus();
        View.render();
    });
    playlistPre();
    playlist.focus();
    View.render();
};
