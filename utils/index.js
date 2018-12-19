'use strict';

const Fs = require('fs');
const { extname } = require('path');

const __ = {};
const exp = {};

__.readDir = () => Fs.readdirSync(process.cwd(), { withFileTypes: true });
__.isMp3 = item => item.isFile && extname(item.name) === '.mp3';

exp.readSongs = () => __.readDir().filter(__.isMp3).map(exp.pick('name'));
exp.readSong = () => __.readDir().filter(__.isMp3)[0].name;

exp.pipe2 = (fn1, fn2) => (...args) => fn2(fn1(...args));
exp.pipe = (...fns) => fns.reduce(exp.pipe2);

exp.unary = fn => (arg) => fn(arg);

exp.noFirstWord = str => str.substring(str.indexOf(' ') + 1);
exp.firstWord = str => str.split(' ')[0];

exp.pick = property => obj => obj[property];


module.exports = exp;
