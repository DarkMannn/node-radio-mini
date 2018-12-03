'use strict';

const Hapi = require('hapi');
const Static = require('./routes/index.js');
const { startStreaming } = require('./routes/streamLogic.js');

const server = Hapi.server({
  port: 3050,
  host: '192.168.8.102',
  // compression: false
});

const startApp = async () => {
  try {  
    await server.register(Static);
    
    startStreaming();
    
    console.log(`Server running at ${server.info.uri}`);
    await server.start();
  }
  catch (err) {
    console.log(`Server error: ${err}`);
    process.exit(1);
  }
};


startApp();
