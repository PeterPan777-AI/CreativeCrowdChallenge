import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import supabase from '../utils/supabaseClient';
import UserProfileHeader from '../components/UserProfileHeader';
import SubmissionItem from '../components/SubmissionItem';
import { globalStyles, theme, combineStyles } from '../styles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  statColumn: {
    alignItems: 'center',
    flex: 1,
  },
  statColumnBordered: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.gray[800],
  },
  bestScoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    color: theme.colors.gray[600],
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.gray[800],
    marginBottom: 16,
  },
  emptyStateContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    color: theme.colors.gray[500],
    marginTop: 16,
    textAlign: 'center',
  },
  browseButton: {
    marginTop: 16,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
  },
  browseButtonText: {
    color: theme.colors.white,
    fontWeight: '500',
  },
  submissionContainer: {
    marginBottom: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  ratingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: theme.colors.gray[700],
    marginLeft: 4,
  },
  viewCompetitionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewCompetitionText: {
    color: theme.colors.primary,
    fontWeight: '500',
    marginRight: 4,
  },
  logoutButton: {
    backgroundColor: theme.colors.gray[200],
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 40,
  },
  logoutText: {
    color: theme.colors.gray[800],
    fontWeight: '500',
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
});

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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.contentContainer}>
        <UserProfileHeader 
          userDetails={userDetails}
          stats={stats}
        />
        
        {/* User stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statColumn}>
            <Text style={styles.statValue}>{stats.submissionsCount}</Text>
            <Text style={styles.statLabel}>Submissions</Text>
          </View>
          <View style={[styles.statColumn, styles.statColumnBordered]}>
            <Text style={styles.statValue}>{stats.averageRating}</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
          <View style={styles.statColumn}>
            <Text style={styles.bestScoreValue}>
              {stats.highestRated?.avgRating || 0}
            </Text>
            <Text style={styles.statLabel}>Best Score</Text>
          </View>
        </View>
        
        {/* Submissions list */}
        <View style={globalStyles.mb5}>
          <Text style={styles.sectionTitle}>
            Your Submissions
          </Text>
          
          {userSubmissions.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Feather name="file-text" size={48} color="#CBD5E1" />
              <Text style={styles.emptyStateText}>
                You haven't submitted any entries yet.
              </Text>
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.browseButtonText}>Browse Competitions</Text>
              </TouchableOpacity>
            </View>
          ) : (
            userSubmissions.map((submission) => (
              <View key={submission.id} style={styles.submissionContainer}>
                <SubmissionItem 
                  submission={submission}
                  showCompetition={true}
                />
                
                <View style={styles.ratingRow}>
                  <View style={styles.ratingContainer}>
                    <Feather name="star" size={16} color="#F59E0B" />
                    <Text style={styles.ratingText}>
                      Average Rating: {submission.avgRating}
                    </Text>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.viewCompetitionButton}
                    onPress={() => handleViewCompetition(submission.competition_id)}
                  >
                    <Text style={styles.viewCompetitionText}>View Competition</Text>
                    <Feather name="chevron-right" size={16} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
        
        {/* Logout button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
