const NeoBlessed = require('neo-blessed');
const Configs = require('./configs');
const Classes = require('./classes');
const Utils = require('../utils');

const screen = NeoBlessed.screen({ smartSCR: true });
screen.title = 'Node Radio Mini';
screen.key(['escape', 'C-c'], (ch, key) => process.exit(0));

exports.render = screen.render.bind(screen);

exports.playlist = new Classes.Playlist({
    config: Configs.playlist.config,
    childConfig: Configs.playlist.childConfig,
    bgPlain: Configs.playlist.bgPlain,
    bgFocus: Configs.playlist.bgFocus
});

exports.queue = new Classes.Queue({
    config: Configs.queue.config,
    childConfig: Configs.queue.childConfig,
    bgPlain: Configs.queue.bgPlain,
    bgFocus: Configs.queue.bgFocus
});

exports.nowPlaying = new Classes.NowPlaying({
    config: Configs.nowPlaying.config,
    childConfig: Configs.nowPlaying.childConfig
});

exports.controls = new Classes.Controls(Configs.controls.config);

exports.init = () => {

    screen.append(exports.queue.box);
    screen.append(exports.playlist.box);
    screen.append(exports.nowPlaying.box);
    screen.append(exports.controls.box);
};

exports.firstRender = () => {

    exports.playlist.fillWithItemsAndRender(Utils.readSongs());
    exports.playlist.box.focus();
    exports.render();
};
