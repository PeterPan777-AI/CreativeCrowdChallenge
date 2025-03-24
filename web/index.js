import React from 'react';
import ReactDOM from 'react-dom';
import App from '../App';

// Enhanced debugging
console.log('web/index.js is being executed');

// Create a very simple app wrapper
const AppWrapper = () => {
  console.log('AppWrapper rendering');
  return (
    <div style={{ 
      height: '100%', 
      width: '100%', 
      backgroundColor: '#3B82F6',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      padding: 20,
      color: 'white'
    }}>
      <h1 style={{ fontSize: 28, marginBottom: 16 }}>CreativeCrowdChallenge</h1>
      <p style={{ fontSize: 18, marginBottom: 24 }}>Welcome to the creative community!</p>
      <button 
        style={{ 
          backgroundColor: 'white', 
          color: '#3B82F6',
          border: 'none',
          padding: '10px 20px',
          borderRadius: 5,
          cursor: 'pointer'
        }}
        onClick={() => alert('Button clicked!')}
      >
        Get Started
      </button>
    </div>
  );
};

// Use direct DOM manipulation for a clean approach
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM content loaded');
  
  try {
    console.log('Attempting to render App');
    
    // First try to render the simple wrapper
    ReactDOM.render(<AppWrapper />, document.getElementById('root'));
    
  } catch (error) {
    console.error('Error rendering app:', error);
    
    // Show error directly in the DOM
    document.body.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background-color:#3B82F6;color:white;padding:20px;text-align:center">
        <h1>CreativeCrowdChallenge</h1>
        <p>Error loading app: ${error.message}</p>
        <button 
          onclick="window.location.reload()" 
          style="margin-top:20px;padding:10px 20px;background-color:white;color:#3B82F6;border:none;border-radius:5px;cursor:pointer"
        >
          Reload
        </button>
      </div>
    `;
  }
});