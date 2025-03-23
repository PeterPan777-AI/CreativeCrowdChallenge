import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { theme } from '../styles';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
  },
  selectedTab: {
    backgroundColor: theme.colors.primary,
  },
  unselectedTab: {
    backgroundColor: theme.colors.gray[200],
  },
  tabText: {
    fontWeight: '500',
  },
  selectedTabText: {
    color: theme.colors.white,
  },
  unselectedTabText: {
    color: theme.colors.gray[700],
  }
});

export default function TabsComponent({ tabs, selectedTab, onTabChange }) {
  if (!tabs || tabs.length === 0) return null;
  
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 4 }}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              selectedTab === tab.key ? styles.selectedTab : styles.unselectedTab
            ]}
            onPress={() => onTabChange(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab.key ? styles.selectedTabText : styles.unselectedTabText
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
