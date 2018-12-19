'use strict';

const Fs = require('fs');
const Throttle = require('throttle-stream');
const { PassThrough } = require('stream');
const { makeHostSink } = require('./host-sink.js');
const Ut = require('../utils');

const __ = {};
const exp = {};


__.sinks = [makeHostSink()];
__.songs = [];

__.haveMoreSongs = () => __.songs.length;
__.onData = chunk => chunk && __.sinks.forEach(sink => sink.write(chunk));
__.makeThrottle = (bytes) => new Throttle({ bytes, interval: 1000 }).on('data', __.onData);

exp.makeResponseStream = function makeResponseStream() {

    const sink = new PassThrough();
    __.sinks.push(sink);

    return sink;
};

exp.startStreaming = function startStreaming(firstSong){

    __.songs.push(firstSong);

    (function playLoop() {

        const song = __.songs.pop();
        // ucitaj speed
        (function repeatLoop() {

            const songReadStream = Fs.createReadStream(song);
            songReadStream.pipe(__.makeThrottle(45000));
            songReadStream.on('end', __.haveMoreSongs() ? playLoop : repeatLoop); // mozda se evaluira odmah?
        })();
    })();

};


module.exports = exp;
