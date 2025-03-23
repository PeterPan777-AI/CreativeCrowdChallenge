import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function BusinessFeatures({ competition }) {
  if (!competition || competition.type !== 'business') return null;
  
  const handleOpenProductImage = () => {
    if (competition.product_image_url) {
      Linking.openURL(competition.product_image_url);
    }
  };
  
  return (
    <View className="mt-4 bg-amber-50 p-3 rounded-lg border border-amber-200">
      <Text className="text-lg font-bold text-amber-800 mb-2">
        Product Information
      </Text>
      
      <View className="mb-2">
        <Text className="text-gray-500 text-xs">PRODUCT NAME</Text>
        <Text className="text-gray-800 font-medium">{competition.product_name}</Text>
      </View>
      
      <View className="mb-3">
        <Text className="text-gray-500 text-xs">PRODUCT DESCRIPTION</Text>
        <Text className="text-gray-800">{competition.product_description}</Text>
      </View>
      
      {competition.product_image_url && (
        <TouchableOpacity 
          className="rounded-lg overflow-hidden mb-2"
          onPress={handleOpenProductImage}
          activeOpacity={0.9}
        >
          <Image 
            source={{ uri: competition.product_image_url }} 
            className="w-full h-40 bg-gray-200"
            resizeMode="cover"
          />
          <View className="absolute bottom-2 right-2 bg-white rounded-full p-2">
            <Feather name="external-link" size={16} color="#F59E0B" />
          </View>
        </TouchableOpacity>
      )}
      
      {competition.sponsored && (
        <View className="flex-row items-center bg-amber-100 p-2 rounded-lg">
          <Feather name="award" size={16} color="#F59E0B" />
          <Text className="text-amber-700 ml-2 font-medium">
            Sponsored Competition
          </Text>
        </View>
      )}
    </View>
  );
}
