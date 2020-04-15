const NeoBlessed = require('neo-blessed');
const internals = {};

/**
 * Style config for the 'neo-blessed' library
 */

internals.childCommonConfig = {
    width: '100%',
    height: 1,
    left: 0
};

exports.playlistBoxChildConfig = {
    ...internals.childCommonConfig,
    fg: 'white',
    bg: 'green'
};
exports.queueBoxChildConfig = {
    ...internals.childCommonConfig,
    fg: 'white',
    bg: 'blue'
};
exports.playingBoxChildConfig = {
    ...internals.childCommonConfig,
    fg: 'green',
    bg: 'black'
};

exports.controlsPlaylist =
    '  q  -  focus queue  |  k - go up\n' +
    'enter - enqueue song |  l - go down\n';
exports.controlsQueue =
    'a - move song up   | k - go up\n' +
    'z - move zong down | l - go down\n' +
    'p - focus playlist | d - dequeue song';

exports.bgPlFocus = 'black';
exports.bgPlPlain = 'green';
exports.bgQuFocus = 'black';
exports.bgQuPlain = 'blue';

exports.Screen = NeoBlessed.screen({ smartSCR: true });
exports.Screen.title = 'Node Radio Mini';
exports.Screen.key(['escape', 'C-c'], (ch, key) => process.exit(0));

exports.PlaylistBox = NeoBlessed.box({
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
        bg: 'green',
        border: {
            fg: '#f0f0f0'
        }
    }
});

exports.QueueBox = NeoBlessed.box({
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

exports.NowPlayingBox = NeoBlessed.box({
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

exports.ControlsBox = NeoBlessed.box({
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
