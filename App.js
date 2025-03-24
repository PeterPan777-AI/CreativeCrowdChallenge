import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, Button, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Debug logging
console.log('App.js is being executed');
console.log('Running on platform:', Platform.OS);

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

// Simple welcome screen component
function WelcomeScreen() {
  return (
    <View style={styles.welcomeContainer}>
      <Text style={styles.welcomeTitle}>CreativeCrowdChallenge</Text>
      <Text style={styles.welcomeSubtitle}>Welcome to the app!</Text>
      <Text style={styles.welcomeInfo}>Platform: {Platform.OS}</Text>
      <View style={styles.buttonContainer}>
        <Button 
          title="Get Started" 
          onPress={() => console.log('Button pressed')} 
          color="#4361EE"
        />
      </View>
    </View>
  );
}

export default function App() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
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
    
    // Simulate initialization to demonstrate loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
      console.log('App loaded successfully');
    }, 1000);
    
    return () => {
      // Restore original console.error on cleanup
      console.error = originalConsoleError;
      clearTimeout(timer);
    };
  }, []);

  // Function to reset the error state
  const resetError = () => {
    setError(null);
  };

  // If there's an error, show the fallback UI
  if (error) {
    return (
      <>
        <StatusBar style="auto" />
        <ErrorFallback error={error} resetError={resetError} />
      </>
    );
  }

  // Show loading indicator
  if (isLoading) {
    return (
      <>
        <StatusBar style="auto" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading application...</Text>
        </View>
      </>
    );
  }

  // Render a simplified app (without navigation or Supabase)
  try {
    return (
      <>
        <StatusBar style="auto" />
        <WelcomeScreen />
      </>
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
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#3B82F6', // Blue background
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 24,
    textAlign: 'center',
  },
  welcomeInfo: {
    fontSize: 14,
    color: '#E5E7EB',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 18,
    color: '#3B82F6',
  },
});
