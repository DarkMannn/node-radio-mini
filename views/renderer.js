'use strict';

const NeoBlessed = require('neo-blessed');
const Ut = require('../utils');
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
    () => parent.children.forEach((child, index) => {
        if (index === 0) return;
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

__.createKeyListenerInit = ({ parent, actionFn, bgPlain, bgFocus }) =>
    function keyListener() {

        const getLimit = () => parent.children.length - 1;
        const focusIndex = {
            index: 1,
            get: () => focusIndex.index,
            incr: () => ++focusIndex.index,
            decr: () => --focusIndex.index
        };

        const navigator = key => {

            if (parent.children.length === 1) return;

            parent.children[focusIndex.get()].style.bg = bgPlain;

            if (key === 'k' && focusIndex.get() > 1) {
                focusIndex.decr();
            }
            else if (key === 'l' && focusIndex.get() < getLimit()) {
                focusIndex.incr();
            }

            parent.children[focusIndex.get()].style.bg = bgFocus;
            exp.createChildAndAppendToPlaying(parent.children[focusIndex.get()].content),
            exp.render();
        };
        const action = () => {

            const child = parent.children[focusIndex.get()];
            const content = child && child.content; 
            if (content) {
                actionFn(content, focusIndex);
            }
            exp.render();
        };
        const preFocus = () => {

            if (focusIndex.get() > 0 && parent.children[focusIndex.get()]) {
                parent.children[focusIndex.get()].style.bg = bgFocus;
            }
        };
        const postFocus = () => {

            if (parent.children[focusIndex.get()]) {
                (parent.children[focusIndex.get()].style.bg = bgPlain);
            }
        };
        const changeOrder = key => {

            if (parent.children.length === 1) {
                return;
            }

            const child1 = parent.children[focusIndex.get()];
            
            if (key === 'a' && focusIndex.get() > 1) {
                focusIndex.decr();
            }
            else if (key === 'z' && focusIndex.get() < getLimit()) {
                focusIndex.incr();
            }
            
            const child2 = parent.children[focusIndex.get()];

            child1.style.bg = bgPlain;
            child2.style.bg = bgFocus;
            [child1.content, child2.content] = [
                `${Ut.firstWord(child1.content)} ${Ut.noFirstWord(child2.content)}`,
                `${Ut.firstWord(child2.content)} ${Ut.noFirstWord(child1.content)}`,
            ];

            exp.render();
        };

        return {
            navigator,
            action,
            preFocus,
            postFocus,
            ...(parent === queue && { changeOrder })
        };
    };

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

exp.createPlaylistKeyListeners = __.createKeyListenerInit({
    parent: playlist,
    actionFn: Ut.pipe(Ut.noFirstWord, exp.createChildAndAppendToQueue),
    bgPlain: bgPlPlain,
    bgFocus: bgPlFocus
});

exp.createQueueKeyListeners = __.createKeyListenerInit({
    parent: queue,
    actionFn: (content, focusIndex) => {
        
        __.discardFromQueue(focusIndex.get());
        focusIndex.get() > 1 && focusIndex.decr();
        __.orderQueue();
    },
    bgPlain: bgQuPlain,
    bgFocus: bgQuFocus
});

exp.setControlTipsPlaylist = () => controls.content = controlsPlaylist;
exp.setControlTipsQueue = () => controls.content = controlsQueue;

exp.render = screen.render.bind(screen);

exp.fillPlaylistAndRender = (songs, cb) => {

    __.fillPlaylist(songs);
    cb();
    exp.render();
};

exp.initAndReturnWindows = () => {

    screen.append(queue);
    screen.append(playlist);
    screen.append(playing);
    screen.append(controls);

    playlist.focus();
    screen.render();

    return { playlist, queue, playing, controls };
};


module.exports = exp;
