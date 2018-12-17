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

__.setParentForAppendingFunction = __.setLibAndParentForAppendingFunction(NeoBlessed);
__.setParentForDiscardingFunction = __.setLibAndParentForDiscardingFunction(NeoBlessed);

__.appendToPlaylist = __.setParentForAppendingFunction(playlist);
__.appendToQueue = __.setParentForAppendingFunction(queue);
__.appendToLogger = __.setParentForAppendingFunction(logger);

__.discardFromQueue = __.setParentForDiscardingFunction(queue);

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

            parent.children[focusIndex].style.bg = bgPlain;

            if (key === 'k' && focusIndex > 1) focusIndex--;
            else if (key === 'l' && focusIndex < getLimit()) focusIndex++;

            parent.children[focusIndex].style.bg = bgFocus;
            exp.log(parent.children[focusIndex].content),
            exp.render();
        };
        const action = () => {
    
            actionFn(parent.children[focusIndex].content, focusIndex);
            exp.render();
        };

        return { navigator, action };
    }; 

exp.createPlaylistKeyListeners = __.createKeyListenerInit(
    playlist,
    item => exp.createChildAndAppendToQueue(item.substring(item.indexOf(' ') + 1)),
    bgPlPlain,
    bgPlFocus
);

exp.createQueueKeyListeners = __.createKeyListenerInit(
    queue,
    (content, index) => __.discardFromQueue(index),
    bgQuPlain,
    bgQuFocus
);

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

exp.log = (function initLogger() {
    let indexLogger = 0;
    return content => exp.createChildAndAppendToLogger(content, indexLogger++ % 6); // Temporary
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

exp.appendToQueue = __.appendToQueue;
exp.discardFromQueue = __.discardFromQueue;

exp.appendToLogger = __.appendToLogger;

exp.render = screen.render.bind(screen);


module.exports = exp;
