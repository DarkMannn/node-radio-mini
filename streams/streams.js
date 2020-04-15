const Fs = require('fs');
const Path = require('path');
const EventEmitter = require('events');
const Throttle = require('throttle-stream');
const { ffprobeSync } = require('@dropb/ffprobe');
const { PassThrough } = require('stream');
const { makeHostSink } = require('./host-sink.js');
const Utils = require('../utils');
const internals = {};

internals.MyEmitter = class extends EventEmitter {};
internals.sinks = [];
internals.songs = [];

internals.queueWindowIndexToArrayIndex = index => Math.abs((index - 1) - internals.songs.length + 1);
internals.nextSongExists = () => !!internals.songs.length;
internals.onData = chunk => chunk && internals.sinks.forEach(sink => sink.write(chunk));
internals.makeThrottle = bytes => new Throttle({ bytes, interval: 1000 }).on('data', internals.onData);

exports.radioEvents = new internals.MyEmitter();
exports.makeResponseStream = function makeResponseStream() {

    const sink = new PassThrough();
    internals.sinks.push(sink);

    return sink;
};
exports.sendToQueueArray = song => internals.songs.unshift(Utils.discardFirstWord(song));
exports.removeFromQueueArray = index =>
    internals.songs.splice(internals.queueWindowIndexToArrayIndex(index), 1);
exports.changeOrderQueueArray = (indexWindow1, indexWindow2) => {

    const indexArray1 = internals.queueWindowIndexToArrayIndex(indexWindow1);
    const indexArray2 = internals.queueWindowIndexToArrayIndex(indexWindow2);
    [internals.songs[indexArray1], internals.songs[indexArray2]] =
        [internals.songs[indexArray2], internals.songs[indexArray1]];
};
exports.startStreaming = function startStreaming() {

    (function playLoop() {

        const song = internals.songs.pop();
        exports.radioEvents.emit('play', song);
        const { format: { bit_rate: bitRate } } = ffprobeSync(Path.join(process.cwd(), song));

        (function repeatLoop() {

            const songReadStream = Fs.createReadStream(song);
            songReadStream.pipe(internals.makeThrottle(parseInt(bitRate)));
            songReadStream.on('end', () => internals.nextSongExists() ? playLoop() : repeatLoop());
        })();
    })();

};
exports.init = () => {

    internals.sinks.push(makeHostSink());
    internals.songs.unshift(Utils.readSong());
};

exports.songs = internals.songs;
