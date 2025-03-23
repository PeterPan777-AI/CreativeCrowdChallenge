import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import supabase from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';
import CategorySuggestionForm from '../components/CategorySuggestionForm';
import { theme, globalStyles } from '../styles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.gray[800],
    marginBottom: 8,
  },
  pageSubtitle: {
    color: theme.colors.gray[600],
    marginBottom: 24,
  },
  sectionContainer: {
    marginTop: 32,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.gray[800],
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    color: theme.colors.gray[600],
    marginTop: 16,
  },
  categoryItem: {
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.success,
    marginRight: 12,
  },
  categoryName: {
    color: theme.colors.gray[800],
    fontWeight: '500',
  },
  itemSeparator: {
    height: 8,
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: 8,
  },
  emptyText: {
    color: theme.colors.gray[500],
  },
  suggestionItem: {
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  suggestionName: {
    color: theme.colors.gray[800],
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 4,
  },
  approvedText: {
    color: '#059669', // green-600
  },
  rejectedText: {
    color: '#DC2626', // red-600
  },
  pendingText: {
    color: '#D97706', // amber-600
  },
  suggestionDescription: {
    color: theme.colors.gray[600],
  },
  suggestionDate: {
    color: theme.colors.gray[400],
    fontSize: 12,
    marginTop: 8,
  }
});

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
    <View style={styles.categoryItem}>
      <View style={styles.categoryDot} />
      <Text style={styles.categoryName}>{item.name}</Text>
    </View>
  );
  
  const renderUserSuggestionItem = ({ item }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'approved': return styles.approvedText;
        case 'rejected': return styles.rejectedText;
        default: return styles.pendingText;
      }
    };
    
    const getStatusIcon = (status) => {
      switch (status) {
        case 'approved': return 'check-circle';
        case 'rejected': return 'x-circle';
        default: return 'clock';
      }
    };
    
    const getStatusIconColor = (status) => {
      switch (status) {
        case 'approved': return '#059669'; // green-600
        case 'rejected': return '#DC2626'; // red-600
        default: return '#D97706'; // amber-600
      }
    };
    
    return (
      <View style={styles.suggestionItem}>
        <View style={styles.suggestionHeader}>
          <Text style={styles.suggestionName}>{item.name}</Text>
          <View style={styles.statusContainer}>
            <Feather 
              name={getStatusIcon(item.status)} 
              size={16} 
              color={getStatusIconColor(item.status)} 
            />
            <Text style={[styles.statusText, getStatusColor(item.status)]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
        <Text style={styles.suggestionDescription}>{item.description}</Text>
        <Text style={styles.suggestionDate}>
          Submitted on {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    );
  };
  
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.pageTitle}>Categories</Text>
        <Text style={styles.pageSubtitle}>
          Browse available categories or suggest a new one
        </Text>
        
        {/* Category suggestion form */}
        <CategorySuggestionForm onSubmit={handleSubmitSuggestion} />
        
        {/* Current categories */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            Available Categories
          </Text>
          
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderCategoryItem}
            ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
            contentContainerStyle={{ paddingBottom: 8 }}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No categories available</Text>
              </View>
            }
          />
        </View>
        
        {/* User's suggestions */}
        {user && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>
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
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
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
