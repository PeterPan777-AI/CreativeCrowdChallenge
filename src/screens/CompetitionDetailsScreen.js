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
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import supabase from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';
import SubmissionItem from '../components/SubmissionItem';
import RatingComponent from '../components/RatingComponent';
import BusinessFeatures from '../components/BusinessFeatures';

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
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Loading competition details...</Text>
      </View>
    );
  }
  
  if (!competition) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Feather name="alert-circle" size={60} color="#EF4444" />
        <Text className="text-lg text-gray-700 mt-4">Competition not found</Text>
        <TouchableOpacity
          className="mt-6 bg-primary px-6 py-3 rounded-lg"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const isCompetitionActive = new Date(competition.end_date) > new Date();
  const isBusiness = competition.type === 'business';
  
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4">
        {/* Competition header */}
        <View className={`p-4 rounded-lg mb-4 ${isBusiness ? 'bg-amber-50 border border-amber-200' : 'bg-purple-50 border border-purple-200'}`}>
          <View className="flex-row justify-between items-center mb-2">
            <View className="flex-row items-center">
              <Feather 
                name={isBusiness ? 'briefcase' : 'user'} 
                size={20} 
                color={isBusiness ? '#F59E0B' : '#8B5CF6'} 
              />
              <Text className={`ml-2 font-medium ${isBusiness ? 'text-amber-700' : 'text-purple-700'}`}>
                {isBusiness ? 'Business' : 'Individual'} Competition
              </Text>
            </View>
            <View className={`px-3 py-1 rounded-full ${isCompetitionActive ? 'bg-green-100' : 'bg-red-100'}`}>
              <Text className={`text-xs font-medium ${isCompetitionActive ? 'text-green-800' : 'text-red-800'}`}>
                {isCompetitionActive ? 'Active' : 'Ended'}
              </Text>
            </View>
          </View>
          
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            {competition.title}
          </Text>
          
          <Text className="text-gray-600 mb-4">
            {competition.description}
          </Text>
          
          <View className="flex-row flex-wrap">
            <View className="mr-4 mb-2">
              <Text className="text-xs text-gray-500">Category</Text>
              <Text className="text-gray-800 font-medium">{competition.category}</Text>
            </View>
            
            <View className="mr-4 mb-2">
              <Text className="text-xs text-gray-500">Prize</Text>
              <Text className="text-gray-800 font-medium">${competition.prize_amount}</Text>
            </View>
            
            <View className="mr-4 mb-2">
              <Text className="text-xs text-gray-500">Start Date</Text>
              <Text className="text-gray-800 font-medium">
                {new Date(competition.start_date).toLocaleDateString()}
              </Text>
            </View>
            
            <View className="mb-2">
              <Text className="text-xs text-gray-500">End Date</Text>
              <Text className="text-gray-800 font-medium">
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
            className="bg-primary py-3 rounded-lg items-center mb-6"
            onPress={handleSubmit}
          >
            <Text className="text-white font-bold text-lg">Submit Your Entry</Text>
          </TouchableOpacity>
        )}
        
        {userHasSubmitted && (
          <View className="bg-green-100 p-4 rounded-lg mb-6 flex-row items-center">
            <Feather name="check-circle" size={20} color="#10B981" />
            <Text className="text-green-800 ml-2 flex-1">
              You've already submitted an entry to this competition.
            </Text>
          </View>
        )}
        
        {/* Submissions section */}
        <View>
          <Text className="text-xl font-bold text-gray-800 mb-4">
            Submissions ({submissions.length})
          </Text>
          
          {submissionsLoading ? (
            <View className="py-12 items-center">
              <ActivityIndicator size="small" color="#3B82F6" />
              <Text className="text-gray-500 mt-2">Loading submissions...</Text>
            </View>
          ) : submissions.length === 0 ? (
            <View className="py-12 items-center bg-white rounded-lg">
              <Feather name="inbox" size={48} color="#CBD5E1" />
              <Text className="text-gray-500 mt-4 text-center">
                No submissions yet. Be the first to submit!
              </Text>
            </View>
          ) : (
            submissions.map((submission) => (
              <View key={submission.id} className="mb-4">
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
