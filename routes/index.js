'use strict';

const File = require('inert');
const Path = require('path');
const { streamHandler } = require('./streamLogic.js');


const plugin = {

  name: 'fileServer',

  register: async (server, options) => {
    
    await server.register(File);
    
    server.route({
      method: 'GET',
      path: '/',
      handler: function(request, h) {
        return h.file(Path.join(process.cwd(), 'client/index.html'));
      }
    });

    server.route({
      method: 'GET',
      path: '/{fileId}',
      handler: function(request, h) {
        const fileId = request.params.fileId;
        return h.file(Path.join(process.cwd(), 'songs', fileId));
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
