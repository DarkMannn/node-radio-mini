'use strict';

const File = require('inert');
const { streamHandler } = require('../streaming');


const plugin = {

    name: 'streamServer',

    register: async (server, options) => {
    
        await server.register(File);
    
        server.route({
            method: 'GET',
            path: '/',
            handler: function(request, h) {
                return h.file('index.html');
            }
        });

        server.route({
            method: 'GET',
            path: '/stream',
            handler: streamHandler
        });

    }

};


module.exports = plugin;
