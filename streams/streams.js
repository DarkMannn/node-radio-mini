'use strict';

const Fs = require('fs');
const { PassThrough } = require('stream');
const Throttle = require('throttle-stream');
const { hostSink } = require('./host-sink.js');
const { readSongs } = require('../views');
const { only1 } = require('../utils');

const __ = {};
const exp = {};

__.sinks = [hostSink()];
__.songs = [];
__.throttle = new Throttle({ bytes: 45000, interval: 500 })
    .on('data', chunk => __.sinks.forEach(sink => sink.write(chunk)));

exp.loadSongReadStreams = () => __.songs.push(...readSongs().map(only1(Fs.createReadStream)));

exp.createStream = () => {

    const sink = new PassThrough();
    __.sinks.push(sink);

    return sink;
};

exp.startStreaming = () => {

    let songNum = 0;

    (function playLoop () {

        const song = __.songs[songNum++];
        const hasMoreSongs = __.songs.length === songNum + 1;
        song.pipe(__.throttle, { end: !hasMoreSongs });
        song.on('end', hasMoreSongs ? playLoop : () => {});
    })();

};

module.exports = exp;
