import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import supabase from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';
import SubmissionItem from '../components/SubmissionItem';
import RatingComponent from '../components/RatingComponent';
import BusinessFeatures from '../components/BusinessFeatures';
import { theme, globalStyles } from '../styles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: 16,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  errorIcon: {
    color: theme.colors.error,
  },
  errorText: {
    fontSize: 18,
    color: theme.colors.gray[700],
    marginTop: 16,
  },
  backButton: {
    marginTop: 24,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: theme.colors.white,
    fontWeight: '500',
  },
  competitionCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  businessCard: {
    backgroundColor: '#FEF3C7', // amber-50
    borderWidth: 1,
    borderColor: '#FDE68A', // amber-200
  },
  individualCard: {
    backgroundColor: '#F5F3FF', // purple-50
    borderWidth: 1,
    borderColor: '#DDD6FE', // purple-200
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  businessTypeText: {
    marginLeft: 8,
    fontWeight: '500',
    color: '#B45309', // amber-700
  },
  individualTypeText: {
    marginLeft: 8,
    fontWeight: '500',
    color: '#6D28D9', // purple-700
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  activeBadge: {
    backgroundColor: '#D1FAE5', // green-100
  },
  endedBadge: {
    backgroundColor: '#FEE2E2', // red-100
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  activeStatusText: {
    color: '#065F46', // green-800
  },
  endedStatusText: {
    color: '#991B1B', // red-800
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.gray[800],
    marginBottom: 8,
  },
  description: {
    color: theme.colors.gray[600],
    marginBottom: 16,
  },
  metadataContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metadataItem: {
    marginRight: 16,
    marginBottom: 8,
  },
  metadataLabel: {
    fontSize: 12,
    color: theme.colors.gray[500],
  },
  metadataValue: {
    color: theme.colors.gray[800],
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  submitButtonText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    fontSize: 18,
  },
  submittedContainer: {
    backgroundColor: '#D1FAE5', // green-100
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  submittedText: {
    color: '#065F46', // green-800
    marginLeft: 8,
    flex: 1,
  },
  submissionsHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.gray[800],
    marginBottom: 16,
  },
  submissionsLoadingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  submissionsLoadingText: {
    color: theme.colors.gray[500],
    marginTop: 8,
  },
  emptySubmissionsContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: 8,
  },
  emptySubmissionsIcon: {
    color: '#CBD5E1', // slate-300
  },
  emptySubmissionsText: {
    color: theme.colors.gray[500],
    marginTop: 16,
    textAlign: 'center',
  },
  submissionContainer: {
    marginBottom: 16,
  },
});

export default function CompetitionDetailsScreen({ route, navigation }) {
  const { competitionId } = route.params;
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  
  const [competition, setCompetition] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [userHasSubmitted, setUserHasSubmitted] = useState(false);
  
  useEffect(() => {
    fetchCompetitionDetails();
    fetchSubmissions();
    checkUserSubmission();
    
    // Subscribe to real-time updates for submissions
    const submissionsSubscription = supabase
      .channel('submissions_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'submissions',
        filter: `competition_id=eq.${competitionId}`
      }, (payload) => {
        fetchSubmissions();
      })
      .subscribe();
      
    return () => {
      submissionsSubscription.unsubscribe();
    };
  }, [competitionId]);
  
  const fetchCompetitionDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('competitions')
        .select('*, profiles(username)')
        .eq('id', competitionId)
        .single();
        
      if (error) throw error;
      setCompetition(data);
    } catch (error) {
      console.error('Error fetching competition details:', error);
      Alert.alert('Error', 'Failed to load competition details');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchSubmissions = async () => {
    try {
      setSubmissionsLoading(true);
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          profiles(username),
          ratings(rating, user_id)
        `)
        .eq('competition_id', competitionId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Calculate average ratings for each submission
      const submissionsWithAvgRating = data.map(submission => {
        const ratings = submission.ratings || [];
        const avgRating = ratings.length 
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
          : 0;
        
        // Check if the current user has rated this submission
        const userRating = ratings.find(r => r.user_id === user?.id)?.rating || 0;
        
        return { 
          ...submission, 
          avgRating: parseFloat(avgRating.toFixed(1)),
          userRating
        };
      });
      
      setSubmissions(submissionsWithAvgRating);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      Alert.alert('Error', 'Failed to load submissions');
    } finally {
      setSubmissionsLoading(false);
    }
  };
  
  const checkUserSubmission = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('id')
        .eq('competition_id', competitionId)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (error) throw error;
      setUserHasSubmitted(!!data);
    } catch (error) {
      console.error('Error checking user submission:', error);
    }
  };
  
  const handleSubmit = () => {
    navigation.navigate('Submission', { 
      competitionId, 
      competitionTitle: competition?.title 
    });
  };
  
  const handleRateSubmission = async (submissionId, rating) => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to rate submissions');
      return;
    }
    
    try {
      // Check if user has already rated this submission
      const { data: existingRating, error: checkError } = await supabase
        .from('ratings')
        .select('id')
        .eq('submission_id', submissionId)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (existingRating) {
        // Update existing rating
        const { error: updateError } = await supabase
          .from('ratings')
          .update({ rating, updated_at: new Date() })
          .eq('id', existingRating.id);
          
        if (updateError) throw updateError;
      } else {
        // Insert new rating
        const { error: insertError } = await supabase
          .from('ratings')
          .insert({
            submission_id: submissionId,
            user_id: user.id,
            rating,
            created_at: new Date()
          });
          
        if (insertError) throw insertError;
      }
      
      // Refresh submissions to update ratings
      fetchSubmissions();
    } catch (error) {
      console.error('Error rating submission:', error);
      Alert.alert('Error', 'Failed to save your rating');
    }
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading competition details...</Text>
      </View>
    );
  }
  
  if (!competition) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={60} style={styles.errorIcon} />
        <Text style={styles.errorText}>Competition not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const isCompetitionActive = new Date(competition.end_date) > new Date();
  const isBusiness = competition.type === 'business';
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Competition header */}
        <View style={[
          styles.competitionCard,
          isBusiness ? styles.businessCard : styles.individualCard
        ]}>
          <View style={styles.cardHeader}>
            <View style={styles.typeContainer}>
              <Feather 
                name={isBusiness ? 'briefcase' : 'user'} 
                size={20} 
                color={isBusiness ? '#F59E0B' : '#8B5CF6'} 
              />
              <Text style={isBusiness ? styles.businessTypeText : styles.individualTypeText}>
                {isBusiness ? 'Business' : 'Individual'} Competition
              </Text>
            </View>
            <View style={[
              styles.statusBadge,
              isCompetitionActive ? styles.activeBadge : styles.endedBadge
            ]}>
              <Text style={[
                styles.statusText,
                isCompetitionActive ? styles.activeStatusText : styles.endedStatusText
              ]}>
                {isCompetitionActive ? 'Active' : 'Ended'}
              </Text>
            </View>
          </View>
          
          <Text style={styles.title}>
            {competition.title}
          </Text>
          
          <Text style={styles.description}>
            {competition.description}
          </Text>
          
          <View style={styles.metadataContainer}>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Category</Text>
              <Text style={styles.metadataValue}>{competition.category}</Text>
            </View>
            
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Prize</Text>
              <Text style={styles.metadataValue}>${competition.prize_amount}</Text>
            </View>
            
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Start Date</Text>
              <Text style={styles.metadataValue}>
                {new Date(competition.start_date).toLocaleDateString()}
              </Text>
            </View>
            
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>End Date</Text>
              <Text style={styles.metadataValue}>
                {new Date(competition.end_date).toLocaleDateString()}
              </Text>
            </View>
          </View>
          
          {isBusiness && competition.product_name && (
            <BusinessFeatures competition={competition} />
          )}
        </View>
        
        {/* Submit button */}
        {isCompetitionActive && user && !userHasSubmitted && (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Submit Your Entry</Text>
          </TouchableOpacity>
        )}
        
        {userHasSubmitted && (
          <View style={styles.submittedContainer}>
            <Feather name="check-circle" size={20} color="#10B981" />
            <Text style={styles.submittedText}>
              You've already submitted an entry to this competition.
            </Text>
          </View>
        )}
        
        {/* Submissions section */}
        <View>
          <Text style={styles.submissionsHeader}>
            Submissions ({submissions.length})
          </Text>
          
          {submissionsLoading ? (
            <View style={styles.submissionsLoadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={styles.submissionsLoadingText}>Loading submissions...</Text>
            </View>
          ) : submissions.length === 0 ? (
            <View style={styles.emptySubmissionsContainer}>
              <Feather name="inbox" size={48} style={styles.emptySubmissionsIcon} />
              <Text style={styles.emptySubmissionsText}>
                No submissions yet. Be the first to submit!
              </Text>
            </View>
          ) : (
            submissions.map((submission) => (
              <View key={submission.id} style={styles.submissionContainer}>
                <SubmissionItem submission={submission} />
                <RatingComponent
                  userRating={submission.userRating}
                  avgRating={submission.avgRating}
                  totalRatings={submission.ratings ? submission.ratings.length : 0}
                  onRate={(rating) => handleRateSubmission(submission.id, rating)}
                  disabled={submission.user_id === user?.id || !isCompetitionActive}
                />
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}
