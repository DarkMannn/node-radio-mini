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
__.loggerChildColors = {
    fg: 'white',
    bg: 'black'
};

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

exp.logger = NeoBlessed.log({
    top: '70%',
    left: '50%',
    width: '50%',
    height: '32%',
    scrollable: true,
    scrollOnInput: true,
    label: 'Console',
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

exp.playlistChildConfig = { ...__.childConfig, ...__.playlistChildColors };
exp.queueChildConfig = { ...__.childConfig, ...__.queueChildColors };
exp.loggerChildConfig = { ...__.childConfig, ...__.loggerChildColors };


module.exports = exp;
