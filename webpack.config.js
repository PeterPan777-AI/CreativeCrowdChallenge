const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

// Debug message
console.log('Webpack config is being processed');

module.exports = async function (env, argv) {
  // Log environment details
  console.log('Webpack env:', JSON.stringify(env, null, 2));
  console.log('Webpack mode:', env.mode);
  
  // Create Expo webpack config
  const config = await createExpoWebpackConfigAsync({
    ...env,
    babel: {
      dangerouslyAddModulePathsToTranspile: ['@ui-kitten/components']
    }
  }, argv);

  // Customize the config
  
  // Ensure proper HTML template
  config.plugins.forEach(plugin => {
    if (plugin.constructor.name === 'HtmlWebpackPlugin') {
      console.log('Setting HTML template to ./web/index.html');
      plugin.options.template = './web/index.html';
    }
  });
  
  // Set proper entry point (this should match how index.js gets loaded)
  config.entry = {
    app: [
      path.resolve(__dirname, 'web/index.js')
    ]
  };
  
  // Add additional resolve extensions for better module resolution
  config.resolve.extensions = [
    '.web.js', '.js', '.jsx', '.json', '.web.jsx', '.ts', '.tsx', '.web.tsx'
  ];
  
  // Report webpack configuration
  console.log('Webpack entry point:', config.entry);
  console.log('Webpack resolve extensions:', config.resolve.extensions);
  
  // Enable more debugging options
  config.stats = 'verbose';
  
  return config;
};