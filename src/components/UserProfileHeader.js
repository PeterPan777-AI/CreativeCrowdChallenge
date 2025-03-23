import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function UserProfileHeader({ userDetails, stats }) {
  if (!userDetails) return null;
  
  // Function to generate a color based on username (for the avatar)
  const generateColor = (username) => {
    if (!username) return '#3B82F6'; // Default blue
    
    const colors = [
      '#3B82F6', // blue
      '#8B5CF6', // purple
      '#10B981', // green
      '#F59E0B', // amber
      '#EF4444', // red
      '#EC4899', // pink
    ];
    
    // Simple hash function to determine color
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };
  
  // Generate initials from username
  const getInitials = (username) => {
    if (!username) return '?';
    
    const parts = username.split(' ');
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    
    return username.substring(0, 2).toUpperCase();
  };
  
  const avatarColor = generateColor(userDetails.username);
  const userInitials = getInitials(userDetails.username);
  const joinDate = new Date(userDetails.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });
  
  const isBusiness = userDetails.role === 'business';
  const isAdmin = userDetails.role === 'admin';
  
  return (
    <View className="bg-white rounded-lg p-4 shadow-sm">
      <View className="flex-row items-center">
        {/* User avatar */}
        <View 
          className="w-16 h-16 rounded-full items-center justify-center"
          style={{ backgroundColor: avatarColor }}
        >
          <Text className="text-white text-xl font-bold">{userInitials}</Text>
        </View>
        
        {/* User info */}
        <View className="ml-4 flex-1">
          <Text className="text-xl font-bold text-gray-800">
            {userDetails.username}
          </Text>
          
          <Text className="text-gray-500">
            {userDetails.email}
          </Text>
          
          <View className="flex-row items-center mt-1">
            <Feather name="calendar" size={14} color="#6B7280" />
            <Text className="text-gray-500 text-sm ml-1">
              Member since {joinDate}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Role badge */}
      {(isBusiness || isAdmin) && (
        <View className={`mt-3 py-2 px-3 rounded-lg self-start ${
          isBusiness ? 'bg-amber-100' : 'bg-purple-100'
        }`}>
          <View className="flex-row items-center">
            <Feather 
              name={isBusiness ? 'briefcase' : 'shield'} 
              size={14} 
              color={isBusiness ? '#F59E0B' : '#8B5CF6'} 
            />
            <Text className={`ml-1 font-medium ${
              isBusiness ? 'text-amber-700' : 'text-purple-700'
            }`}>
              {isBusiness ? 'Business Account' : 'Administrator'}
            </Text>
          </View>
        </View>
      )}
      
      {/* Best achievement */}
      {stats?.highestRated && stats.highestRated.avgRating > 0 && (
        <View className="mt-3 bg-blue-50 p-3 rounded-lg">
          <Text className="text-blue-800 font-medium">
            <Feather name="award" size={14} color="#3B82F6" /> Top Rated Submission: {stats.highestRated.title} ({stats.highestRated.avgRating}/10)
          </Text>
        </View>
      )}
    </View>
  );
}
