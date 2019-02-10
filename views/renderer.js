'use strict';

const NeoBlessed = require('neo-blessed');
const Ut = require('../utils');
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

const __ = {};
const exp = {};


__.setParentForAppendingFunction = parent =>
    config => parent.append(NeoBlessed.box(config));
__.setParentForDiscardingFunction = parent =>
    index => parent.remove(parent.children[index]);
__.setParentForOrderingFunction = (parent, updateContentFn) =>
    () =>
        parent.children.forEach((child, index) => {

            if (index === 0) {
                return;
            }
            child.top = index - 1;
            child.content = updateContentFn(child.content, index);
        });
__.appendToPlaylist = __.setParentForAppendingFunction(playlist);
__.appendToQueue = __.setParentForAppendingFunction(queue);
__.appendToPlaying = __.setParentForAppendingFunction(playing);
__.discardFromQueue = __.setParentForDiscardingFunction(queue);
__.orderQueue = __.setParentForOrderingFunction(
    queue,
    (content, index) => `${index}. ${Ut.noFirstWord(content)}`
);
__.createChildInit = ({ parent, config, prefix, single = false }) =>
    content => ({
        ...config,
        top: single ? 0 : parent.children.length - 1,
        content: (prefix || parent.children.length + '. ') + content
    });
__.createPlaylistChild = __.createChildInit({
    parent: playlist,
    config: playlistChildConfig,
    prefix: '- '
});
__.createQueueChild = __.createChildInit({ parent: queue, config: queueChildConfig });
__.createPlayingChild = __.createChildInit({
    parent: playing,
    config: playingChildConfig,
    prefix: '>>> ',
    single: true
});
__.fillPlaylist = songs => songs.forEach(exp.createChildAndAppendToPlaylist);

exp.createChildAndAppendToPlaylist = Ut.pipe(
    __.createPlaylistChild,
    __.appendToPlaylist
);
exp.createChildAndAppendToQueue = Ut.pipe(
    __.createQueueChild,
    __.appendToQueue
);
exp.createChildAndAppendToPlaying = Ut.pipe(
    __.createPlayingChild,
    __.appendToPlaying
);
exp.playlistKeyListener = KeyListenerFactory({
    box: playlist,
    actionFn: Ut.pipe(Ut.pick('content'), Ut.noFirstWord, exp.createChildAndAppendToQueue),
    bgPlain: bgPlPlain,
    bgFocus: bgPlFocus
});
exp.queueKeyListener = KeyListenerFactory({
    box: queue,
    actionFn: ({ index, cb }) => {

        __.discardFromQueue(index);
        __.orderQueue();
        cb();
    },
    bgPlain: bgQuPlain,
    bgFocus: bgQuFocus
});
exp.setControlTipsPlaylist = () => { controls.content = controlsPlaylist; };
exp.setControlTipsQueue = () => { controls.content = controlsQueue; };
exp.render = screen.render.bind(screen);
exp.fillPlaylistAndRender = (songs, cb) => {

    __.fillPlaylist(songs);
    cb();
    exp.render();
};
exp.init = () => {

    screen.append(queue);
    screen.append(playlist);
    screen.append(playing);
    screen.append(controls);

    playlist.focus();
    screen.render();

    return { playlist, queue, playing, controls };
};


module.exports = exp;
