const NeoBlessed = require('neo-blessed');
const Utils = require('../utils');
const KeyListenerFactory = require('./key-listener.factory');
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
    Screen.append(PlaylistBox);
    Screen.append(NowPlayingBox);
    Screen.append(ControlsBox);

    PlaylistBox.focus();
    Screen.render();

    return { PlaylistBox, QueueBox, NowPlayingBox, ControlsBox };
};
