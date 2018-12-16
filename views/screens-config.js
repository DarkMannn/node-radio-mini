'use strict';

const NeoBlessed = require('neo-blessed');

const exp = {};
exp.screen = NeoBlessed.screen({ smartSCR: true });    
exp.screen.title = 'Node Radio Mini';
exp.screen.key(['escape', 'q', 'C-c'], (ch, key) => process.exit(0));

exp.playlist = NeoBlessed.box({
    top: 0,
    left: 0,
    width: '50%',
    height: '100%',
    label: 'Playlist',
    scrollable: true,
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
    label: 'To be played',
    scrollable: true,
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

exp.terminal = NeoBlessed.box({
    top: '70%',
    left: '50%',
    width: '50%',
    height: '32%',
    label: 'Console',
    scrollable: true,
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

exp.playlistChildColors = {
    fg: 'cyan',
    bg: 'grey',
    focus: {
        fg: 'grey',
        bg: 'cyan'
    }
};

exp.queueChildColors = {
    fg: 'white',
    bg: 'blue',
    focus: {
        fg: 'blue',
        bg: 'white'
    }
};


module.exports = exp;
