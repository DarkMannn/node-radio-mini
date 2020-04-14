const NeoBlessed = require('neo-blessed');
const internals = {};

internals.childConfig = {
    width: '100%',
    height: 1,
    left: 0
};
internals.playlistChildColors = {
    fg: 'cyan',
    bg: 'grey'
};
internals.queueChildColors = {
    fg: 'white',
    bg: 'blue'
};
internals.playingChildColors = {
    fg: 'green',
    bg: 'black'
};

exports.controlsPlaylist = '  q  -  focus queue  |  k - go up\n' +
    'enter - enqueue song |  l - go down\n';
exports.controlsQueue = 'p - focus playlist | k - go up\n' +
    'd -  dequeue song  | l - go down\n' +
    'a,z - move song up or down the queue';

exports.bgPlFocus = 'black';
exports.bgPlPlain = 'grey';
exports.bgQuFocus = 'black';
exports.bgQuPlain = 'blue';

exports.screen = NeoBlessed.screen({ smartSCR: true });
exports.screen.title = 'Node Radio Mini';
exports.screen.key(['escape', 'C-c'], (ch, key) => process.exit(0));

exports.playlist = NeoBlessed.box({
    top: 0,
    left: 0,
    width: '50%',
    height: '100%',
    scrollable: true,
    label: 'Playlist',
    border: {
        type: 'line'
    },
    style: {
        fg: 'white',
        bg: 'grey',
        border: {
            fg: '#f0f0f0'
        }
    }
});

exports.queue = NeoBlessed.box({
    top: 0,
    left: '50%',
    width: '50%',
    height: '70%',
    scrollable: true,
    label: 'Queue',
    border: {
        type: 'line'
    },
    style: {
        fg: 'white',
        bg: 'blue',
        border: {
            fg: '#f0f0f0'
        }
    }
});

exports.playing = NeoBlessed.box({
    top: '70%',
    left: '50%',
    width: '50%',
    height: 3,
    label: 'Now Playing',
    border: {
        type: 'line'
    },
    style: {
        fg: 'white',
        bg: 'black',
        border: {
            fg: '#f0f0f0'
        }
    }
});

exports.controls = NeoBlessed.box({
    top: '85%',
    left: '50%',
    width: '50%',
    height: 5,
    scrollable: true,
    label: 'Controls',
    content: exports.controlsPlaylist,
    border: {
        type: 'line'
    },
    style: {
        fg: 'grey',
        bg: 'black',
        border: {
            fg: '#000000'
        }
    }
});

exports.playlistChildConfig = { ...internals.childConfig, ...internals.playlistChildColors };
exports.queueChildConfig = { ...internals.childConfig, ...internals.queueChildColors };
exports.playingChildConfig = { ...internals.childConfig, ...internals.playingChildColors };
