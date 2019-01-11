'use strict';

const Fs = require('fs');
const Path = require('path');
const EventEmitter = require('events');
const Throttle = require('throttle-stream');
const { ffprobeSync } = require('@dropb/ffprobe');
const { PassThrough } = require('stream');
const { makeHostSink } = require('./host-sink.js');
const Ut = require('../utils');

const __ = {};
const exp = {};

// temp
const output = Fs.createWriteStream(process.cwd() + '/log.txt');
exp.log = log => output.write(log + '\n', 'utf8');
exp.logEnd = output.end;
// temp

__.MyEmitter = class extends EventEmitter {};

__.sinks = [makeHostSink()];
__.songs = [];

__.queueWindowIndexToArrayIndex = index => Math.abs((index - 1) - __.songs.length + 1);

__.nextSongExists = () => !!__.songs.length;

__.onData = chunk => chunk && __.sinks.forEach(sink => sink.write(chunk));
__.makeThrottle = bytes => new Throttle({ bytes, interval: 1000 }).on('data', __.onData);


exp.makeResponseStream = function makeResponseStream() {

    const sink = new PassThrough();
    __.sinks.push(sink);

    return sink;
};

exp.sendToQueueArray = song => __.songs.unshift(Ut.noFirstWord(song));
exp.removeFromQueueArray = index => 
    __.songs.splice(__.queueWindowIndexToArrayIndex(index), 1);
exp.changeOrderQueueArray = (indexWindow1, indexWindow2) => {

    const indexArray1 = __.queueWindowIndexToArrayIndex(indexWindow1);
    const indexArray2 = __.queueWindowIndexToArrayIndex(indexWindow2);
    [__.songs[indexArray1], __.songs[indexArray2]] =
        [__.songs[indexArray2], __.songs[indexArray1]];
}; 
exp.songs = __.songs;

exp.radioEvents = new __.MyEmitter();

exp.startStreaming = function startStreaming(firstSong){

    __.songs.unshift(firstSong);

    (function playLoop() {

        exp.radioEvents.emit('play');
        const song = __.songs.pop();        
        const { 
            format: {
                bit_rate: bitRate
            }
        } = ffprobeSync(Path.join(process.cwd(), song));

        (function repeatLoop() {

            const songReadStream = Fs.createReadStream(song);
            songReadStream.pipe(__.makeThrottle(parseInt(bitRate)));
            songReadStream.on('end', () => __.nextSongExists() ? playLoop() : repeatLoop());
        })();
    })();

};


module.exports = exp;
