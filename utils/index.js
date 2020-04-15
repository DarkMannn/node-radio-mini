const Fs = require('fs');
const { extname } = require('path');
const internals = {};

internals.readDir = () => Fs.readdirSync(process.cwd(), { withFileTypes: true });
internals.isMp3 = item => item.isFile && extname(item.name) === '.mp3';

exports.readSong = () => internals.readDir().filter(internals.isMp3)[0].name;
exports.readSongs = () => internals.readDir().filter(internals.isMp3).map(exports.pick('name'));

exports.pipe2 = (fn1, fn2) => (...args) => fn2(fn1(...args));
exports.pipe = (...fns) => fns.reduce(exports.pipe2);

exports.unary = fn => (arg) => fn(arg);

exports.discardFirstWord = str => str.substring(str.indexOf(' ') + 1);
exports.getFirstWord = str => str.split(' ')[0];

exports.pick = property => obj => obj[property];
