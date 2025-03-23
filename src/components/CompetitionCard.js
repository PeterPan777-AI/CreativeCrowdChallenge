import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../styles';

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: theme.colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
    borderWidth: 1,
  },
  businessBorder: {
    borderColor: '#FDE68A', // amber-200
  },
  individualBorder: {
    borderColor: '#DDD6FE', // purple-200
  },
  cardHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  businessHeader: {
    backgroundColor: '#FEF3C7', // amber-50
  },
  individualHeader: {
    backgroundColor: '#F5F3FF', // purple-50
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  businessLabel: {
    color: '#B45309', // amber-700
  },
  individualLabel: {
    color: '#6D28D9', // purple-700
  },
  labelText: {
    marginLeft: 8,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
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
  activeText: {
    color: '#047857', // green-700
  },
  endedText: {
    color: '#B91C1C', // red-700
  },
  cardContent: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.gray[800],
    marginBottom: 8,
  },
  description: {
    color: theme.colors.gray[600],
    marginBottom: 12,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    color: theme.colors.gray[500],
    marginLeft: 4,
    fontSize: 14,
  },
  productBadge: {
    backgroundColor: '#FEF3C7', // amber-50
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  productText: {
    color: '#B45309', // amber-700
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    color: theme.colors.gray[500],
    fontSize: 12,
  },
  viewDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    color: theme.colors.primary,
    fontWeight: '500',
    marginRight: 4,
  }
});

export default function CompetitionCard({ competition, onPress }) {
  if (!competition) return null;
  
  const isBusiness = competition.type === 'business';
  const isActive = new Date(competition.end_date) > new Date();
  
  return (
    <TouchableOpacity
      style={[
        styles.card,
        isBusiness ? styles.businessBorder : styles.individualBorder
      ]}
      onPress={onPress}
    >
      {/* Card Header with type label */}
      <View style={[
        styles.cardHeader,
        isBusiness ? styles.businessHeader : styles.individualHeader
      ]}>
        <View style={styles.headerRow}>
          <View style={styles.headerLabel}>
            <Feather 
              name={isBusiness ? 'briefcase' : 'user'} 
              size={16} 
              color={isBusiness ? '#F59E0B' : '#8B5CF6'} 
            />
            <Text style={[
              styles.labelText,
              isBusiness ? styles.businessLabel : styles.individualLabel
            ]}>
              {isBusiness ? 'Business' : 'Individual'} Competition
            </Text>
          </View>
          
          <View style={[
            styles.statusBadge,
            isActive ? styles.activeBadge : styles.endedBadge
          ]}>
            <Text style={[
              styles.statusText,
              isActive ? styles.activeText : styles.endedText
            ]}>
              {isActive ? 'Active' : 'Ended'}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Card Content */}
      <View style={styles.cardContent}>
        <Text style={styles.title}>
          {competition.title}
        </Text>
        
        <Text style={styles.description} numberOfLines={2}>
          {competition.description}
        </Text>
        
        <View style={styles.metadataRow}>
          <View style={styles.metadataItem}>
            <Feather name="tag" size={14} color="#6B7280" />
            <Text style={styles.metadataText}>
              {competition.category || 'General'}
            </Text>
          </View>
          
          <View style={styles.metadataItem}>
            <Feather name="dollar-sign" size={14} color="#6B7280" />
            <Text style={styles.metadataText}>
              ${competition.prize_amount}
            </Text>
          </View>
        </View>
        
        {isBusiness && competition.product_name && (
          <View style={styles.productBadge}>
            <Feather name="package" size={14} color="#F59E0B" />
            <Text style={styles.productText}>
              Product: {competition.product_name}
            </Text>
          </View>
        )}
        
        <View style={styles.footer}>
          <Text style={styles.dateText}>
            Ends: {new Date(competition.end_date).toLocaleDateString()}
          </Text>
          <View style={styles.viewDetails}>
            <Text style={styles.viewDetailsText}>View Details</Text>
            <Feather name="chevron-right" size={16} color={theme.colors.primary} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
