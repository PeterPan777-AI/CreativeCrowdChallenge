import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function SubmissionForm({ onSubmit, isLoading }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaType, setMediaType] = useState('photo'); // 'photo', 'video', 'text'
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [textContent, setTextContent] = useState('');
  
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'We need your permission to access the media library');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets[0]) {
      setSelectedMedia(result.assets[0]);
    }
  };
  
  const pickVideo = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'We need your permission to access the media library');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
      videoMaxDuration: 60,
    });
    
    if (!result.canceled && result.assets && result.assets[0]) {
      setSelectedMedia(result.assets[0]);
    }
  };
  
  const handleSubmit = () => {
    const submissionData = {
      title,
      description,
      mediaType,
      media: selectedMedia,
      textContent: mediaType === 'text' ? textContent : null,
    };
    
    onSubmit(submissionData);
  };
  
  const isFormValid = () => {
    if (!title.trim() || !description.trim()) return false;
    
    if (mediaType === 'photo' && !selectedMedia) return false;
    if (mediaType === 'video' && !selectedMedia) return false;
    if (mediaType === 'text' && !textContent.trim()) return false;
    
    return true;
  };
  
  return (
    <View className="bg-white rounded-lg p-4 shadow-sm">
      <Text className="text-xl font-bold text-gray-800 mb-4">Submit Your Entry</Text>
      
      <View className="space-y-4">
        {/* Title input */}
        <View>
          <Text className="text-gray-700 mb-1 font-medium">Title</Text>
          <TextInput
            className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
            placeholder="Enter a title for your submission"
            value={title}
            onChangeText={setTitle}
          />
        </View>
        
        {/* Description input */}
        <View>
          <Text className="text-gray-700 mb-1 font-medium">Description</Text>
          <TextInput
            className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
            placeholder="Describe your submission"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
        
        {/* Media type selection */}
        <View>
          <Text className="text-gray-700 mb-2 font-medium">Submission Type</Text>
          <View className="flex-row space-x-4">
            <TouchableOpacity
              className={`flex-1 border rounded-lg py-3 items-center ${mediaType === 'photo' ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}
              onPress={() => setMediaType('photo')}
            >
              <Feather 
                name="image" 
                size={20} 
                color={mediaType === 'photo' ? 'white' : '#4B5563'} 
              />
              <Text 
                className={`mt-1 ${mediaType === 'photo' ? 'text-white' : 'text-gray-700'}`}
              >
                Photo
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className={`flex-1 border rounded-lg py-3 items-center ${mediaType === 'video' ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}
              onPress={() => setMediaType('video')}
            >
              <Feather 
                name="film" 
                size={20} 
                color={mediaType === 'video' ? 'white' : '#4B5563'} 
              />
              <Text 
                className={`mt-1 ${mediaType === 'video' ? 'text-white' : 'text-gray-700'}`}
              >
                Video
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className={`flex-1 border rounded-lg py-3 items-center ${mediaType === 'text' ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}
              onPress={() => setMediaType('text')}
            >
              <Feather 
                name="file-text" 
                size={20} 
                color={mediaType === 'text' ? 'white' : '#4B5563'} 
              />
              <Text 
                className={`mt-1 ${mediaType === 'text' ? 'text-white' : 'text-gray-700'}`}
              >
                Text
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Media content based on type */}
        {mediaType === 'photo' && (
          <View>
            <Text className="text-gray-700 mb-2 font-medium">Upload Photo</Text>
            {selectedMedia ? (
              <View className="rounded-lg overflow-hidden mb-2">
                <Image
                  source={{ uri: selectedMedia.uri }}
                  className="w-full h-64 bg-gray-200"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  className="absolute top-2 right-2 bg-white rounded-full p-2"
                  onPress={() => setSelectedMedia(null)}
                >
                  <Feather name="x" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                className="bg-gray-50 border border-dashed border-gray-300 rounded-lg py-8 items-center"
                onPress={pickImage}
              >
                <Feather name="upload" size={32} color="#9CA3AF" />
                <Text className="text-gray-500 mt-2">
                  Tap to select a photo
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {mediaType === 'video' && (
          <View>
            <Text className="text-gray-700 mb-2 font-medium">Upload Video</Text>
            {selectedMedia ? (
              <View className="rounded-lg overflow-hidden mb-2 bg-gray-100 p-4">
                <Text className="text-gray-800">
                  Video selected: {selectedMedia.uri.split('/').pop()}
                </Text>
                <TouchableOpacity
                  className="bg-white rounded-lg py-2 px-4 mt-3 border border-gray-300 flex-row items-center justify-center"
                  onPress={() => setSelectedMedia(null)}
                >
                  <Feather name="x" size={16} color="#4B5563" />
                  <Text className="text-gray-700 ml-1">Remove Video</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                className="bg-gray-50 border border-dashed border-gray-300 rounded-lg py-8 items-center"
                onPress={pickVideo}
              >
                <Feather name="video" size={32} color="#9CA3AF" />
                <Text className="text-gray-500 mt-2">
                  Tap to select a video (max 60 sec)
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {mediaType === 'text' && (
          <View>
            <Text className="text-gray-700 mb-2 font-medium">Text Content</Text>
            <TextInput
              className="bg-gray-50 border border-gray-300 rounded-lg p-4 text-gray-800"
              placeholder="Enter your text content here (lyrics, poem, story, etc.)"
              value={textContent}
              onChangeText={setTextContent}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />
          </View>
        )}
        
        <TouchableOpacity
          className={`rounded-lg py-3.5 items-center mt-4 ${
            isFormValid() && !isLoading ? 'bg-primary' : 'bg-gray-300'
          }`}
          onPress={handleSubmit}
          disabled={!isFormValid() || isLoading}
        >
          {isLoading ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white font-bold text-lg ml-2">
                Submitting...
              </Text>
            </View>
          ) : (
            <Text className={`font-bold text-lg ${isFormValid() ? 'text-white' : 'text-gray-500'}`}>
              Submit Entry
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
