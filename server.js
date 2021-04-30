const http = require('http');
http.createServer(require('./index.js')).listen(12345, () => {
    console.log( "\n\n--------------------Listening on port 12345--------------------\n\n");
});
