'use strict'

const Fs = require('fs');
const { extname } = require('path');
const { PassThrough } = require('stream');
const Throttle = require('throttle-stream');

const sinks = [];
const songs = Fs.readdirSync(process.cwd(), { withFileTypes: true })
  .filter(dirItem => dirItem.isFile && extname(dirItem.name) === '.mp3')
  .map(dirItem => dirItem.name)
  .map(Fs.createReadStream)
;
const throttle = new Throttle({ bytes: 45000, interval: 500 });
throttle.on('data', chunk => sinks.forEach(sink => sink.write(chunk)));


const streamHandler = (request, h) => {
  const sink = new PassThrough();
  sinks.push(sink);
  return h.response(sink).type('audio/mpeg');
};

const startStreaming = () => {
  let songNum = 0;

  (function playLoop () {
    const song = songs[songNum++];
    const hasMoreSongs = songs.length === songNum + 1;
    song.pipe(throttle, { end: !hasMoreSongs });
    song.on('end', hasMoreSongs ? playLoop : null)
  })();

};


module.exports = { streamHandler, startStreaming };
