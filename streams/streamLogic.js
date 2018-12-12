'use strict'

const Fs = require('fs');
const { extname } = require('path');
const { PassThrough } = require('stream');
const Throttle = require('throttle-stream');
const Speaker = require('speaker');
const Lame = require('lame');

const sinks = [];
const songs = Fs.readdirSync(process.cwd(), { withFileTypes: true })
  .filter(dirItem => dirItem.isFile && extname(dirItem.name) === '.mp3')
  .map(dirItem => Fs.createReadStream(dirItem.name))
;
const throttle = new Throttle({ bytes: 45000, interval: 500 });
throttle.on('data', chunk => sinks.forEach(sink => sink.write(chunk)));
const decoder = new Lame.Decoder();
decoder.pipe(new Speaker());
sinks.push(decoder);

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
    song.on('end', hasMoreSongs ? playLoop : () => {})
  })();

};


module.exports = { streamHandler, startStreaming };
