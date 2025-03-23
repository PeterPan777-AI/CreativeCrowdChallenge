import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function LoadingComponent({ message = 'Loading...' }) {
  return (
    <View className="flex-1 justify-center items-center bg-background">
      <StatusBar style="auto" />
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text className="text-gray-600 mt-4 text-lg font-medium">{message}</Text>
    </View>
  );
}
