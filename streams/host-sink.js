const Speaker = require('speaker');
const Lame = require('lame');

exports.makeHostSink = () => {

    const hostSink = new Lame.Decoder();
    hostSink.pipe(new Speaker());

    return hostSink;
};
