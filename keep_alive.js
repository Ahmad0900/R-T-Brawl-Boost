const http = require('http');

// This creates the simple web server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write("I'm alive");
  res.end();
});

// This function will be exported so index.js can use it
function keepAlive() {
  server.listen(10000, () => {
    // This message will appear in your Render logs
    console.log("Keep-alive server is running.");
  });
}

// This makes the function available to other files
module.exports = keepAlive;
