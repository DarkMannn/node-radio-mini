const Speaker = require('speaker');
const Lame = require('lame');

/**
 * Sets speakers on the local machine to be a stream sink
 */
exports.makeHostSink = () => {

    const hostSink = new Lame.Decoder();
    hostSink.pipe(new Speaker());

    return hostSink;
};
