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
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import supabase from '../utils/supabaseClient';
import TabsComponent from '../components/TabsComponent';
import { globalStyles, theme, combineStyles } from '../styles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.gray[800],
    marginBottom: 8,
  },
  subheader: {
    color: theme.colors.gray[600],
    marginBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    color: theme.colors.gray[600],
    marginTop: 16,
  },
  emptyContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    padding: 32,
    alignItems: 'center',
    marginTop: 16,
  },
  emptyText: {
    color: theme.colors.gray[500],
    marginTop: 16,
    textAlign: 'center',
  },
  // Access Denied
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: 24,
  },
  accessDeniedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.gray[800],
    marginTop: 24,
    textAlign: 'center',
  },
  accessDeniedText: {
    textAlign: 'center',
    color: theme.colors.gray[600],
    marginTop: 8,
  },
  // Suggestion Item Styles
  suggestionCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.gray[800],
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  approvedBadge: {
    backgroundColor: '#D1FAE5', // green-100
  },
  rejectedBadge: {
    backgroundColor: '#FEE2E2', // red-100
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7', // amber-100
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  approvedText: {
    color: '#047857', // green-800
  },
  rejectedText: {
    color: '#B91C1C', // red-800
  },
  pendingText: {
    color: '#92400E', // amber-800
  },
  cardDescription: {
    color: theme.colors.gray[600],
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorText: {
    color: theme.colors.gray[500],
    fontSize: 12,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
  },
  approveButton: {
    backgroundColor: '#10B981', // green-500
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  rejectButton: {
    backgroundColor: '#EF4444', // red-500
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  buttonText: {
    color: theme.colors.white,
    fontWeight: '500',
  },
  // Competition Item Styles
  competitionIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  competitionIcon: {
    marginRight: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoColumn: {
    marginRight: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.colors.gray[500],
  },
  infoValue: {
    color: theme.colors.gray[800],
  },
  toggleButton: {
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  deactivateButton: {
    backgroundColor: '#FEE2E2', // red-100
  },
  activateButton: {
    backgroundColor: '#D1FAE5', // green-100
  },
  deactivateText: {
    color: '#B91C1C', // red-700
    fontWeight: '500',
  },
  activateText: {
    color: '#047857', // green-700
    fontWeight: '500',
  },
});

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
      <View style={styles.suggestionCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <View style={[
            styles.statusBadge,
            item.status === 'approved' ? styles.approvedBadge :
            item.status === 'rejected' ? styles.rejectedBadge : 
            styles.pendingBadge
          ]}>
            <Text style={[
              styles.badgeText,
              item.status === 'approved' ? styles.approvedText :
              item.status === 'rejected' ? styles.rejectedText :
              styles.pendingText
            ]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
        
        <Text style={styles.cardDescription}>{item.description}</Text>
        
        <View style={styles.cardFooter}>
          <Text style={styles.authorText}>
            By {item.profiles?.username || 'Unknown user'} • {new Date(item.created_at).toLocaleDateString()}
          </Text>
          
          {isPending && (
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={styles.approveButton}
                onPress={() => handleApproveSuggestion(item)}
              >
                <Text style={styles.buttonText}>Approve</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={() => handleRejectSuggestion(item.id)}
              >
                <Text style={styles.buttonText}>Reject</Text>
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
      <View style={styles.suggestionCard}>
        <View style={styles.cardHeader}>
          <View style={styles.competitionIconContainer}>
            <Feather 
              name={item.type === 'business' ? 'briefcase' : 'user'} 
              size={16} 
              color={item.type === 'business' ? '#F59E0B' : '#8B5CF6'} 
              style={styles.competitionIcon}
            />
            <Text style={styles.cardTitle}>{item.title}</Text>
          </View>
          <View style={[
            styles.statusBadge,
            isActive ? styles.approvedBadge : styles.pendingBadge
          ]}>
            <Text style={[
              styles.badgeText,
              isActive ? styles.approvedText : styles.pendingText
            ]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
        
        <Text style={styles.cardDescription}>
          {item.description.length > 100 
            ? item.description.substring(0, 100) + '...' 
            : item.description}
        </Text>
        
        <View style={styles.infoRow}>
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>Prize</Text>
            <Text style={styles.infoValue}>${item.prize_amount}</Text>
          </View>
          
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>Created By</Text>
            <Text style={styles.infoValue}>{item.profiles?.username || 'Unknown'}</Text>
          </View>
          
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>Dates</Text>
            <Text style={styles.infoValue}>
              {new Date(item.start_date).toLocaleDateString()} - {new Date(item.end_date).toLocaleDateString()}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={[
            styles.toggleButton,
            isActive ? styles.deactivateButton : styles.activateButton
          ]}
          onPress={() => handleToggleCompetitionStatus(item)}
        >
          <Text style={isActive ? styles.deactivateText : styles.activateText}>
            {isActive ? 'Deactivate Competition' : 'Activate Competition'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  // Check if user is admin
  if (userDetails?.role !== 'admin') {
    return (
      <View style={styles.accessDeniedContainer}>
        <Feather name="lock" size={60} color="#EF4444" />
        <Text style={styles.accessDeniedTitle}>
          Admin Access Required
        </Text>
        <Text style={styles.accessDeniedText}>
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
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.header}>Admin Dashboard</Text>
        <Text style={styles.subheader}>
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
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading data...</Text>
          </View>
        ) : (
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {selectedTab === 'categories' ? (
              categorySuggestions.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Feather name="list" size={48} color="#CBD5E1" />
                  <Text style={styles.emptyText}>
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
                <View style={styles.emptyContainer}>
                  <Feather name="award" size={48} color="#CBD5E1" />
                  <Text style={styles.emptyText}>
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
