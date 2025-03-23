import { createRoot } from 'react-dom/client';
import App from '../App';
import { AppRegistry } from 'react-native';

// Register the app
AppRegistry.registerComponent('CreativeCrowdChallenge', () => App);

// Initialize the root
const rootTag = document.getElementById('root');
const root = createRoot(rootTag);

// Create the app
const RNApp = AppRegistry.getApplication('CreativeCrowdChallenge');

// Render the app
root.render(RNApp.element);