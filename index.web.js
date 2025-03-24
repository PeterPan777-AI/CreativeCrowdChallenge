// This is a fallback entry point, but we're using web/index.js directly
// for better control of the web platform rendering

import { registerRootComponent } from 'expo';
import App from './App';

console.log('index.web.js is being executed');
registerRootComponent(App);