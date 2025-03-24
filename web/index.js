import { createRoot } from 'react-dom/client';
import App from '../App';
import { AppRegistry } from 'react-native';

// Register the app
AppRegistry.registerComponent('CreativeCrowdChallenge', () => App);

// Initialize web-specific settings
AppRegistry.runApplication('CreativeCrowdChallenge', {
  rootTag: document.getElementById('root')
});