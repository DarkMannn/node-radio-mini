const Stream = require('./streams');
const View = require('./views');
const Utils = require('./utils');
const { keys } = require('./config');
const { playlist, queue, controls, nowPlaying } = View;

const _addListenersForViewAndStreamLayers = () => {
    
    /**
     * listeners for the playlist box
     */
    const playlistOnScroll = (scrollKey) => {
       
        playlist.scroll(scrollKey);
        View.render();
    };
    playlist.box.key(keys.SCROLL_UP, playlistOnScroll);
    playlist.box.key(keys.SCROLL_DOWN, playlistOnScroll);

    playlist.box.key(keys.QUEUE_ADD, () => {

        const focusedSong = playlist.getFocusedSong();
        const formattedSong = Utils.discardFirstWord(focusedSong);
        queue.createBoxChildAndAppend(formattedSong);
        View.render();
        Stream.sendToQueueArray(focusedSong);
    });

    playlist.box.key(keys.FOCUS_QUEUE, () => {

        playlist.blur();
        queue.focus();
        controls.setQueueTips();
        View.render();
    });

    /**
     * listeners for the queue box
     */
    const queueOnScroll = (scrollKey) => {
    
        queue.scroll(scrollKey);
        View.render();
    };
    queue.box.key(keys.SCROLL_UP, queueOnScroll);
    queue.box.key(keys.SCROLL_DOWN, queueOnScroll);

    const queueOnMove = (key) => {

        const { index1, index2 } = queue.changeOrderQueueWindow(key);
        View.render();
        Stream.changeOrderQueueArray(index1, index2);
    };
    queue.box.key(keys.MOVE_UP, queueOnMove);
    queue.box.key(keys.MOVE_DOWN, queueOnMove);

    queue.box.key(keys.QUEUE_REMOVE, () => {

        const { index } = queue.removeFromQueueWindow();
        if (index) {
            Stream.removeFromQueueArray(index);
        }
        queue.focus();
        View.render();
    });

    queue.box.key(keys.FOCUS_PLAYLIST, () => {

        queue.blur();
        playlist.focus();
        controls.setPlaylistTips();
        View.render();
    });

    /**
     * listeners for the Stream events
     */
    Stream.radioEvents.on('play', (song) => {

        queue.removeFromQueueWindow({ fromTop: true });
        playlist.focus();
        nowPlaying.createBoxChildAndAppend(song);
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
