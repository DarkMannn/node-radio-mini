const Stream = require('./streams');
const View = require('./views');
const Utils = require('./utils');
const internals = {};

const Playlist = View.playlistKeyListener;
Playlist.sendToQueueWindow = Playlist.action;

const Queue = View.queueKeyListener;
Queue.removeFromQueueWindow = Queue.action;
Queue.changeOrderQueueWindow = Queue.changeOrder;

internals.renderView = () => {

    const { playlist, queue } = View.init();
    Stream.init();

    playlist.key('k', Playlist.navigator);
    playlist.key('k', Playlist.circleList);
    playlist.key('l', Playlist.navigator);
    playlist.key('l', Playlist.circleList);
    playlist.key('enter', () => {

        const { content } = Playlist.sendToQueueWindow();
        Stream.sendToQueueArray(content);
    });
    playlist.key('q', () => {

        Playlist.postFocus();
        Queue.preFocus();
        queue.focus();
        View.setControlTipsQueue();
        View.render();
    });

    const changeOrder = key => {

        const { index1, index2 } = Queue.changeOrderQueueWindow(key);
        Stream.changeOrderQueueArray(index1, index2);
    };
    queue.key('a', changeOrder);
    queue.key('z', changeOrder);
    queue.key('k', Queue.navigator);
    queue.key('l', Queue.navigator);
    queue.key('d', () => {

        const { index } = Queue.removeFromQueueWindow();
        if (index) {
            Stream.removeFromQueueArray(index);
        }
        Queue.preFocus();
        View.render();
    });
    queue.key('p', () => {

        Queue.postFocus();
        Playlist.preFocus();
        playlist.focus();
        View.setControlTipsPlaylist();
        View.render();
    });

    Stream.radioEvents.on('play', (song) => {

        Queue.removeFromQueueWindow({ fromTop: true });
        Queue.preFocus();
        View.createChildAndAppendToPlaying(song);
        View.render();
    });

    View.fillPlaylistAndRender(Utils.readSongs(), Playlist.preFocus);
};

exports.startEngine = () => {

    internals.renderView();
    Stream.startStreaming();
};
