const Stream = require('./streams');
const View = require('./views');
const Utils = require('./utils');
const { keys } = require('./config');
const { playlist, queue, controls, nowPlaying } = View;

const _addListenersForViewAndStreamLayers = () => {
    
    playlist.box.key(keys.SCROLL_UP, (key) => playlist.navigator(key));
    playlist.box.key(keys.SCROLL_UP, (key) => {
        
        playlist.circleList(key);
        View.render();
    });
    playlist.box.key(keys.SCROLL_DOWN, (key) => playlist.navigator(key));
    playlist.box.key(keys.SCROLL_DOWN, (key) => {
        
        playlist.circleList(key);
        View.render();
    });
    playlist.box.key(keys.QUEUE_ADD, () => {

        const focusedSong = playlist.getFocusedSong();
        const formattedContent = Utils.discardFirstWord(focusedSong);
        queue.createBoxChildAndAppendToBox(formattedContent);
        View.render();
        
        Stream.sendToQueueArray(focusedSong);
    });
    playlist.box.key(keys.FOCUS_QUEUE, () => {

        playlist.postFocus();
        queue.preFocus();
        queue.box.focus();
        controls.setQueueTips();
        View.render();
    });

    const changeOrder = key => {

        const { index1, index2 } = queue.changeOrderQueueWindow(key);
        View.render();
        Stream.changeOrderQueueArray(index1, index2);
    };
    queue.box.key(keys.MOVE_UP, changeOrder);
    queue.box.key(keys.MOVE_DOWN, changeOrder);
    queue.box.key(keys.SCROLL_UP, (key) => {
    
        queue.navigator(key);
        View.render();
    });
    queue.box.key(keys.SCROLL_DOWN, (key) => {
        
        queue.navigator(key);
        View.render();
    });
    queue.box.key(keys.QUEUE_REMOVE, () => {

        const { index } = queue.removeFromQueueWindow();
        if (index) {
            Stream.removeFromQueueArray(index);
        }
        queue.preFocus();
        View.render();
    });
    queue.box.key(keys.FOCUS_PLAYLIST, () => {

        queue.postFocus();
        playlist.preFocus();
        playlist.box.focus();
        controls.setPlaylistTips();
        View.render();
    });

    Stream.radioEvents.on('play', (song) => {

        queue.removeFromQueueWindow({ fromTop: true });
        queue.preFocus();
        nowPlaying.createBoxChildAndAppendToBox(song);
        View.render();
    });
};

exports.start = () => {

    View.init();
    Stream.init();
    _addListenersForViewAndStreamLayers();
    View.firstRender();
    Stream.startStreaming();
};
