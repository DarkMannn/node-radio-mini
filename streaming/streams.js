'use strict';

const Fs = require('fs');
const { PassThrough } = require('stream');
const Throttle = require('throttle-stream');
const { hostSink } = require('./host-sink.js');
const { readSongs } = require('../views');

const sinks = [hostSink()];
const songs = readSongs().map(song => Fs.createReadStream(song));
const throttle = new Throttle({ bytes: 45000, interval: 500 });
throttle.on('data', chunk => sinks.forEach(sink => sink.write(chunk)));


exports.createStream = () => {

    const sink = new PassThrough();
    sinks.push(sink);
    return sink;
};

exports.startStreaming = () => {

    let songNum = 0;

    (function playLoop () {

        const song = songs[songNum++];
        const hasMoreSongs = songs.length === songNum + 1;
        song.pipe(throttle, { end: !hasMoreSongs });
        song.on('end', hasMoreSongs ? playLoop : () => {});
    })();

};

