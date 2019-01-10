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
        postFocus: playlistPost,
        circleList
    } = View.playlistKeyListener;
    const {
        navigator: queueNavigator,
        action: removeFromQueueWindow,
        preFocus: queuePre,
        postFocus: queuePost,
        changeOrder: changeOrderQueueWindow
    } = View.queueKeyListener;

    // temp
    const log = () => {
        Stream.log(
            `Queue window: ${queue.length && queue.children.reduce((acc, child, i) => i > 0 ? (acc + ' ' + child.content) : '', '')}`
        );
        Stream.log(
            `Queue array: ${Stream.songs.length && Stream.songs.reduceRight((acc, child) => acc + ' ' + child)}`
        );
        Stream.log('\n');
    };
    // temp
    playlist.key('k', playlistNavigator);
    playlist.key('k', circleList);
    playlist.key('l', playlistNavigator);
    playlist.key('l', circleList);
    playlist.key('enter', () => {

        const { content } = sendToQueueWindow();
        Stream.sendToQueueArray(content);
        log(); // temp
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
    queue.key('a', key => (changeOrder(key), log()));
    queue.key('z', key => (changeOrder(key), log()));
    queue.key('k', queueNavigator);
    queue.key('l', queueNavigator);
    queue.key('d', () => {

        const { index } = removeFromQueueWindow();
        if (index) {
            Stream.removeFromQueueArray(index);
        }
        queuePre();
        View.render();
        log(); // temp
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

module.exports = function startEngine() {
    
    renderView();
    startStreaming();
};
