const Speaker = require('speaker');
const Lame = require('lame');

exports.hostSink = () => {

    const hostSink = new Lame.Decoder();
    hostSink.pipe(new Speaker());

    return hostSink;
};
