import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { StatusBar } from 'expo-status-bar';
import { Text, View, StyleSheet, Button } from 'react-native';

// Debug logging
console.log('App.js is being executed');

// Simple error boundary as a function component
function ErrorFallback({ error, resetError }) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorMessage}>{error?.message || 'Unknown error'}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Try Again" onPress={resetError} />
      </View>
    </View>
  );
}

export default function App() {
  const [error, setError] = useState(null);
  
  useEffect(() => {
    console.log('App component mounted');
    
    // Add global error handler
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Log the original error
      originalConsoleError(...args);
      
      // Extract error message if it exists
      const errorMessage = args.find(arg => 
        arg instanceof Error || 
        (typeof arg === 'string' && arg.includes('Error'))
      );
      
      if (errorMessage) {
        setError(errorMessage instanceof Error ? errorMessage : new Error(errorMessage));
      }
    };
    
    return () => {
      // Restore original console.error on cleanup
      console.error = originalConsoleError;
    };
  }, []);

  // Function to reset the error state
  const resetError = () => {
    setError(null);
  };

  // If there's an error, show the fallback UI
  if (error) {
    return <ErrorFallback error={error} resetError={resetError} />;
  }

  // Try rendering a minimal UI first to see if that works
  try {
    return (
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <AppNavigator />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    );
  } catch (err) {
    console.log('Error rendering App:', err);
    return <ErrorFallback error={err} resetError={resetError} />;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#dc3545',
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#343a40',
  },
  buttonContainer: {
    marginTop: 16,
  },
});
