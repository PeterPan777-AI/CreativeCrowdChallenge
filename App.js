import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, Button, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Debug logging
console.log('App.js is being executed');
console.log('Running on platform:', Platform.OS);

export default function App() {
  const [showContent, setShowContent] = useState(false);
  
  useEffect(() => {
    console.log('App component mounted');
    // Set a flag after component mounts to ensure all hooks run properly
    const timer = setTimeout(() => {
      console.log('Setting showContent to true');
      setShowContent(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Very simple welcome screen - minimal components to debug initial rendering
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>CreativeCrowdChallenge</Text>
      <Text style={styles.subtitle}>
        Welcome to the app! {showContent ? '(Content loaded)' : '(Loading...)'}
      </Text>
      <Text style={styles.info}>Platform: {Platform.OS}</Text>
      <View style={styles.buttonContainer}>
        <Button 
          title="Get Started" 
          onPress={() => alert('Button pressed!')} 
          color="#4361EE"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#3B82F6', // Blue background
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 24,
    textAlign: 'center',
  },
  info: {
    fontSize: 14,
    color: '#E5E7EB',
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 16,
  },
});
