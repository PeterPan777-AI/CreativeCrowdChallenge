import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import supabase from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';
import CategorySuggestionForm from '../components/CategorySuggestionForm';

export default function CategorySuggestionScreen() {
  const { user, userDetails } = useAuth();
  const [categories, setCategories] = useState([]);
  const [userSuggestions, setUserSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    fetchCategories();
    if (user) {
      fetchUserSuggestions();
    }
    
    // Set up subscription for category changes
    const subscription = supabase
      .channel('category_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'categories' 
      }, () => {
        fetchCategories();
      })
      .subscribe();
      
    // Set up subscription for suggestion changes
    const suggestionSubscription = supabase
      .channel('suggestion_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'category_suggestions',
        filter: user ? `user_id=eq.${user.id}` : undefined
      }, () => {
        fetchUserSuggestions();
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
      suggestionSubscription.unsubscribe();
    };
  }, [user]);
  
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
        
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const fetchUserSuggestions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('category_suggestions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setUserSuggestions(data || []);
    } catch (error) {
      console.error('Error fetching user suggestions:', error);
    }
  };
  
  const handleSubmitSuggestion = async (name, description) => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to suggest categories');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('category_suggestions')
        .insert([
          {
            name,
            description,
            user_id: user.id,
            status: 'pending',
            created_at: new Date(),
          }
        ]);
        
      if (error) throw error;
      
      Alert.alert(
        'Success',
        'Your category suggestion has been submitted for review',
        [{ text: 'OK' }]
      );
      
      // Refresh user suggestions
      fetchUserSuggestions();
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      Alert.alert('Error', 'Failed to submit your suggestion');
    }
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchCategories();
    if (user) {
      fetchUserSuggestions();
    }
  };
  
  const renderCategoryItem = ({ item }) => (
    <View className="bg-white rounded-lg p-4 flex-row items-center">
      <View className="w-2 h-2 rounded-full bg-green-500 mr-3" />
      <Text className="text-gray-800 font-medium">{item.name}</Text>
    </View>
  );
  
  const renderUserSuggestionItem = ({ item }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'approved': return 'text-green-600';
        case 'rejected': return 'text-red-600';
        default: return 'text-amber-600';
      }
    };
    
    const getStatusIcon = (status) => {
      switch (status) {
        case 'approved': return 'check-circle';
        case 'rejected': return 'x-circle';
        default: return 'clock';
      }
    };
    
    return (
      <View className="bg-white rounded-lg p-4 mb-3">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-gray-800 font-medium">{item.name}</Text>
          <View className="flex-row items-center">
            <Feather 
              name={getStatusIcon(item.status)} 
              size={16} 
              color={item.status === 'approved' ? '#059669' : item.status === 'rejected' ? '#DC2626' : '#D97706'} 
            />
            <Text className={`ml-1 ${getStatusColor(item.status)}`}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
        <Text className="text-gray-600">{item.description}</Text>
        <Text className="text-gray-400 text-xs mt-2">
          Submitted on {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    );
  };
  
  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Loading categories...</Text>
      </View>
    );
  }
  
  return (
    <View className="flex-1 bg-background">
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-800 mb-2">Categories</Text>
        <Text className="text-gray-600 mb-6">
          Browse available categories or suggest a new one
        </Text>
        
        {/* Category suggestion form */}
        <CategorySuggestionForm onSubmit={handleSubmitSuggestion} />
        
        {/* Current categories */}
        <View className="mt-8 mb-6">
          <Text className="text-xl font-bold text-gray-800 mb-4">
            Available Categories
          </Text>
          
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderCategoryItem}
            ItemSeparatorComponent={() => <View className="h-2" />}
            contentContainerStyle={{ paddingBottom: 8 }}
            scrollEnabled={false}
            ListEmptyComponent={
              <View className="py-6 items-center bg-white rounded-lg">
                <Text className="text-gray-500">No categories available</Text>
              </View>
            }
          />
        </View>
        
        {/* User's suggestions */}
        {user && (
          <View className="mb-6">
            <Text className="text-xl font-bold text-gray-800 mb-4">
              Your Suggestions
            </Text>
            
            {userSuggestions.length > 0 ? (
              <FlatList
                data={userSuggestions}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderUserSuggestionItem}
                scrollEnabled={false}
              />
            ) : (
              <View className="py-6 items-center bg-white rounded-lg">
                <Text className="text-gray-500">
                  You haven't suggested any categories yet
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
