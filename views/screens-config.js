'use strict';

const NeoBlessed = require('neo-blessed');

const __ = {};
const exp = {};

__.childConfig = {
    width: '100%',
    height: 1,
    left: 0
};
__.playlistChildColors = {
    fg: 'cyan',
    bg: 'grey'
};
__.queueChildColors = {
    fg: 'white',
    bg: 'blue'
};
__.playingChildColors = {
    fg: 'green',
    bg: 'black'
};

exp.controlsPlaylist = '  q  -  focus queue  |  k - go up\n' +
    'enter - enqueue song |  l - go down\n';
exp.controlsQueue = 'p - focus playlist | k - go up\n' +
    'd -  dequeue song  | l - go down\n' +
    'a,z - move song up or down the queue';

exp.bgPlFocus = 'black';
exp.bgPlPlain = 'grey';
exp.bgQuFocus = 'black';
exp.bgQuPlain = 'blue';

exp.screen = NeoBlessed.screen({ smartSCR: true });    
exp.screen.title = 'Node Radio Mini';
exp.screen.key(['escape', 'C-c'], (ch, key) => process.exit(0));

exp.playlist = NeoBlessed.box({
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

exp.queue = NeoBlessed.box({
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

exp.playing = NeoBlessed.box({
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

exp.controls = NeoBlessed.box({
    top: '85%',
    left: '50%',
    width: '50%',
    height: 5,
    scrollable: true,
    label: 'Controls',
    content: exp.controlsQueue,
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

exp.playlistChildConfig = { ...__.childConfig, ...__.playlistChildColors };
exp.queueChildConfig = { ...__.childConfig, ...__.queueChildColors };
exp.playingChildConfig = { ...__.childConfig, ...__.playingChildColors };


module.exports = exp;
