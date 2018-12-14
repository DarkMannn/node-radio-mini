const NeoBlessed = require('neo-blessed');


const screen = NeoBlessed.screen({ smartSCR: true });

const appendChildToParentInit = (Lib) =>
    (parent) =>
        (config) => parent.append(Lib.box(config));
const returnParentToApendTo = appendChildToParentInit(NeoBlessed);

const createChild = style =>
    (position, content) => ({
        width: '100%',
        height: 1,
        left: 0,
        top: position * 1,
        content,
        style
    });
const createPlaylistChild = createChild({
    fg: 'cyan',
    bg: 'grey',
    focus: {
        fg: 'grey',
        bg: 'cyan'
    }
});
const createQueueChild = createChild({
    fg: 'white',
    bg: 'blue',
    focus: {
        fg: 'blue',
        bg: 'white'
    }
});

exports.renderAndReturnWindows = function() {

    screen.title = 'Node Radio Mini';
    screen.key(['escape', 'q', 'C-c'], function(ch, key) {
        return process.exit(0);
    });

    var playlist = NeoBlessed.box({
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
    var queue = NeoBlessed.box({
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
    var terminal = NeoBlessed.box({
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

    screen.append(playlist);
    screen.append(queue);
    screen.append(terminal);
        
    playlist.focus();
    screen.render();

    return {
        playlist,
        queue,
        terminal
    };
};

exports.renderSongs = (playlist, queue) => {

    const appendToPlaylist = returnParentToApendTo(playlist);
    appendToPlaylist(createPlaylistChild(0,'Ja sam Darko'));
    appendToPlaylist(createPlaylistChild(1,'Ja sam Milosevic'));
    appendToPlaylist(createPlaylistChild(2,'I mnogo sam lud'));
    appendToPlaylist(createPlaylistChild(3,'I mnogo sam lud'));
    const appendToQueue = returnParentToApendTo(queue);
    appendToQueue(createQueueChild(0,'asfasf'));
};

exports.render = screen.render.bind(screen);
