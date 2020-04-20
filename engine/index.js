const { keys } = require('../config');
const Utils = require('../utils');
const Configs = require('./shared/configs');

const View = require('./view');
const Playlist = require('./playlist');
const Queue = require('./queue');
const NowPlaying = require('./now-playing');
const Controls = require('./controls');

const view = new View();
const playlist = new Playlist({
    config: Configs.playlist.config,
    childConfig: Configs.playlist.childConfig,
    bgBlur: Configs.playlist.bgBlur,
    bgFocus: Configs.playlist.bgFocus
});
const queue = new Queue({
    config: Configs.queue.config,
    childConfig: Configs.queue.childConfig,
    bgBlur: Configs.queue.bgBlur,
    bgFocus: Configs.queue.bgFocus
});
const nowPlaying = new NowPlaying({
    config: Configs.nowPlaying.config,
    childConfig: Configs.nowPlaying.childConfig
});
const controls = new Controls(Configs.controls.config);

const _addPlaylistAndQueueListeners = () => {
    
    /**
     * listeners for the playlist box (playlist's view layer events)
     */
    const playlistOnScroll = (scrollKey) => {
       
        playlist.scroll(scrollKey);
        view.render();
    };
    playlist.box.key(keys.SCROLL_UP, playlistOnScroll);
    playlist.box.key(keys.SCROLL_DOWN, playlistOnScroll);

    playlist.box.key(keys.QUEUE_ADD, () => {

        const focusedSong = playlist.getFocusedSong();
        const formattedSong = Utils.discardFirstWord(focusedSong);
        queue.createAndAppendToQueue(formattedSong);
        view.render();
    });

    playlist.box.key(keys.FOCUS_QUEUE, () => {

        playlist.blur();
        queue.focus();
        controls.setQueueTips();
        view.render();
    });

    /**
     * listeners for the queue box (queue's view layer events)
     */
    const queueOnScroll = (scrollKey) => {
    
        queue.scroll(scrollKey);
        view.render();
    };
    queue.box.key(keys.SCROLL_UP, queueOnScroll);
    queue.box.key(keys.SCROLL_DOWN, queueOnScroll);

    const queueOnMove = (key) => {

        queue.changeOrderQueue(key);
        view.render();
    };
    queue.box.key(keys.MOVE_UP, queueOnMove);
    queue.box.key(keys.MOVE_DOWN, queueOnMove);

    queue.box.key(keys.QUEUE_REMOVE, () => {

        queue.removeFromQueue();
        queue.focus();
        view.render();
    });

    queue.box.key(keys.FOCUS_PLAYLIST, () => {

        queue.blur();
        playlist.focus();
        controls.setPlaylistTips();
        view.render();
    });

    /**
     * listeners for the queue streams (queue's stream events)
     */
    queue.stream.on('play', (song) => {

        playlist.focus();
        nowPlaying.createBoxChildAndAppend(song);
        view.render();
    });
};

exports.start = () => {

    _addPlaylistAndQueueListeners();
    playlist.fillWithItems(Utils.readSongs());
    view.appendBoxes([playlist.box, queue.box, nowPlaying.box, controls.box]);
    view.render();
    queue.init();
    queue.startStreaming();
};

exports.queue = queue;
exports.playlist = playlist;
