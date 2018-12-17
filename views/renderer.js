'use strict';

const NeoBlessed = require('neo-blessed');
const {
    screen,
    playlist,
    queue,
    logger,
    playlistChildConfig,
    queueChildConfig,
    loggerChildConfig
} = require('./screens-config');
const Utils = require('../utils');

const __ = {};
const exp = {};


__.setLibAndParentForAppendingFunction = Lib =>
    parent =>
        config => parent.append(Lib.box(config));
__.setLibAndParentForDiscardingFunction = Lib =>
    parent =>
        () => parent.remove(parent.children[1]);

__.setParentForAppendingFunction = __.setLibAndParentForAppendingFunction(NeoBlessed);
__.setParentForDiscardingFunction = __.setLibAndParentForDiscardingFunction(NeoBlessed);

__.appendToPlaylist = __.setParentForAppendingFunction(playlist);
__.appendToQueue = __.setParentForAppendingFunction(queue);
__.appendToLogger = __.setParentForAppendingFunction(logger);

__.discardFromQueue = __.setParentForDiscardingFunction(queue);

__.setStyleForChildFactory = (config, prefix) =>
    (content, position) => ({
        ...config,
        top: position,
        content: (prefix || position + '. ') + content
    });

__.createPlaylistChild = __.setStyleForChildFactory(playlistChildConfig, '- ');
__.createQueueChild = __.setStyleForChildFactory(queueChildConfig);
__.createLoggerChild = __.setStyleForChildFactory(loggerChildConfig, '> ');

__.createKeyListenerInit = parent =>
    () => {

        let indexPlaylist = 1;
        let limit = parent.children.length - 1;
        let indexQueue = 0;

        const playlistNavigator = key => {

            switch (key) {
            case 'k':
                indexPlaylist && indexPlaylist--;
                exp.createChildAndAppendToLogger(parent.children[indexPlaylist].content, 0),
                exp.render();
                break;
            case 'l':
                (indexPlaylist < limit) && indexPlaylist++;
                exp.createChildAndAppendToLogger(parent.children[indexPlaylist].content, 0),
                exp.render();
                break;
            }
        };
        const playlistEnqueuer = () => {
    
            exp.createChildAndAppendToQueue(parent.children[indexPlaylist].content, indexQueue++);
            exp.render();
        };

        return { playlistNavigator, playlistEnqueuer };
    }; 

exp.createPlaylistKeyListeners = __.createKeyListenerInit(playlist);

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
