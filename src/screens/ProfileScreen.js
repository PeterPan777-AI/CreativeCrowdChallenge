import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import supabase from '../utils/supabaseClient';
import UserProfileHeader from '../components/UserProfileHeader';
import SubmissionItem from '../components/SubmissionItem';

export default function ProfileScreen({ navigation }) {
  const { user, userDetails, signOut } = useAuth();
  
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    submissionsCount: 0,
    averageRating: 0,
    highestRated: null,
  });
  
  const fetchUserSubmissions = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          competitions(id, title, type, status),
          ratings(rating)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Process submissions to include average ratings
      const processedSubmissions = data.map(submission => {
        const ratings = submission.ratings || [];
        const avgRating = ratings.length 
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
          : 0;
        
        return {
          ...submission,
          avgRating: parseFloat(avgRating.toFixed(1))
        };
      });
      
      setUserSubmissions(processedSubmissions);
      
      // Calculate stats
      if (processedSubmissions.length > 0) {
        const totalRatings = processedSubmissions.reduce((sum, s) => sum + s.avgRating, 0);
        const avgRating = totalRatings / processedSubmissions.length;
        const highestRated = [...processedSubmissions].sort((a, b) => b.avgRating - a.avgRating)[0];
        
        setStats({
          submissionsCount: processedSubmissions.length,
          averageRating: parseFloat(avgRating.toFixed(1)) || 0,
          highestRated: highestRated,
        });
      }
    } catch (error) {
      console.error('Error fetching user submissions:', error);
      Alert.alert('Error', 'Failed to load your submissions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    if (user) {
      fetchUserSubmissions();
    }
  }, [user]);
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchUserSubmissions();
  };
  
  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: signOut
        }
      ]
    );
  };
  
  const handleViewCompetition = (competitionId) => {
    navigation.navigate('Home', {
      screen: 'CompetitionDetails',
      params: { competitionId }
    });
  };
  
  if (!user || loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Loading profile...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView 
      className="flex-1 bg-background"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="p-4">
        <UserProfileHeader 
          userDetails={userDetails}
          stats={stats}
        />
        
        {/* User stats */}
        <View className="flex-row justify-between bg-white rounded-lg p-4 shadow-sm mb-6 mt-4">
          <View className="items-center flex-1">
            <Text className="text-2xl font-bold text-gray-800">{stats.submissionsCount}</Text>
            <Text className="text-gray-600">Submissions</Text>
          </View>
          <View className="items-center flex-1 border-l border-r border-gray-200">
            <Text className="text-2xl font-bold text-gray-800">{stats.averageRating}</Text>
            <Text className="text-gray-600">Avg Rating</Text>
          </View>
          <View className="items-center flex-1">
            <Text className="text-2xl font-bold text-primary">
              {stats.highestRated?.avgRating || 0}
            </Text>
            <Text className="text-gray-600">Best Score</Text>
          </View>
        </View>
        
        {/* Submissions list */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-800 mb-4">
            Your Submissions
          </Text>
          
          {userSubmissions.length === 0 ? (
            <View className="bg-white rounded-lg p-8 items-center">
              <Feather name="file-text" size={48} color="#CBD5E1" />
              <Text className="text-gray-500 mt-4 text-center">
                You haven't submitted any entries yet.
              </Text>
              <TouchableOpacity
                className="mt-4 bg-primary px-6 py-2 rounded-lg"
                onPress={() => navigation.navigate('Home')}
              >
                <Text className="text-white font-medium">Browse Competitions</Text>
              </TouchableOpacity>
            </View>
          ) : (
            userSubmissions.map((submission) => (
              <View key={submission.id} className="mb-4">
                <SubmissionItem 
                  submission={submission}
                  showCompetition={true}
                />
                
                <View className="flex-row mt-2">
                  <View className="flex-1 flex-row items-center">
                    <Feather name="star" size={16} color="#F59E0B" />
                    <Text className="text-gray-700 ml-1">
                      Average Rating: {submission.avgRating}
                    </Text>
                  </View>
                  
                  <TouchableOpacity
                    className="flex-row items-center"
                    onPress={() => handleViewCompetition(submission.competition_id)}
                  >
                    <Text className="text-primary font-medium mr-1">View Competition</Text>
                    <Feather name="chevron-right" size={16} color="#3B82F6" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
        
        {/* Logout button */}
        <TouchableOpacity
          className="bg-gray-200 py-3 rounded-lg items-center mb-10"
          onPress={handleLogout}
        >
          <Text className="text-gray-800 font-medium">Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
