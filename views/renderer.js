'use strict';

const NeoBlessed = require('neo-blessed');
const {
    screen,
    playlist,
    queue,
    terminal,
    playlistChildColors,
    queueChildColors
} = require('./screens-config');
const Utils = require('../utils');

const __ = {};
const exp = {};


__.setLibAndParentForAppendingFunction = Lib =>
    parent =>
        config => parent.append(Lib.box(config));
__.setParentToAppendTo = __.setLibAndParentForAppendingFunction(NeoBlessed);
__.appendToPlaylist = __.setParentToAppendTo(playlist);
__.setStyleForChildFactory = style =>
    (content, position) => ({
        width: '100%',
        height: 1,
        left: 0,
        top: position * 1,
        content,
        style
    });

__.createPlaylistChild = __.setStyleForChildFactory(playlistChildColors);

__.createQueueChild = __.setStyleForChildFactory(queueChildColors);

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

exp.render = screen.render.bind(screen);


module.exports = exp;
