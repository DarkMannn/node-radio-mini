require('dotenv').config({ path: `${__dirname}/../.env` });

exports.keys = {
    SCROLL_UP: process.env.SCROLL_UP || 'i',
    SCROLL_DOWN: process.env.SCROLL_DOWN || 'k',
    MOVE_UP: process.env.MOVE_UP || 'w',
    MOVE_DOWN: process.env.MOVE_DOWN || 's',
    QUEUE_REMOVE: process.env.QUEUE_REMOVE || 'z',
    QUEUE_ADD: process.env.QUEUE_ADD || 'enter',
    FOCUS_QUEUE: process.env.FOCUS_QUEUE || 'q',
    FOCUS_PLAYLIST: process.env.FOCUS_PLAYLIST || 'p'
};
