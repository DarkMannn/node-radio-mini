#!/usr/bin/env node

require('dotenv').config();

const Path = require('path');
const Hapi = require('@hapi/hapi');
const File = require('@hapi/inert');
const Routes = require('./routes');
const Engine = require('./engine.js');

void async function startApp() {

    try {
        const server = Hapi.server({
            port: process.env.PORT || 8080,
            host: process.env.HOST || 'localhost',
            compression: false,
            routes: {
                files: {
                    relativeTo: Path.join(__dirname, 'public')
                }
            }
        });
        await server.register(File);
        await server.register(Routes);
        Engine.startEngine();

        await server.start();
        console.log(`Server running at ${server.info.uri}`);
    }
    catch (err) {
        console.log(`Server error: ${err}`);
        process.exit(1);
    }
}();
