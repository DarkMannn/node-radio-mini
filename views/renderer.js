const NeoBlessed = require('neo-blessed');
const Utils = require('../utils');
const KeyListenerFactory = require('./key-listener.factory');
const {
    screen,
    playlist,
    queue,
    playing,
    controls,
    playlistChildConfig,
    queueChildConfig,
    playingChildConfig,
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
internals.appendToPlaylist = internals.setParentForAppendingFunction(playlist);
internals.appendToQueue = internals.setParentForAppendingFunction(queue);
internals.appendToPlaying = internals.setParentForAppendingFunction(playing);
internals.discardFromQueue = internals.setParentForDiscardingFunction(queue);
internals.orderQueue = internals.setParentForOrderingFunction(
    queue,
    (content, index) => `${index}. ${Utils.noFirstWord(content)}`
);
internals.createChildInit = ({ parent, config, prefix, single = false }) =>
    content => ({
        ...config,
        top: single ? 0 : parent.children.length - 1,
        content: (prefix || parent.children.length + '. ') + content
    });
internals.createPlaylistChild = internals.createChildInit({
    parent: playlist,
    config: playlistChildConfig,
    prefix: '- '
});
internals.createQueueChild = internals.createChildInit({ parent: queue, config: queueChildConfig });
internals.createPlayingChild = internals.createChildInit({
    parent: playing,
    config: playingChildConfig,
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
    box: playlist,
    actionFn: Utils.pipe(Utils.pick('content'), Utils.noFirstWord, exports.createChildAndAppendToQueue),
    bgPlain: bgPlPlain,
    bgFocus: bgPlFocus
});
exports.queueKeyListener = KeyListenerFactory({
    box: queue,
    actionFn: ({ index, cb }) => {

        internals.discardFromQueue(index);
        internals.orderQueue();
        cb();
    },
    bgPlain: bgQuPlain,
    bgFocus: bgQuFocus
});
exports.setControlTipsPlaylist = () => { controls.content = controlsPlaylist; };
exports.setControlTipsQueue = () => { controls.content = controlsQueue; };
exports.render = screen.render.bind(screen);
exports.fillPlaylistAndRender = (songs, cb) => {

    internals.fillPlaylist(songs);
    cb();
    exports.render();
};
exports.init = () => {

    screen.append(queue);
    screen.append(playlist);
    screen.append(playing);
    screen.append(controls);

    playlist.focus();
    screen.render();

    return { playlist, queue, playing, controls };
};
