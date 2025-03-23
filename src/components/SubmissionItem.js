import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function SubmissionItem({ submission, showCompetition = false }) {
  if (!submission) return null;
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const handleOpenMedia = (url) => {
    if (url && Linking.canOpenURL(url)) {
      Linking.openURL(url);
    }
  };
  
  return (
    <View className="bg-white rounded-lg p-4 shadow-sm">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-lg font-bold text-gray-800">
          {submission.title}
        </Text>
        <Text className="text-xs text-gray-500">
          {formatDate(submission.created_at)}
        </Text>
      </View>
      
      {showCompetition && submission.competitions && (
        <View className="flex-row items-center mb-2">
          <Feather 
            name={submission.competitions.type === 'business' ? 'briefcase' : 'user'} 
            size={14} 
            color={submission.competitions.type === 'business' ? '#F59E0B' : '#8B5CF6'} 
          />
          <Text className={`ml-1 text-sm ${submission.competitions.type === 'business' ? 'text-amber-600' : 'text-purple-600'}`}>
            {submission.competitions.title}
          </Text>
          <View className={`ml-2 px-2 py-0.5 rounded-full ${submission.competitions.status === 'active' ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Text className={`text-xs ${submission.competitions.status === 'active' ? 'text-green-700' : 'text-gray-700'}`}>
              {submission.competitions.status === 'active' ? 'Active' : 'Ended'}
            </Text>
          </View>
        </View>
      )}
      
      <Text className="text-gray-600 mb-3">
        {submission.description}
      </Text>
      
      {submission.media_type === 'photo' && submission.media_url && (
        <TouchableOpacity 
          className="rounded-lg overflow-hidden mb-3 bg-gray-100"
          onPress={() => handleOpenMedia(submission.media_url)}
          activeOpacity={0.9}
        >
          <Image 
            source={{ uri: submission.media_url }} 
            className="w-full h-56"
            resizeMode="cover"
          />
        </TouchableOpacity>
      )}
      
      {submission.media_type === 'video' && submission.media_url && (
        <TouchableOpacity 
          className="flex-row items-center bg-gray-100 p-4 rounded-lg mb-3"
          onPress={() => handleOpenMedia(submission.media_url)}
        >
          <Feather name="video" size={24} color="#4B5563" />
          <View className="ml-3 flex-1">
            <Text className="text-gray-800 font-medium">Video Submission</Text>
            <Text className="text-gray-500 text-sm">Tap to view the video</Text>
          </View>
          <Feather name="external-link" size={20} color="#3B82F6" />
        </TouchableOpacity>
      )}
      
      {submission.media_type === 'text' && submission.text_content && (
        <View className="bg-gray-50 p-4 rounded-lg mb-3 border border-gray-200">
          <Text className="text-gray-800 italic">
            "{submission.text_content.length > 150 
              ? submission.text_content.substring(0, 150) + '...' 
              : submission.text_content}"
          </Text>
        </View>
      )}
      
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Feather name="user" size={14} color="#6B7280" />
          <Text className="text-gray-600 ml-1 text-sm">
            {submission.profiles?.username || 'Anonymous'}
          </Text>
        </View>
      </View>
    </View>
  );
}
