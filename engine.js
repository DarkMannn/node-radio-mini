'use strict';

const Stream = require('./streams');
const View = require('./views');
const Ut = require('./utils');

const {
    navigator: playlistNavigator,
    action: sendToQueueWindow,
    preFocus: playlistPreFocus,
    postFocus: playlistPostFocus,
    circleList
} = View.playlistKeyListener;
const {
    navigator: queueNavigator,
    action: removeFromQueueWindow,
    preFocus: queuePreFocus,
    postFocus: queuePostFocus,
    changeOrder: changeOrderQueueWindow
} = View.queueKeyListener;


function renderView() {

    const { playlist, queue } = View.init();
    Stream.init();

    playlist.key('k', playlistNavigator);
    playlist.key('k', circleList);
    playlist.key('l', playlistNavigator);
    playlist.key('l', circleList);
    playlist.key('enter', () => {

        const { content } = sendToQueueWindow();
        Stream.sendToQueueArray(content);
    });
    playlist.key('q', () => {

        playlistPostFocus();
        queuePreFocus();
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
        if (index) {
            Stream.removeFromQueueArray(index);
        }
        queuePreFocus();
        View.render();
    });
    queue.key('p', () => {

        queuePostFocus();
        playlistPreFocus();
        playlist.focus();
        View.setControlTipsPlaylist();
        View.render();
    });

    Stream.radioEvents.on('play', () => {

        removeFromQueueWindow({ fromTop: true });
        queuePreFocus();
        View.render();
    });

    View.fillPlaylistAndRender(Ut.readSongs(), playlistPreFocus);
}


exports.startEngine = function startEngine() {

    renderView();
    Stream.startStreaming();
};
