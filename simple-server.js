const http = require('http');
const fs = require('fs');
const path = require('path');

// Create a basic HTTP server
const server = http.createServer((req, res) => {
  console.log(`Request received: ${req.url}`);
  
  // Always serve simple-test.html regardless of the URL
  const filePath = path.join(__dirname, 'simple-test.html');
  
  // Read the HTML file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      console.error(`Error reading file: ${err}`);
      
      // If file cannot be read, send error response with detailed error
      res.writeHead(500);
      res.end(`Error reading file: ${err.message}. Path attempted: ${filePath}`);
      return;
    }
    
    console.log(`Serving simple-test.html... (File size: ${content.length} bytes)`);
    
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
  console.log(`Server base directory: ${__dirname}`);
  console.log(`Now serving simple-test.html from: ${path.join(__dirname, 'simple-test.html')}`);
  console.log(`This is a more feature-rich page with tabs and basic app functionality`);
});