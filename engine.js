'use strict';

const Stream = require('./streams');
const View = require('./views');
const Ut = require('./utils');

function renderView() {

    const { playlist, queue } = View.initAndReturnWindows();

    const {
        navigator: playlistNavigator,
        action: sendToQueueWindow,
        preFocus: playlistPre,
        postFocus: playlistPost
    } = View.createPlaylistKeyListeners();
    const {
        navigator: queueNavigator,
        action: removeFromQueueWindow,
        preFocus: queuePre,
        postFocus: queuePost,
        changeOrder: changeOrderQueueWindow
    } = View.createQueueKeyListeners();

    playlist.key('k', playlistNavigator);
    playlist.key('l', playlistNavigator);
    playlist.key('enter', () => {

        const { content } = sendToQueueWindow();
        Stream.sendToQueueArray(content);
    });
    playlist.key('q', () => {

        playlistPost();
        queuePre();
        queue.focus();
        View.setControlTipsQueue();
        View.render();
    });
    
    const changeOrder = key => {

        const { index1, index2 } = changeOrderQueueWindow(key);
        Stream.changeOrderQueueArray(index1, index2);
    };
    queue.key('a', changeOrder);
    queue.key('z', changeOrder);
    queue.key('k', queueNavigator);
    queue.key('l', queueNavigator);
    queue.key('d', () => {

        const { index } = removeFromQueueWindow();
        Stream.removeFromQueueArray(index);
        queuePre();
        View.render();
    });
    queue.key('p', () => {

        queuePost();
        playlistPre();
        playlist.focus();
        View.setControlTipsPlaylist();
        View.render();
    });

    Stream.radioEvents.on('play', () => {

        removeFromQueueWindow({ fromTop: true });
        queuePre();
        View.render();
    });
    
    View.fillPlaylistAndRender(Ut.readSongs(), playlistPre);
}

function startStreaming() {
    Stream.startStreaming(Ut.readSong());
}

exports.startEngine = function startEngine() {
    
    renderView();
    startStreaming();
};
