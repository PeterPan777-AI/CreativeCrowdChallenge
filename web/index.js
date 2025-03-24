import { createRoot } from 'react-dom/client';
import App from '../App';

// Simple debug log to confirm web/index.js is running
console.log('web/index.js is being executed');

// Get the root element
const rootElement = document.getElementById('root');

// Log the root element to confirm it exists
console.log('Root element found:', !!rootElement);

// Create a root using createRoot from react-dom/client
const root = createRoot(rootElement);

try {
  // Render the app component directly
  root.render(<App />);
  console.log('App rendered successfully');
} catch (error) {
  console.error('Error rendering App:', error);
  
  // Attempt to render a fallback UI
  root.render(
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      backgroundColor: '#3B82F6',
      color: 'white',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1>CreativeCrowdChallenge</h1>
      <p>Could not load application. Error: {error.message}</p>
      <button 
        onClick={() => window.location.reload()}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: 'white',
          color: '#3B82F6',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Reload Application
      </button>
    </div>
  );
}