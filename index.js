const http = require('http');
port = process.env.PORT || 8080

const requestListener = function (req, res) {
  res.writeHead(200);
  res.end('42');
}

const server = http.createServer(requestListener);
server.listen(port);
