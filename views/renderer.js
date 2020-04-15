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
    playingBoxChildConfig,
    bgPlFocus,
    bgPlPlain,
    bgQuFocus,
    bgQuPlain,
    controlsPlaylist,
    controlsQueue
} = require('./screens-config');
const internals = {};

internals.setParentForAppendingFunction = parent =>
    config => parent.append(NeoBlessed.box(config));
internals.setParentForDiscardingFunction = parent =>
    index => parent.remove(parent.children[index]);
internals.setParentForOrderingFunction = (parent, updateContentFn) =>
    () =>
        parent.children.forEach((child, index) => {

            if (index === 0) {
                return;
            }
            child.top = index - 1;
            child.content = updateContentFn(child.content, index);
        });
internals.appendToPlaylist = internals.setParentForAppendingFunction(PlaylistBox);
internals.appendToQueue = internals.setParentForAppendingFunction(QueueBox);
internals.appendToPlaying = internals.setParentForAppendingFunction(NowPlayingBox);
internals.discardFromQueue = internals.setParentForDiscardingFunction(QueueBox);
internals.orderQueue = internals.setParentForOrderingFunction(
    QueueBox,
    (content, index) => `${index}. ${Utils.discardFirstWord(content)}`
);
internals.createChildInit = ({ parent, config, prefix, single = false }) =>
    content => ({
        ...config,
        top: single ? 0 : parent.children.length - 1,
        content: (prefix || parent.children.length + '. ') + content
    });
internals.createPlaylistChild = internals.createChildInit({
    parent: PlaylistBox,
    config: playlistBoxChildConfig,
    prefix: '- '
});
internals.createQueueChild = internals.createChildInit({ parent: QueueBox, config: queueBoxChildConfig });
internals.createPlayingChild = internals.createChildInit({
    parent: NowPlayingBox,
    config: playingBoxChildConfig,
    prefix: '>>> ',
    single: true
});
internals.fillPlaylist = songs => songs.forEach(exports.createChildAndAppendToPlaylist);

exports.createChildAndAppendToPlaylist = Utils.pipe(
    internals.createPlaylistChild,
    internals.appendToPlaylist
);
exports.createChildAndAppendToQueue = Utils.pipe(
    internals.createQueueChild,
    internals.appendToQueue
);
exports.createChildAndAppendToPlaying = Utils.pipe(
    internals.createPlayingChild,
    internals.appendToPlaying
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

        internals.discardFromQueue(index);
        internals.orderQueue();
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
