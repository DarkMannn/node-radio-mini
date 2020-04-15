#!/usr/bin/env node

require('dotenv').config();

const Hapi = require('@hapi/hapi');
const StaticFilePlugin = require('@hapi/inert');
const Routes = require('./routes');
const Engine = require('./engine.js');

void async function startApp() {

    try {
        const server = Hapi.server({
            port: process.env.PORT || 8080,
            host: process.env.HOST || 'localhost',
            compression: false,
            routes: { files: { relativeTo: `${__dirname}/public` } }
        });
        await server.register(StaticFilePlugin);
        await server.register(Routes);

        Engine.startEngine();
        await server.start();
        console.log(`Server running at: ${server.info.uri}`);
    }
    catch (err) {
        console.log(`Server errored with: ${err}`);
        process.exit(1);
    }
}();
