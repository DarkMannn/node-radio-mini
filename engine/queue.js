const Fs = require('fs');
const Path = require('path');
const EventEmitter = require('events');
const { PassThrough } = require('stream');

const Throttle = require('throttle');
const NeoBlessed = require('neo-blessed');
const { ffprobeSync } = require('@dropb/ffprobe');
const Speaker = require('speaker');
const Lame = require('lame');

const AbstractClasses = require('./shared/abstract-classes');
const Utils = require('../utils');
const { keys }  = require('../config');

/**
 * Class in charge of:
 * 1. A view layer for the queued up songs
 *       - 'this.box.children' contains view layer for the queued up songs
 * 2. A stream layer for the streaming of the queued up songs
 *       - 'this_songs' contains songs for the streaming
 */
class Queue extends AbstractClasses.TerminalItemBox {

    constructor(params) {
        super(params);
        this._sinks = new Map(); // map of active sinks/writables
        this._songs = []; // list of queued up songs
        this._currentSong = null;
        this.stream = new EventEmitter();
    }

    init() {
        if (process.env.SPEAKER_OUTPUT === 'true') {
            this.makeSpeakerSink();
        }
        this._currentSong = Utils.readSong();
    }

    makeSpeakerSink() {
        const speakerSink = new Lame.Decoder();
        speakerSink.pipe(new Speaker());
        this._sinks.set(Utils.generateRandomId, speakerSink);
    }

    makeResponseSink() {
        const id = Utils.generateRandomId();
        const responseSink = PassThrough();
        this._sinks.set(id, responseSink);
        return { id, responseSink };
    }

    removeResponseSink(id) {
        this._sinks.delete(id);
    }

    _broadcastToEverySink(chunk) {
        for (const [, sink] of this._sinks) {
            sink.write(chunk);
        }
    }

    _getBitRate(song) {
        try {
            const bitRate = ffprobeSync(Path.join(process.cwd(), song)).format.bit_rate;
            return parseInt(bitRate);
        }
        catch (err) {
            return 128000; // reasonable default
        }
    }

    _playLoop() {

        this._currentSong = this._songs.length
            ? this.removeFromQueue({ fromTop: true })
            : this._currentSong;
        const bitRate = this._getBitRate(this._currentSong);

        const songReadable = Fs.createReadStream(this._currentSong);

        const throttleTransformable = new Throttle(bitRate / 8);
        throttleTransformable.on('data', (chunk) => this._broadcastToEverySink(chunk));
        throttleTransformable.on('end', () => this._playLoop());

        this.stream.emit('play', this._currentSong);
        songReadable.pipe(throttleTransformable);
    }

    startStreaming() {
        this._playLoop();
    }

    _createBoxChild(content) {

        return NeoBlessed.box({
            ...this._childConfig,
            top: this.box.children.length - 1,
            content: `${this.box.children.length}. ${content}`
        });
    }

    _boxChildrenIndexToSongsIndex(index) {
        // converts index of this.box.children array (view layer)
        // to the index of this._songs array (stream layer)
        return index - 1;
    }

    _createAndAppendToSongs(song) {
        this._songs.push(song);
    }

    _createAndAppendToBoxChildren(song) {
        this.createBoxChildAndAppend(song);
    }

    createAndAppendToQueue(song) {
        this._createAndAppendToBoxChildren(song);
        this._createAndAppendToSongs(song);
    }

    _removeFromSongs(index) {
        const adjustedIndex = this._boxChildrenIndexToSongsIndex(index);
        return this._songs.splice(adjustedIndex, 1);
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

    _removeFromBoxChildren(index) {

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

        this._removeFromBoxChildren(index);
        const [song] = this._removeFromSongs(index);
        return song;
    }

    _changeOrderInSongs(boxChildrenIndex1, boxChildrenIndex2) {

        const songsArrayIndex1 = this._boxChildrenIndexToSongsIndex(boxChildrenIndex1);
        const songaArrayIndex2 = this._boxChildrenIndexToSongsIndex(boxChildrenIndex2);
        [
            this._songs[songsArrayIndex1], this._songs[songaArrayIndex2]
        ] = [
            this._songs[songaArrayIndex2], this._songs[songsArrayIndex1]
        ];
    }

    _changeOrderInBoxChildren(key) {

        const index1 = this._focusIndexer.get();
        const child1 = this.box.children[index1];
        child1.style.bg = this._bgBlur;

        if (key === keys.MOVE_UP) {
            this._focusIndexer.decr();
        }
        else if (key === keys.MOVE_DOWN) {
            this._focusIndexer.incr();
        }

        const index2 = this._focusIndexer.get();
        const child2 = this.box.children[index2];
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

        if (this.box.children.length === 1) {
            return;
        }
        const { index1, index2 } = this._changeOrderInBoxChildren(key);
        this._changeOrderInSongs(index1, index2);
    }
}

module.exports = Queue;
