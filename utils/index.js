const Fs = require('fs');
const { extname } = require('path');

const _readDir = () => Fs.readdirSync(process.cwd(), { withFileTypes: true });
const _isMp3 = item => item.isFile && extname(item.name) === '.mp3';

exports.readSong = () => _readDir().filter(_isMp3)[0].name;
exports.readSongs = () => _readDir().filter(_isMp3).map((songItem) => songItem.name);

exports.discardFirstWord = str => str.substring(str.indexOf(' ') + 1);
exports.getFirstWord = str => str.split(' ')[0];

exports.generateRandomId = () => Math.random().toString(36).slice(2);
