import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function RatingComponent({ 
  userRating = 0, 
  avgRating = 0, 
  totalRatings = 0, 
  onRate, 
  disabled = false 
}) {
  const [hoveredRating, setHoveredRating] = useState(0);
  
  const handleRate = (rating) => {
    if (!disabled && onRate) {
      onRate(rating);
    }
  };
  
  const renderStars = (currentRating, interactive = false) => {
    const stars = [];
    
    for (let i = 1; i <= 10; i++) {
      const filled = i <= currentRating;
      const hovered = interactive && i <= hoveredRating;
      
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => interactive && handleRate(i)}
          onPressIn={() => interactive && setHoveredRating(i)}
          onPressOut={() => interactive && setHoveredRating(0)}
          disabled={!interactive || disabled}
          className={`mr-1 ${disabled ? 'opacity-50' : ''}`}
        >
          <Feather 
            name={filled || hovered ? 'star' : 'star'} 
            size={interactive ? 24 : 16} 
            color={filled || hovered ? '#F59E0B' : '#E5E7EB'} 
          />
        </TouchableOpacity>
      );
    }
    
    return stars;
  };
  
  return (
    <View className="bg-gray-50 rounded-lg p-3 mt-1">
      {/* Average rating display */}
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center">
          <Text className="text-gray-700 font-medium mr-2">Rating:</Text>
          <Text className="text-lg font-bold text-amber-500 mr-1">{avgRating}</Text>
          <Text className="text-gray-500">({totalRatings} {totalRatings === 1 ? 'vote' : 'votes'})</Text>
        </View>
      </View>
      
      {/* User's rating or rating selector */}
      {!disabled ? (
        <View>
          <Text className="text-gray-700 font-medium mb-2">Rate this submission:</Text>
          <View className="flex-row items-center justify-center py-2">
            {renderStars(userRating, true)}
          </View>
          {userRating > 0 && (
            <Text className="text-center text-gray-600 italic mt-1">
              Your rating: {userRating}/10
            </Text>
          )}
        </View>
      ) : (
        <View className="flex-row flex-wrap items-center justify-center">
          {renderStars(avgRating)}
          {disabled && userRating === 0 && (
            <Text className="text-sm text-gray-500 mt-1 w-full text-center">
              {disabled && userRating === 0 && 
                "You can't rate your own submission or this competition has ended."}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
