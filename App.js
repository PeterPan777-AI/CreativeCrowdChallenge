import React from 'react';
import { Text, View } from 'react-native';

// Super simple App component - just to test basic rendering
console.log('App.js is being executed');

export default function App() {
  console.log('App component rendering');
  
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#3B82F6',
      padding: 20
    }}>
      <Text style={{
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 16,
        textAlign: 'center'
      }}>
        CreativeCrowdChallenge
      </Text>
    </View>
  );
}
