import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../styles';

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: theme.colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfoContainer: {
    marginLeft: 16,
    flex: 1,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.gray[800],
  },
  email: {
    color: theme.colors.gray[500],
  },
  joinDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  joinDateText: {
    color: theme.colors.gray[500],
    fontSize: 14,
    marginLeft: 4,
  },
  roleBadge: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  businessBadge: {
    backgroundColor: '#FEF3C7', // amber-100
  },
  adminBadge: {
    backgroundColor: '#F3E8FF', // purple-100
  },
  roleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleBadgeText: {
    marginLeft: 4,
    fontWeight: '500',
  },
  businessText: {
    color: '#B45309', // amber-700
  },
  adminText: {
    color: '#6D28D9', // purple-700
  },
  achievementContainer: {
    marginTop: 12,
    backgroundColor: '#EFF6FF', // blue-50
    padding: 12,
    borderRadius: 8,
  },
  achievementText: {
    color: '#1E40AF', // blue-800
    fontWeight: '500',
  }
});

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
    <View style={styles.container}>
      <View style={styles.profileRow}>
        {/* User avatar */}
        <View 
          style={[styles.avatar, { backgroundColor: avatarColor }]}
        >
          <Text style={styles.initials}>{userInitials}</Text>
        </View>
        
        {/* User info */}
        <View style={styles.userInfoContainer}>
          <Text style={styles.username}>
            {userDetails.username}
          </Text>
          
          <Text style={styles.email}>
            {userDetails.email}
          </Text>
          
          <View style={styles.joinDateRow}>
            <Feather name="calendar" size={14} color={theme.colors.gray[500]} />
            <Text style={styles.joinDateText}>
              Member since {joinDate}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Role badge */}
      {(isBusiness || isAdmin) && (
        <View style={[
          styles.roleBadge,
          isBusiness ? styles.businessBadge : styles.adminBadge
        ]}>
          <View style={styles.roleBadgeRow}>
            <Feather 
              name={isBusiness ? 'briefcase' : 'shield'} 
              size={14} 
              color={isBusiness ? '#F59E0B' : '#8B5CF6'} 
            />
            <Text style={[
              styles.roleBadgeText,
              isBusiness ? styles.businessText : styles.adminText
            ]}>
              {isBusiness ? 'Business Account' : 'Administrator'}
            </Text>
          </View>
        </View>
      )}
      
      {/* Best achievement */}
      {stats?.highestRated && stats.highestRated.avgRating > 0 && (
        <View style={styles.achievementContainer}>
          <Text style={styles.achievementText}>
            <Feather name="award" size={14} color="#3B82F6" /> Top Rated Submission: {stats.highestRated.title} ({stats.highestRated.avgRating}/10)
          </Text>
        </View>
      )}
    </View>
  );
}
