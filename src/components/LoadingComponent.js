import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { theme, globalStyles } from '../styles';

export default function LoadingComponent({ message = 'Loading...' }) {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  message: {
    color: theme.colors.gray[600],
    marginTop: 16,
    fontSize: 18, 
    fontWeight: '500',
  }
});
