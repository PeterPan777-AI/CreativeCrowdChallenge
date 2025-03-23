import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../styles';

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    backgroundColor: '#FEF3C7', // amber-50
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A', // amber-200
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400E', // amber-800
    marginBottom: 8,
  },
  fieldContainer: {
    marginBottom: 8,
  },
  fieldLabel: {
    color: theme.colors.gray[500],
    fontSize: 12,
  },
  fieldValue: {
    color: theme.colors.gray[800],
    fontWeight: '500',
  },
  fieldValueRegular: {
    color: theme.colors.gray[800],
  },
  imageContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  productImage: {
    width: '100%',
    height: 160,
    backgroundColor: theme.colors.gray[200],
  },
  linkIconContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: theme.colors.white,
    borderRadius: 999,
    padding: 8,
  },
  sponsoredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7', // amber-100
    padding: 8,
    borderRadius: 8,
  },
  sponsoredText: {
    color: '#B45309', // amber-700
    marginLeft: 8,
    fontWeight: '500',
  }
});

export default function BusinessFeatures({ competition }) {
  if (!competition || competition.type !== 'business') return null;
  
  const handleOpenProductImage = () => {
    if (competition.product_image_url) {
      Linking.openURL(competition.product_image_url);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Product Information
      </Text>
      
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>PRODUCT NAME</Text>
        <Text style={styles.fieldValue}>{competition.product_name}</Text>
      </View>
      
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>PRODUCT DESCRIPTION</Text>
        <Text style={styles.fieldValueRegular}>{competition.product_description}</Text>
      </View>
      
      {competition.product_image_url && (
        <TouchableOpacity 
          style={styles.imageContainer}
          onPress={handleOpenProductImage}
          activeOpacity={0.9}
        >
          <Image 
            source={{ uri: competition.product_image_url }} 
            style={styles.productImage}
            resizeMode="cover"
          />
          <View style={styles.linkIconContainer}>
            <Feather name="external-link" size={16} color="#F59E0B" />
          </View>
        </TouchableOpacity>
      )}
      
      {competition.sponsored && (
        <View style={styles.sponsoredBadge}>
          <Feather name="award" size={16} color="#F59E0B" />
          <Text style={styles.sponsoredText}>
            Sponsored Competition
          </Text>
        </View>
      )}
    </View>
  );
}
