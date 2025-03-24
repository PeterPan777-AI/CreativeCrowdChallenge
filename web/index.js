import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '../App';

// Debug logs
console.log('web/index.js is being executed');

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM content loaded');
  
  // Get root element and confirm it exists
  const rootElement = document.getElementById('root');
  console.log('Root element found:', !!rootElement);
  
  if (!rootElement) {
    // Create root element if missing
    console.log('Creating root element');
    const newRoot = document.createElement('div');
    newRoot.id = 'root';
    document.body.appendChild(newRoot);
  }
  
  try {
    // Always get the root element (either existing or newly created)
    const root = createRoot(document.getElementById('root'));
    
    // Render with additional error handling
    console.log('Attempting to render App component');
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('App rendered successfully');
    
  } catch (error) {
    console.error('Error rendering App:', error);
    
    // Basic error display
    document.body.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background-color:#3B82F6;color:white;padding:20px;text-align:center">
        <h1>CreativeCrowdChallenge</h1>
        <p>Could not load application. Error: ${error.message}</p>
        <button 
          onclick="window.location.reload()"
          style="margin-top:20px;padding:10px 20px;background-color:white;color:#3B82F6;border:none;border-radius:5px;cursor:pointer"
        >
          Reload Application
        </button>
      </div>
    `;
  }
});