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
            handler: (request, h) => {
                
                const { id, responseSink } = queue.makeResponseSink();
                request.app.sinkId = id;
                return h.response(responseSink).type('audio/mpeg');
            },
            options: {
                ext: {
                    onPreResponse: {
                        method: (request, h) => {
                            
                            request.events.once('disconnect', () => {
                                queue.removeResponseSink(request.app.sinkId);
                            });
                            return h.continue;
                        }
                    }
                }
            }
        });
    }
};

module.exports = plugin;
