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

    const { PlaylistBox, QueueBox } = View.init();
    Stream.init();

    PlaylistBox.key('k', Playlist.navigator);
    PlaylistBox.key('k', Playlist.circleList);
    PlaylistBox.key('l', Playlist.navigator);
    PlaylistBox.key('l', Playlist.circleList);
    PlaylistBox.key('enter', () => {

        const { content } = Playlist.sendToQueueWindow();
        Stream.sendToQueueArray(content);
    });
    PlaylistBox.key('q', () => {

        Playlist.postFocus();
        Queue.preFocus();
        QueueBox.focus();
        View.setControlTipsQueue();
        View.render();
    });

    const changeOrder = key => {

        const { index1, index2 } = Queue.changeOrderQueueWindow(key);
        Stream.changeOrderQueueArray(index1, index2);
    };
    QueueBox.key('a', changeOrder);
    QueueBox.key('z', changeOrder);
    QueueBox.key('k', Queue.navigator);
    QueueBox.key('l', Queue.navigator);
    QueueBox.key('d', () => {

        const { index } = Queue.removeFromQueueWindow();
        if (index) {
            Stream.removeFromQueueArray(index);
        }
        Queue.preFocus();
        View.render();
    });
    QueueBox.key('p', () => {

        Queue.postFocus();
        Playlist.preFocus();
        PlaylistBox.focus();
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
