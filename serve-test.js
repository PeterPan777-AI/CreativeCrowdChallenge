const http = require('http');
const fs = require('fs');
const path = require('path');

// Create a simple HTTP server
const server = http.createServer((req, res) => {
    console.log(`Received request for ${req.url}`);
    
    // Serve the simple-test.html file for all requests
    const filePath = path.join(__dirname, 'simple-test.html');
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            console.error(`Error reading file: ${err}`);
            res.writeHead(500);
            res.end('Error loading test page');
            return;
        }
        
        console.log('Successfully read test HTML file');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
    });
});

// Listen on port 5000
const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Test server running at http://localhost:${PORT}/`);
    console.log('Press Ctrl+C to stop');
});