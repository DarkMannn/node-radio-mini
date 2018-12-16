'use strict';

const Fs = require('fs');
const { PassThrough } = require('stream');
const Throttle = require('throttle-stream');
const { hostSink } = require('./host-sink.js');
const { readSongs } = require('../views');

const exp = {};

const sinks = [hostSink()];
const throttle = new Throttle({ bytes: 45000, interval: 500 });
throttle.on('data', chunk => sinks.forEach(sink => sink.write(chunk)));

exp.getSongReadStreams = () => readSongs().map(song => Fs.createReadStream(song));

exp.createStream = () => {

    const sink = new PassThrough();
    sinks.push(sink);
    return sink;
};

exp.startStreaming = (songs) => {

    let songNum = 0;

    (function playLoop () {

        const song = songs[songNum++];
        const hasMoreSongs = songs.length === songNum + 1;
        song.pipe(throttle, { end: !hasMoreSongs });
        song.on('end', hasMoreSongs ? playLoop : () => {});
    })();

};

module.exports = exp;
