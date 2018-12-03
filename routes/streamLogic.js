'use strict'

const Fs = require('fs');
const { PassThrough } = require('stream');
const Throttle = require('throttle');

const songs = [
  Fs.createReadStream('./songs/RitaOra.mp3'),
  Fs.createReadStream('./songs/DuaLipa.mp3'),
  Fs.createReadStream('./songs/Camila.mp3')
];
const sinks = [];

const throttle = new Throttle((192027 / 10) * 1.3);
throttle.on('data', chunk => {
  sinks.forEach(sink => sink.write(chunk));
});


const streamHandler = (request, h) => {
  const sink = new PassThrough();
  sinks.push(sink);
  return h.response(sink).type('audio/mpeg');
};

const startStreaming = () => {
  let songNum = 0;

  (function playLoop () {
    const song = songs[songNum++];
    song.pipe(throttle, { end: false });
    song.on('end', playLoop)
  })();

};


module.exports = { streamHandler, startStreaming };
