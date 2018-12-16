'use strict';

const NeoBlessed = require('neo-blessed');
const {
    screen,
    playlist,
    queue,
    terminal,
    playlistChildConfig,
    queueChildConfig,
    terminalChildConfig
} = require('./screens-config');
const Utils = require('../utils');

const __ = {};
const exp = {};


__.setLibAndParentForAppendingFunction = Lib =>
    parent =>
        config => parent.append(Lib.box(config));
__.setLibAndParentForDiscardingFunction = Lib =>
    parent => parent.remove(parent.children[0]);

__.setParentForAppendingFunction = __.setLibAndParentForAppendingFunction(NeoBlessed);
__.setParentForDiscardingFunction = __.setLibAndParentForDiscardingFunction(NeoBlessed);

__.appendToPlaylist = __.setParentForAppendingFunction(playlist);
__.appendToQueue = __.setParentForAppendingFunction(queue);
__.appendToTerminal = __.setParentForAppendingFunction(terminal);

__.discardFromQueue = __.setParentForDiscardingFunction(queue);

__.setStyleForChildFactory = (config, prefix) =>
    (content, position) => ({
        ...config,
        top: position,
        content: prefix || position + content
    });

__.createPlaylistChild = __.setStyleForChildFactory(playlistChildConfig, '- ');
__.createQueueChild = __.setStyleForChildFactory(queueChildConfig);
__.createTerminalChild = __.setStyleForChildFactory(terminalChildConfig, '> ');

__.createChildAndAppendToPlaylist = Utils.pipe(
    __.createPlaylistChild,
    __.appendToPlaylist
);

exp.renderAndReturnWindows = () => {

    screen.append(playlist);
    screen.append(queue);
    screen.append(terminal);
    screen.render();
    playlist.focus();

    return { playlist, queue, terminal };
};

exp.fillPlaylist = songs => songs.forEach(__.createChildAndAppendToPlaylist);

exp.appendToQueue = __.appendToQueue;
exp.discardFromQueue = __.discardFromQueue;

exp.appendToTerminal = __.appendToTerminal;

exp.render = screen.render.bind(screen);


module.exports = exp;
