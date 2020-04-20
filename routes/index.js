const { queue } = require('../engine');

const plugin = {

    name: 'streamServer',

    register: async (server) => {

        server.route({
            method: 'GET',
            path: '/',
            handler: (_, h) => h.file('index.html')
        });

        server.route({
            method: 'GET',
            path: '/{filename}',
            handler: {
                file: (req) => req.params.filename
            }
        });

        server.route({
            method: 'GET',
            path: '/stream',
            handler: (_, h) => h.response(queue.makeResponseStream()).type('audio/mpeg')
        });

    }
};

module.exports = plugin;
