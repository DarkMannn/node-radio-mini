'use strict';

const Fs = require('fs');
const { extname } = require('path');


exports.readSongs = () => Fs.readdirSync(process.cwd(), { withFileTypes: true })
    .filter(dirItem => dirItem.isFile && extname(dirItem.name) === '.mp3')
    .map(dirItem => dirItem.name);
