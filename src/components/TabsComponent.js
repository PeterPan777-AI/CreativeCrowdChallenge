import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

export default function TabsComponent({ tabs, selectedTab, onTabChange }) {
  if (!tabs || tabs.length === 0) return null;
  
  return (
    <View className="mb-4">
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 4 }}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            className={`py-2 px-4 mr-2 rounded-full ${
              selectedTab === tab.key 
                ? 'bg-primary' 
                : 'bg-gray-200'
            }`}
            onPress={() => onTabChange(tab.key)}
          >
            <Text
              className={`font-medium ${
                selectedTab === tab.key 
                  ? 'text-white' 
                  : 'text-gray-700'
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
