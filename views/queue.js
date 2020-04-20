const NeoBlessed = require('neo-blessed');
const AbstractClasses = require('./abstract-classes');
const Utils = require('../utils');
const { keys }  = require('../config');

const Fs = require('fs');
const Path = require('path');
const EventEmitter = require('events');
const Throttle = require('throttle-stream');
const { ffprobeSync } = require('@dropb/ffprobe');
const { PassThrough } = require('stream');
const Speaker = require('speaker');
const Lame = require('lame');

class Queue extends AbstractClasses.TerminalItemBox {

    constructor(params) {
        super(params);
        this._sinks = [];
        this._songs = [];
        this.streamEvents = new EventEmitter();
    }

    static makeHostSink() {
        const hostSink = new Lame.Decoder();
        hostSink.pipe(new Speaker());
        return hostSink;
    }

    _nextSongExists() {
        return !!this._songs.length;
    }

    _onData(chunk) {
        if(chunk) {
            this._sinks.forEach(sink => sink.write(chunk));
        }
    }

    _makeThrottle(bytes) {
        return new Throttle({ bytes, interval: 1000 }).on('data', (chunk) => this._onData(chunk));
    }

    _repeatLoop(song, bitRate) {

        const songReadStream = Fs.createReadStream(song);
        songReadStream.pipe(this._makeThrottle(parseInt(bitRate)));
        songReadStream.on('end', () => this._nextSongExists() ? this._playLoop() : this._repeatLoop(song, bitRate));
    }

    _playLoop() {

        const song = this.removeFromQueue({ fromTop: true });
        this.streamEvents.emit('play', song);
        const { format: { bit_rate: bitRate } } = ffprobeSync(Path.join(process.cwd(), song));

        this._repeatLoop(song, bitRate);
    }

    startStreaming() {
        this._playLoop();
    }

    init() {
        this._sinks.push(Queue.makeHostSink());
        this._songs.unshift(Utils.readSong());
    }

    _createBoxChild(content) {

        return NeoBlessed.box({
            ...this._childConfig,
            top: this.box.children.length - 1,
            content: `${this.box.children.length}. ${content}`
        });
    }

    _discardFromBox(index) {
        this.box.remove(this.box.children[index]);
    }

    _orderBoxChildren() {
        this.box.children.forEach((child, index) => {

            if (index !== 0) {
                child.top = index - 1;
                child.content = `${index}. ${Utils.discardFirstWord(child.content)}`;
            }
        });
    }

    _boxChildrenIndexToSongsArrayIndex(index) {
        return Math.abs((index - 1) - this._songs.length + 1);
    }

    _createAndAppendToQueueSongsArray(song) {
        this._songs.unshift(song);
    }

    _createAndAppendToQueueBoxChildren(song) {
        this.createBoxChildAndAppend(song);
    }

    createAndAppendToQueue(song) {
        this._createAndAppendToQueueBoxChildren(song);
        this._createAndAppendToQueueSongsArray(song);
    }

    _removeFromQueueSongsArray(index) {
        const adjustedIndex = this._boxChildrenIndexToSongsArrayIndex(index);
        return this._songs.splice(adjustedIndex, 1);
    }

    _removeFromQueueBoxChildren(index) {

        const child = this.box.children[index];
        const content = child && child.content;

        if (!content) {
            return {};
        }

        this._discardFromBox(index);
        this._orderBoxChildren();
        this._focusIndexer.decr();
    }

    removeFromQueue({ fromTop } = {}) {

        const index = fromTop ? 1 : this._focusIndexer.get();

        this._removeFromQueueBoxChildren(index);
        const [song] = this._removeFromQueueSongsArray(index);
        return song;
    }

    _changeOrderInQueueSongsArray(boxChildrenIndex1, boxChildrenIndex2) {

        const songsArrayIndex1 = this._boxChildrenIndexToSongsArrayIndex(boxChildrenIndex1);
        const songaArrayIndex2 = this._boxChildrenIndexToSongsArrayIndex(boxChildrenIndex2);
        [
            this._songs[songsArrayIndex1], this._songs[songaArrayIndex2]
        ] = [
            this._songs[songaArrayIndex2], this._songs[songsArrayIndex1]
        ];
    }

    _changeOrderInQueueBoxChildren(key) {

        if (this.box.children.length === 1) {
            return;
        }

        const index1 = this._focusIndexer.get();
        const child1 = this.box.children[index1];

        if (key === keys.MOVE_UP) {
            this._focusIndexer.decr();
        }
        else if (key === keys.MOVE_DOWN) {
            this._focusIndexer.incr();
        }

        const index2 = this._focusIndexer.get();
        const child2 = this.box.children[index2];

        child1.style.bg = this._bgBlur;
        child2.style.bg = this._bgFocus;
        [
            child1.content,
            child2.content
        ] = [
            `${Utils.getFirstWord(child1.content)} ${Utils.discardFirstWord(child2.content)}`,
            `${Utils.getFirstWord(child2.content)} ${Utils.discardFirstWord(child1.content)}`,
        ];

        return { index1, index2 };
    }

    changeOrderQueue(key) {
        const { index1, index2 } = this._changeOrderInQueueBoxChildren(key);
        this._changeOrderInQueueSongsArray(index1, index2);
    }

    makeResponseStream() {
        const sink = new PassThrough();
        this._sinks.push(sink);
        return sink;
    }
}

module.exports = Queue;
