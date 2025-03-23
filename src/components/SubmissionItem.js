import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  Platform,
  StyleSheet,
} from 'react-native';
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.gray[800],
  },
  dateText: {
    fontSize: 12,
    color: theme.colors.gray[500],
  },
  competitionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  competitionText: {
    marginLeft: 4,
    fontSize: 14,
  },
  businessText: {
    color: '#B45309', // amber-600
  },
  individualText: {
    color: '#6D28D9', // purple-600
  },
  statusBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  activeBadge: {
    backgroundColor: '#D1FAE5', // green-100
  },
  endedBadge: {
    backgroundColor: theme.colors.gray[100],
  },
  statusText: {
    fontSize: 12,
  },
  activeStatusText: {
    color: '#047857', // green-700
  },
  endedStatusText: {
    color: theme.colors.gray[700],
  },
  description: {
    color: theme.colors.gray[600],
    marginBottom: 12,
  },
  photoContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: theme.colors.gray[100],
  },
  photo: {
    width: '100%',
    height: 224,
  },
  videoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray[100],
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  videoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  videoTitle: {
    color: theme.colors.gray[800],
    fontWeight: '500',
  },
  videoSubtitle: {
    color: theme.colors.gray[500],
    fontSize: 14,
  },
  textContentContainer: {
    backgroundColor: theme.colors.gray[50],
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  textContent: {
    color: theme.colors.gray[800],
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    color: theme.colors.gray[600],
    marginLeft: 4,
    fontSize: 14,
  },
});

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
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>
          {submission.title}
        </Text>
        <Text style={styles.dateText}>
          {formatDate(submission.created_at)}
        </Text>
      </View>
      
      {showCompetition && submission.competitions && (
        <View style={styles.competitionRow}>
          <Feather 
            name={submission.competitions.type === 'business' ? 'briefcase' : 'user'} 
            size={14} 
            color={submission.competitions.type === 'business' ? '#F59E0B' : '#8B5CF6'} 
          />
          <Text style={[
            styles.competitionText,
            submission.competitions.type === 'business' ? styles.businessText : styles.individualText
          ]}>
            {submission.competitions.title}
          </Text>
          <View style={[
            styles.statusBadge,
            submission.competitions.status === 'active' ? styles.activeBadge : styles.endedBadge
          ]}>
            <Text style={[
              styles.statusText,
              submission.competitions.status === 'active' ? styles.activeStatusText : styles.endedStatusText
            ]}>
              {submission.competitions.status === 'active' ? 'Active' : 'Ended'}
            </Text>
          </View>
        </View>
      )}
      
      <Text style={styles.description}>
        {submission.description}
      </Text>
      
      {submission.media_type === 'photo' && submission.media_url && (
        <TouchableOpacity 
          style={styles.photoContainer}
          onPress={() => handleOpenMedia(submission.media_url)}
          activeOpacity={0.9}
        >
          <Image 
            source={{ uri: submission.media_url }} 
            style={styles.photo}
            resizeMode="cover"
          />
        </TouchableOpacity>
      )}
      
      {submission.media_type === 'video' && submission.media_url && (
        <TouchableOpacity 
          style={styles.videoContainer}
          onPress={() => handleOpenMedia(submission.media_url)}
        >
          <Feather name="video" size={24} color="#4B5563" />
          <View style={styles.videoTextContainer}>
            <Text style={styles.videoTitle}>Video Submission</Text>
            <Text style={styles.videoSubtitle}>Tap to view the video</Text>
          </View>
          <Feather name="external-link" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      )}
      
      {submission.media_type === 'text' && submission.text_content && (
        <View style={styles.textContentContainer}>
          <Text style={styles.textContent}>
            "{submission.text_content.length > 150 
              ? submission.text_content.substring(0, 150) + '...' 
              : submission.text_content}"
          </Text>
        </View>
      )}
      
      <View style={styles.footer}>
        <View style={styles.userContainer}>
          <Feather name="user" size={14} color={theme.colors.gray[600]} />
          <Text style={styles.username}>
            {submission.profiles?.username || 'Anonymous'}
          </Text>
        </View>
      </View>
    </View>
  );
}
