import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import supabase from '../utils/supabaseClient';
import TabsComponent from '../components/TabsComponent';

export default function AdminScreen() {
  const { user, userDetails } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('categories'); // 'categories', 'competitions'
  
  const [categorySuggestions, setCategorySuggestions] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  
  useEffect(() => {
    if (user && userDetails?.role === 'admin') {
      fetchData();
    }
    
    // Set up subscription for category suggestions
    const categorySuggestionSubscription = supabase
      .channel('category_suggestion_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'category_suggestions'
      }, () => {
        fetchCategorySuggestions();
      })
      .subscribe();
      
    // Set up subscription for competitions
    const competitionSubscription = supabase
      .channel('competition_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'competitions'
      }, () => {
        fetchCompetitions();
      })
      .subscribe();
    
    return () => {
      categorySuggestionSubscription.unsubscribe();
      competitionSubscription.unsubscribe();
    };
  }, [user, userDetails]);
  
  const fetchData = () => {
    if (selectedTab === 'categories') {
      fetchCategorySuggestions();
    } else {
      fetchCompetitions();
    }
  };
  
  const fetchCategorySuggestions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('category_suggestions')
        .select('*, profiles(username)')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setCategorySuggestions(data || []);
    } catch (error) {
      console.error('Error fetching category suggestions:', error);
      Alert.alert('Error', 'Failed to load category suggestions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const fetchCompetitions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('competitions')
        .select('*, profiles(username)')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setCompetitions(data || []);
    } catch (error) {
      console.error('Error fetching competitions:', error);
      Alert.alert('Error', 'Failed to load competitions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const handleApproveSuggestion = async (suggestion) => {
    try {
      // First, update the suggestion status
      const { error: updateError } = await supabase
        .from('category_suggestions')
        .update({ status: 'approved', updated_at: new Date() })
        .eq('id', suggestion.id);
        
      if (updateError) throw updateError;
      
      // Then, add the category to the categories table
      const { error: insertError } = await supabase
        .from('categories')
        .insert([
          {
            name: suggestion.name,
            description: suggestion.description,
            created_at: new Date(),
          }
        ]);
        
      if (insertError) throw insertError;
      
      Alert.alert('Success', 'Category suggestion approved and added to categories');
      fetchCategorySuggestions();
    } catch (error) {
      console.error('Error approving suggestion:', error);
      Alert.alert('Error', 'Failed to approve category suggestion');
    }
  };
  
  const handleRejectSuggestion = async (suggestionId) => {
    try {
      const { error } = await supabase
        .from('category_suggestions')
        .update({ status: 'rejected', updated_at: new Date() })
        .eq('id', suggestionId);
        
      if (error) throw error;
      
      Alert.alert('Success', 'Category suggestion rejected');
      fetchCategorySuggestions();
    } catch (error) {
      console.error('Error rejecting suggestion:', error);
      Alert.alert('Error', 'Failed to reject category suggestion');
    }
  };
  
  const handleToggleCompetitionStatus = async (competition) => {
    const newStatus = competition.status === 'active' ? 'inactive' : 'active';
    
    try {
      const { error } = await supabase
        .from('competitions')
        .update({ status: newStatus, updated_at: new Date() })
        .eq('id', competition.id);
        
      if (error) throw error;
      
      Alert.alert('Success', `Competition ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      fetchCompetitions();
    } catch (error) {
      console.error('Error updating competition status:', error);
      Alert.alert('Error', 'Failed to update competition status');
    }
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };
  
  const renderSuggestionItem = ({ item }) => {
    // Don't show action buttons for already processed suggestions
    const isPending = item.status === 'pending';
    
    return (
      <View className="bg-white rounded-lg p-4 shadow-sm mb-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-lg font-bold text-gray-800">{item.name}</Text>
          <View className={`px-3 py-1 rounded-full ${
            item.status === 'approved' ? 'bg-green-100' : 
            item.status === 'rejected' ? 'bg-red-100' : 'bg-amber-100'
          }`}>
            <Text className={`text-xs font-medium ${
              item.status === 'approved' ? 'text-green-800' : 
              item.status === 'rejected' ? 'text-red-800' : 'text-amber-800'
            }`}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
        
        <Text className="text-gray-600 mb-3">{item.description}</Text>
        
        <View className="flex-row justify-between items-center">
          <Text className="text-gray-500 text-xs">
            By {item.profiles?.username || 'Unknown user'} • {new Date(item.created_at).toLocaleDateString()}
          </Text>
          
          {isPending && (
            <View className="flex-row">
              <TouchableOpacity
                className="bg-green-500 rounded-lg px-3 py-1.5 mr-2"
                onPress={() => handleApproveSuggestion(item)}
              >
                <Text className="text-white font-medium">Approve</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="bg-red-500 rounded-lg px-3 py-1.5"
                onPress={() => handleRejectSuggestion(item.id)}
              >
                <Text className="text-white font-medium">Reject</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };
  
  const renderCompetitionItem = ({ item }) => {
    const isActive = item.status === 'active';
    
    return (
      <View className="bg-white rounded-lg p-4 shadow-sm mb-4">
        <View className="flex-row justify-between items-center mb-2">
          <View className="flex-row items-center">
            <Feather 
              name={item.type === 'business' ? 'briefcase' : 'user'} 
              size={16} 
              color={item.type === 'business' ? '#F59E0B' : '#8B5CF6'} 
              style={{ marginRight: 8 }}
            />
            <Text className="text-lg font-bold text-gray-800">{item.title}</Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Text className={`text-xs font-medium ${isActive ? 'text-green-800' : 'text-gray-800'}`}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
        
        <Text className="text-gray-600 mb-3">
          {item.description.length > 100 
            ? item.description.substring(0, 100) + '...' 
            : item.description}
        </Text>
        
        <View className="flex-row mb-3">
          <View className="mr-4">
            <Text className="text-xs text-gray-500">Prize</Text>
            <Text className="text-gray-800">${item.prize_amount}</Text>
          </View>
          
          <View className="mr-4">
            <Text className="text-xs text-gray-500">Created By</Text>
            <Text className="text-gray-800">{item.profiles?.username || 'Unknown'}</Text>
          </View>
          
          <View>
            <Text className="text-xs text-gray-500">Dates</Text>
            <Text className="text-gray-800">
              {new Date(item.start_date).toLocaleDateString()} - {new Date(item.end_date).toLocaleDateString()}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          className={`rounded-lg py-2 items-center ${isActive ? 'bg-red-100' : 'bg-green-100'}`}
          onPress={() => handleToggleCompetitionStatus(item)}
        >
          <Text className={`font-medium ${isActive ? 'text-red-700' : 'text-green-700'}`}>
            {isActive ? 'Deactivate Competition' : 'Activate Competition'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  // Check if user is admin
  if (userDetails?.role !== 'admin') {
    return (
      <View className="flex-1 justify-center items-center bg-background p-6">
        <Feather name="lock" size={60} color="#EF4444" />
        <Text className="text-xl font-bold text-gray-800 mt-6 text-center">
          Admin Access Required
        </Text>
        <Text className="text-center text-gray-600 mt-2">
          You don't have permission to access this area.
        </Text>
      </View>
    );
  }
  
  const tabs = [
    { key: 'categories', label: 'Category Suggestions' },
    { key: 'competitions', label: 'Competitions' },
  ];
  
  return (
    <View className="flex-1 bg-background">
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-800 mb-2">Admin Dashboard</Text>
        <Text className="text-gray-600 mb-6">
          Manage category suggestions and competitions
        </Text>
        
        <TabsComponent 
          tabs={tabs} 
          selectedTab={selectedTab} 
          onTabChange={(tab) => {
            setSelectedTab(tab);
            setLoading(true);
            if (tab === 'categories') {
              fetchCategorySuggestions();
            } else {
              fetchCompetitions();
            }
          }} 
        />
        
        {loading && !refreshing ? (
          <View className="flex-1 justify-center items-center py-20">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-gray-600 mt-4">Loading data...</Text>
          </View>
        ) : (
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {selectedTab === 'categories' ? (
              categorySuggestions.length === 0 ? (
                <View className="bg-white rounded-lg p-8 items-center mt-4">
                  <Feather name="list" size={48} color="#CBD5E1" />
                  <Text className="text-gray-500 mt-4 text-center">
                    No category suggestions found
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={categorySuggestions}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderSuggestionItem}
                  scrollEnabled={false}
                />
              )
            ) : (
              competitions.length === 0 ? (
                <View className="bg-white rounded-lg p-8 items-center mt-4">
                  <Feather name="award" size={48} color="#CBD5E1" />
                  <Text className="text-gray-500 mt-4 text-center">
                    No competitions found
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={competitions}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderCompetitionItem}
                  scrollEnabled={false}
                />
              )
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
