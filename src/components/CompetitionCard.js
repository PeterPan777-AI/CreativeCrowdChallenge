import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function CompetitionCard({ competition, onPress }) {
  if (!competition) return null;
  
  const isBusiness = competition.type === 'business';
  const isActive = new Date(competition.end_date) > new Date();
  
  return (
    <TouchableOpacity
      className={`rounded-lg overflow-hidden bg-white shadow-sm border ${
        isBusiness ? 'border-amber-200' : 'border-purple-200'
      }`}
      onPress={onPress}
    >
      {/* Card Header with type label */}
      <View className={`px-4 py-2 ${isBusiness ? 'bg-amber-50' : 'bg-purple-50'}`}>
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Feather 
              name={isBusiness ? 'briefcase' : 'user'} 
              size={16} 
              color={isBusiness ? '#F59E0B' : '#8B5CF6'} 
            />
            <Text className={`ml-2 font-medium ${isBusiness ? 'text-amber-700' : 'text-purple-700'}`}>
              {isBusiness ? 'Business' : 'Individual'} Competition
            </Text>
          </View>
          
          <View className={`px-2 py-1 rounded-full ${isActive ? 'bg-green-100' : 'bg-red-100'}`}>
            <Text className={`text-xs font-medium ${isActive ? 'text-green-700' : 'text-red-700'}`}>
              {isActive ? 'Active' : 'Ended'}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Card Content */}
      <View className="p-4">
        <Text className="text-lg font-bold text-gray-800 mb-2">
          {competition.title}
        </Text>
        
        <Text className="text-gray-600 mb-3" numberOfLines={2}>
          {competition.description}
        </Text>
        
        <View className="flex-row justify-between mb-1">
          <View className="flex-row items-center">
            <Feather name="tag" size={14} color="#6B7280" />
            <Text className="text-gray-500 ml-1 text-sm">
              {competition.category || 'General'}
            </Text>
          </View>
          
          <View className="flex-row items-center">
            <Feather name="dollar-sign" size={14} color="#6B7280" />
            <Text className="text-gray-500 ml-1 text-sm">
              ${competition.prize_amount}
            </Text>
          </View>
        </View>
        
        {isBusiness && competition.product_name && (
          <View className="bg-amber-50 rounded-md p-2 mt-2 flex-row items-center">
            <Feather name="package" size={14} color="#F59E0B" />
            <Text className="text-amber-700 ml-1 text-sm font-medium">
              Product: {competition.product_name}
            </Text>
          </View>
        )}
        
        <View className="mt-3 flex-row justify-between items-center">
          <Text className="text-gray-500 text-xs">
            Ends: {new Date(competition.end_date).toLocaleDateString()}
          </Text>
          <View className="flex-row items-center">
            <Text className="text-primary font-medium mr-1">View Details</Text>
            <Feather name="chevron-right" size={16} color="#3B82F6" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
