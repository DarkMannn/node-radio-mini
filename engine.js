const Stream = require('./streams');
const View = require('./views');
const Utils = require('./utils');
const internals = {};

const { playlist } = View;

const Queue = View.queueKeyListener;
Queue.removeFromQueueWindow = Queue.action;
Queue.changeOrderQueueWindow = Queue.changeOrder;

internals.renderView = () => {

    const { QueueBox } = View.init();
    Stream.init();

    playlist.box.key('k', (event) => playlist.eventHandlers.navigator(event));
    playlist.box.key('k', (event) => playlist.eventHandlers.circleList(event));
    playlist.box.key('l', (event) => playlist.eventHandlers.navigator(event));
    playlist.box.key('l', (event) => playlist.eventHandlers.circleList(event));
    playlist.box.key('enter', () => {

        const { content } = playlist.eventHandlers.sendToQueueWindow();
        Stream.sendToQueueArray(content);
    });
    playlist.box.key('q', () => {

        playlist.eventHandlers.postFocus();
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
        playlist.eventHandlers.preFocus();
        playlist.box.focus();
        View.setControlTipsPlaylist();
        View.render();
    });

    Stream.radioEvents.on('play', (song) => {

        Queue.removeFromQueueWindow({ fromTop: true });
        Queue.preFocus();
        View.createChildAndAppendToPlaying(song);
        View.render();
    });

    playlist.fillWithItemsAndRender(Utils.readSongs());
};

exports.startEngine = () => {

    internals.renderView();
    Stream.startStreaming();
};
