import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import supabase from '../utils/supabaseClient';
import CompetitionCard from '../components/CompetitionCard';
import TabsComponent from '../components/TabsComponent';
import { globalStyles, theme } from '../styles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.gray[600],
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    color: theme.colors.gray[500],
    marginTop: 16,
    fontSize: 18,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  separator: {
    height: 16,
  }
});

export default function HomeScreen({ navigation }) {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all'); // 'all', 'individual', 'business'
  
  const fetchCompetitions = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('competitions')
        .select('*, profiles(username)')
        .eq('status', 'active')
        .order('start_date', { ascending: false });
      
      // Filter by competition type if not on 'all' tab
      if (selectedTab !== 'all') {
        query = query.eq('type', selectedTab);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setCompetitions(data || []);
    } catch (error) {
      console.error('Error fetching competitions:', error);
      Alert.alert('Error', 'Failed to load competitions. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Subscribe to changes in the competitions table
  useEffect(() => {
    fetchCompetitions();
    
    const subscription = supabase
      .channel('competitions_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'competitions' 
      }, (payload) => {
        // Refresh the competition list when there are changes
        fetchCompetitions();
      })
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [selectedTab]);
  
  // Refresh when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchCompetitions();
    }, [selectedTab])
  );
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchCompetitions();
  };
  
  const handleCompetitionPress = (competition) => {
    navigation.navigate('CompetitionDetails', { 
      competitionId: competition.id,
      title: competition.title,
    });
  };
  
  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'individual', label: 'Individual' },
    { key: 'business', label: 'Business' },
  ];
  
  const renderEmptyList = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Feather name="award" size={60} color="#CBD5E1" />
        <Text style={styles.emptyText}>
          No competitions available right now.
          {selectedTab !== 'all' && ` Try checking the ${selectedTab === 'individual' ? 'Business' : 'Individual'} category.`}
        </Text>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <TabsComponent 
        tabs={tabs} 
        selectedTab={selectedTab} 
        onTabChange={setSelectedTab} 
      />
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading competitions...</Text>
        </View>
      ) : (
        <FlatList
          data={competitions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <CompetitionCard 
              competition={item} 
              onPress={() => handleCompetitionPress(item)} 
            />
          )}
          contentContainerStyle={{ padding: 12 }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmptyList}
        />
      )}
    </View>
  );
}
