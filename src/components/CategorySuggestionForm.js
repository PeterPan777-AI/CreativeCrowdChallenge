import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function CategorySuggestionForm({ onSubmit }) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to suggest categories');
      return;
    }
    
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter a category name');
      return;
    }
    
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Please provide a description for the category');
      return;
    }
    
    try {
      setLoading(true);
      await onSubmit(name, description);
      
      // Reset form
      setName('');
      setDescription('');
      setExpanded(false);
    } catch (error) {
      console.error('Error submitting category suggestion:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View className="bg-white rounded-lg p-4 shadow-sm">
      <TouchableOpacity 
        className="flex-row justify-between items-center"
        onPress={() => setExpanded(!expanded)}
      >
        <Text className="text-lg font-bold text-gray-800">Suggest a New Category</Text>
        <Feather 
          name={expanded ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color="#4B5563" 
        />
      </TouchableOpacity>
      
      {expanded && (
        <View className="mt-4 space-y-4">
          <View>
            <Text className="text-gray-700 mb-1 font-medium">Category Name</Text>
            <TextInput
              className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
              placeholder="Enter a name for the category"
              value={name}
              onChangeText={setName}
              maxLength={50}
            />
          </View>
          
          <View>
            <Text className="text-gray-700 mb-1 font-medium">Description</Text>
            <TextInput
              className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
              placeholder="Describe what this category is about"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
          
          <TouchableOpacity
            className={`rounded-lg py-3 items-center ${loading ? 'bg-primary/70' : 'bg-primary'}`}
            onPress={handleSubmit}
            disabled={loading || !name.trim() || !description.trim()}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-bold">Submit Suggestion</Text>
            )}
          </TouchableOpacity>
          
          <Text className="text-xs text-gray-500 text-center italic">
            Your suggestion will be reviewed by our administrators.
          </Text>
        </View>
      )}
    </View>
  );
}
