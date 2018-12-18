'use strict';

const NeoBlessed = require('neo-blessed');
const {
    screen,
    playlist,
    queue,
    logger,
    playlistChildConfig,
    queueChildConfig,
    loggerChildConfig,
    bgPlFocus,
    bgPlPlain,
    bgQuFocus,
    bgQuPlain
} = require('./screens-config');
const Utils = require('../utils');

const __ = {};
const exp = {};

__.setLibAndParentForAppendingFunction = Lib =>
    parent =>
        config => parent.append(Lib.box(config));
__.setLibAndParentForDiscardingFunction = Lib =>
    parent =>
        (index) => parent.remove(parent.children[index]);
__.setLibAndParentForOrderingFunction = Lib =>
    (parent, contentFn) =>
        () => parent.children.forEach((child, index) => {
            if (index === 0) return;
            child.top = index - 1;
            child.content = contentFn(child.content, index);
        });

__.setParentForAppendingFunction = __.setLibAndParentForAppendingFunction(NeoBlessed);
__.setParentForDiscardingFunction = __.setLibAndParentForDiscardingFunction(NeoBlessed);
__.setParentForOrderingFunction = __.setLibAndParentForOrderingFunction(NeoBlessed);

__.appendToPlaylist = __.setParentForAppendingFunction(playlist);
__.appendToQueue = __.setParentForAppendingFunction(queue);
__.appendToLogger = __.setParentForAppendingFunction(logger);

__.discardFromQueue = __.setParentForDiscardingFunction(queue);

__.orderQueue = __.setParentForOrderingFunction(
    queue,
    (content, index) => `${index}. ${Utils.noFirstWord(content)}`
);

__.createChildInit = (parent, config, prefix) =>
    content => ({
        ...config,
        top: parent.children.length - 1,
        content: (prefix || parent.children.length + '. ') + content
    });

__.createPlaylistChild = __.createChildInit(playlist, playlistChildConfig, '- ');
__.createQueueChild = __.createChildInit(queue, queueChildConfig);
__.createLoggerChild = __.createChildInit(logger, loggerChildConfig, '> ');

__.createKeyListenerInit = (parent, actionFn, bgPlain, bgFocus) =>
    () => {

        const getLimit = () => parent.children.length - 1;
        let focusIndex = 1;

        const navigator = key => {

            if (parent.children.length === 1) return;

            parent.children[focusIndex].style.bg = bgPlain;

            if (key === 'j' && focusIndex > 1) focusIndex--;
            else if (key === 'k' && focusIndex < getLimit()) focusIndex++;

            parent.children[focusIndex].style.bg = bgFocus;
            exp.log(parent.children[focusIndex].content),
            exp.render();
        };
        const action = () => {
    
            actionFn(parent.children[focusIndex].content, focusIndex);
            exp.render();
        };
        const preFocus = () => focusIndex > 0 && parent.children[focusIndex] &&
            (parent.children[focusIndex].style.bg = bgFocus);
        const postFocus = () => parent.children[focusIndex] &&
            (parent.children[focusIndex].style.bg = bgPlain);

        const changeOrder = key => {

            if (parent.children.length === 1) return;

            const child1 = parent.children[focusIndex];
            
            if (key === 'h' && focusIndex > 1) focusIndex--;
            else if (key === 'l' && focusIndex < getLimit()) focusIndex++;
            
            const child2 = parent.children[focusIndex];
            child1.style.bg = bgPlain;
            child2.style.bg = bgFocus;
            [child1.content, child2.content] = [
                `${Utils.firstWord(child1.content)} ${Utils.noFirstWord(child2.content)}`,
                `${Utils.firstWord(child2.content)} ${Utils.noFirstWord(child1.content)}`,
            ];

            exp.log(parent.children[focusIndex].content),
            exp.render();
        };

        return {
            navigator,
            action,
            preFocus,
            postFocus,
            ...parent === queue && { changeOrder }
        };
    };

exp.createChildAndAppendToPlaylist = Utils.pipe(
    __.createPlaylistChild,
    __.appendToPlaylist
);
exp.createChildAndAppendToQueue = Utils.pipe(
    __.createQueueChild,
    __.appendToQueue
);
exp.createChildAndAppendToLogger = Utils.pipe(
    __.createLoggerChild,
    __.appendToLogger
);

exp.createPlaylistKeyListeners = __.createKeyListenerInit(
    playlist,
    Utils.pipe(Utils.noFirstWord, exp.createChildAndAppendToQueue),
    bgPlPlain,
    bgPlFocus
);

exp.createQueueKeyListeners = __.createKeyListenerInit(
    queue,
    (content, index) => (__.discardFromQueue(index), __.orderQueue()),
    bgQuPlain,
    bgQuFocus
);

exp.log = (function initLogger() {
    return content => (logger.children.length = 3, exp.createChildAndAppendToLogger(content));
})();

exp.renderAndReturnWindows = () => {

    screen.append(queue);
    screen.append(playlist);
    screen.append(logger);
    screen.render();
    playlist.focus();

    return { playlist, queue, logger };
};

exp.fillPlaylist = songs => songs.forEach(exp.createChildAndAppendToPlaylist);

exp.render = screen.render.bind(screen);


module.exports = exp;
