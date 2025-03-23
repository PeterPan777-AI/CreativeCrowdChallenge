import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../styles';

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.gray[50],
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingLabel: {
    color: theme.colors.gray[700],
    fontWeight: '500',
    marginRight: 8,
  },
  ratingValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F59E0B', // amber-500
    marginRight: 4,
  },
  votesText: {
    color: theme.colors.gray[500],
  },
  rateText: {
    color: theme.colors.gray[700],
    fontWeight: '500',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  starButton: {
    marginRight: 4,
  },
  disabledStar: {
    opacity: 0.5,
  },
  userRatingText: {
    textAlign: 'center',
    color: theme.colors.gray[600],
    fontStyle: 'italic',
    marginTop: 4,
  },
  readonlyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledMessage: {
    fontSize: 14,
    color: theme.colors.gray[500],
    marginTop: 4,
    width: '100%',
    textAlign: 'center',
  }
});

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
          style={[
            styles.starButton,
            disabled && styles.disabledStar
          ]}
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
    <View style={styles.container}>
      {/* Average rating display */}
      <View style={styles.ratingHeader}>
        <View style={styles.ratingRow}>
          <Text style={styles.ratingLabel}>Rating:</Text>
          <Text style={styles.ratingValue}>{avgRating}</Text>
          <Text style={styles.votesText}>
            ({totalRatings} {totalRatings === 1 ? 'vote' : 'votes'})
          </Text>
        </View>
      </View>
      
      {/* User's rating or rating selector */}
      {!disabled ? (
        <View>
          <Text style={styles.rateText}>Rate this submission:</Text>
          <View style={styles.starsContainer}>
            {renderStars(userRating, true)}
          </View>
          {userRating > 0 && (
            <Text style={styles.userRatingText}>
              Your rating: {userRating}/10
            </Text>
          )}
        </View>
      ) : (
        <View style={styles.readonlyContainer}>
          {renderStars(avgRating)}
          {disabled && userRating === 0 && (
            <Text style={styles.disabledMessage}>
              You can't rate your own submission or this competition has ended.
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
