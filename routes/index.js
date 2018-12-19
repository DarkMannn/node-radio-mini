'use strict';

const File = require('inert');
const { makeResponseStream } = require('../streams');


const plugin = {

    name: 'streamServer',

    register: async (server, options) => {
    
        await server.register(File);
    
        server.route({
            method: 'GET',
            path: '/',
            handler: (req, h) => h.file('index.html')
        });

        server.route({
            method: 'GET',
            path: '/stream',
            handler: (req, h) =>
                h.response(makeResponseStream()).type('audio/mpeg')
        });

    }

};


module.exports = plugin;
