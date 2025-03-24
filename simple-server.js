const http = require('http');
const fs = require('fs');
const path = require('path');

// Create a basic HTTP server
const server = http.createServer((req, res) => {
  console.log(`Request received: ${req.url}`);
  
  // Always serve standalone.html regardless of the URL
  const filePath = path.join(__dirname, 'standalone.html');
  
  // Read the HTML file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      console.error(`Error reading file: ${err}`);
      
      // If file cannot be read, send error response
      res.writeHead(500);
      res.end(`Error: ${err.message}`);
      return;
    }
    
    console.log('Serving standalone.html...');
    
    // Set content type and serve the HTML
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(content);
  });
});

// Use port 5000 to be consistent with other workflows
const PORT = 5000;

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log('Open this URL in your browser to see the standalone page');
});