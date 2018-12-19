'use strict';

const Stream = require('./streams');
const View = require('./views');
const Ut = require('./utils');

function renderView() {

    const { playlist, queue, controls } = View.renderAndReturnWindows();
    View.fillPlaylist(Ut.readSongs());
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
    
    playlist.key('k', playlistNavigator);
    playlist.key('l', playlistNavigator);
    playlist.key('enter', playlistAction);
    playlist.key('q', () => {
        playlistPost();
        queuePre();
        queue.focus();
        controls.content = View.controlsQueue;
        View.render();
    });
    
    queue.key('k', queueNavigator);
    queue.key('l', queueNavigator);
    queue.key('a', changeOrder);
    queue.key('z', changeOrder);
    queue.key('d', () => {
        queueAction();
        queuePre();
        View.render();
    });
    queue.key('p', () => {
        queuePost();
        playlistPre();
        playlist.focus();
        controls.content = View.controlsPlaylist;
        View.render();
    });
    
    playlistPre();
    playlist.focus();
    View.render();
}

function startStreaming() {
    Stream.startStreaming(Ut.readSong());
}

exports.startEngine = function startEngine() {
    
    renderView();
    startStreaming();
};
