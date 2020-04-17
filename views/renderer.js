const NeoBlessed = require('neo-blessed');
const Utils = require('../utils');
const { KeyListenerFactory, KeyListenerClass } = require('./key-listener.factory');
const {
    Screen,
    PlaylistBox,
    QueueBox,
    NowPlayingBox,
    ControlsBox,
    playlistBoxChildConfig,
    queueBoxChildConfig,
    nowPlayingBoxChildConfig,
    bgPlFocus,
    bgPlPlain,
    bgQuFocus,
    bgQuPlain,
    controlsPlaylist,
    controlsQueue
} = require('./screens-config');
const internals = {};

////////////

internals.boxChildCommonConfig = {
    width: '100%',
    height: 1,
    left: 0
};

///////////

internals.appendToPlaylistBox = (config) => PlaylistBox.append(NeoBlessed.box(config));
internals.appendToQueueBox = (config) => QueueBox.append(NeoBlessed.box(config));
internals.appendToNowPlayingBox = (config) => NowPlayingBox.append(NeoBlessed.box(config));

internals.discardFromQueueBox = (index) => QueueBox.remove(QueueBox.children[index]);
internals.orderQueueBox = () => QueueBox.children.forEach((child, index) => {

    if (index !== 0) {
        child.top = index - 1;
        child.content = `${index}. ${Utils.discardFirstWord(child.content)}`;
    }
});

internals.createPlaylistBoxChild = (content) => ({
    ...playlistBoxChildConfig,
    top: PlaylistBox.children.length - 1,
    content: `- ${content}`
});
internals.createQueueBoxChild = (content) => ({
    ...queueBoxChildConfig,
    top: QueueBox.children.length - 1,
    content: `${QueueBox.children.length}. ${content}`
});
internals.createNowPlayingBoxChild = (content) => ({
    ...nowPlayingBoxChildConfig,
    top: 0,
    content: `>>> ${content}`
});

internals.fillPlaylist = songs => songs.forEach(exports.createChildAndAppendToPlaylist);

exports.createChildAndAppendToPlaylist = Utils.pipe(
    internals.createPlaylistBoxChild,
    internals.appendToPlaylistBox
);
exports.createChildAndAppendToQueue = Utils.pipe(
    internals.createQueueBoxChild,
    internals.appendToQueueBox
);
exports.createChildAndAppendToPlaying = Utils.pipe(
    internals.createNowPlayingBoxChild,
    internals.appendToNowPlayingBox
);
exports.playlistKeyListener = KeyListenerFactory({
    box: PlaylistBox,
    actionFn: Utils.pipe(Utils.pick('content'), Utils.discardFirstWord, exports.createChildAndAppendToQueue),
    bgPlain: bgPlPlain,
    bgFocus: bgPlFocus
});
exports.queueKeyListener = KeyListenerFactory({
    box: QueueBox,
    actionFn: ({ index, cb }) => {

        internals.discardFromQueueBox(index);
        internals.orderQueueBox();
        cb();
    },
    bgPlain: bgQuPlain,
    bgFocus: bgQuFocus
});
exports.setControlTipsPlaylist = () => { ControlsBox.content = controlsPlaylist; };
exports.setControlTipsQueue = () => { ControlsBox.content = controlsQueue; };
exports.render = Screen.render.bind(Screen);
exports.fillPlaylistAndRender = (songs, cb) => {

    internals.fillPlaylist(songs);
    cb();
    exports.render();
};
exports.init = () => {

    Screen.append(QueueBox);
    Screen.append(exports.playlist.box);
    Screen.append(NowPlayingBox);
    Screen.append(ControlsBox);

    exports.playlist.box.focus();
    Screen.render();

    return { PlaylistBox, QueueBox, NowPlayingBox, ControlsBox };
};

/////////////////////

class Box {

    constructor() {

        this.render = Screen.render.bind(Screen);


        const playlistKeyListener = KeyListenerFactory({
            box: this.box,
            actionFn: Utils.pipe(Utils.pick('content'), Utils.discardFirstWord, exports.createChildAndAppendToQueue),
            bgPlain: bgPlPlain,
            bgFocus: bgPlFocus
        });
        this.navigator = playlistKeyListener.navigator;
        this.sendToQueueWindow = playlistKeyListener.action;
        this.preFocus = playlistKeyListener.preFocus;
        this.postFocus = playlistKeyListener.postFocus;
        this.circleList = playlistKeyListener.circleList;
    }

    createBoxChild(content) {

        return NeoBlessed.box({
            ...this.boxChildConfig,
            top: this.box.children.length - 1,
            content: `- ${content}`
        });
    }

    createBoxChildAndAppendToBox(content) {

        const boxChild = this.createBoxChild(content);
        this.box.append(boxChild);
    }

    fillWithItems(items) {

        for (const item of items) {
            this.createBoxChildAndAppendToBox(item);
        }
    }

    fillWithItemsAndRender(items) {

        this.fillWithItems(items);
        this.preFocus();
        this.render();
    }
}

class Playlist {

    constructor() {

        this.render = Screen.render.bind(Screen);
        this.box = NeoBlessed.box({
            top: 0,
            left: 0,
            width: '50%',
            height: '100%',
            scrollable: true,
            label: 'Playlist',
            border: {
                type: 'line'
            },
            style: {
                fg: 'white',
                bg: 'green',
                border: {
                    fg: '#f0f0f0'
                }
            }
        });

        this.boxChildConfig = {
            ...internals.boxChildCommonConfig,
            fg: 'white',
            bg: 'green'
        };

        const playlistKeyListener = new KeyListenerClass({
            box: this.box,
            actionFn: Utils.pipe(Utils.pick('content'), Utils.discardFirstWord, exports.createChildAndAppendToQueue),
            bgPlain: bgPlPlain,
            bgFocus: bgPlFocus
        });

        this.navigator = playlistKeyListener.navigator.bind(playlistKeyListener);
        this.sendToQueueWindow = playlistKeyListener.action.bind(playlistKeyListener);
        this.preFocus = playlistKeyListener.preFocus.bind(playlistKeyListener);
        this.postFocus = playlistKeyListener.postFocus.bind(playlistKeyListener);
        this.circleList = playlistKeyListener.circleList.bind(playlistKeyListener);
    }

    createBoxChild(content) {

        return NeoBlessed.box({
            ...this.boxChildConfig,
            top: this.box.children.length - 1,
            content: `- ${content}`
        });
    }

    createBoxChildAndAppendToBox(content) {

        const boxChild = this.createBoxChild(content);
        this.box.append(boxChild);
    }

    fillWithItems(items) {

        for (const item of items) {
            this.createBoxChildAndAppendToBox(item);
        }
    }

    fillWithItemsAndRender(items) {

        this.fillWithItems(items);
        this.preFocus();
        this.render();
    }
}

exports.playlist = new Playlist();
