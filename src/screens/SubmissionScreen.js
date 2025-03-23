import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import supabase from '../utils/supabaseClient';
import { theme, globalStyles } from '../styles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.gray[800],
    marginBottom: 8,
  },
  subtitle: {
    color: theme.colors.gray[600],
    marginBottom: 24,
  },
  formContainer: {
    gap: 16,
  },
  formGroup: {
  },
  inputLabel: {
    color: theme.colors.gray[700],
    marginBottom: 4,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: theme.colors.gray[800],
  },
  textArea: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: 8,
    padding: 16,
    color: theme.colors.gray[800],
    minHeight: 80,
    textAlignVertical: 'top',
  },
  largeTextArea: {
    minHeight: 160,
  },
  typeSelection: {
    flexDirection: 'row',
    gap: 16,
  },
  typeButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  typeButtonInactive: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.gray[300],
  },
  typeButtonText: {
    marginTop: 4,
  },
  activeButtonText: {
    color: theme.colors.white,
  },
  inactiveButtonText: {
    color: theme.colors.gray[700],
  },
  mediaPreviewContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  mediaImage: {
    width: '100%',
    height: 256,
    backgroundColor: theme.colors.gray[200],
  },
  removeMediaButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: theme.colors.white,
    borderRadius: 20,
    padding: 8,
  },
  uploadContainer: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.gray[300],
    borderRadius: 8,
    paddingVertical: 32,
    alignItems: 'center',
  },
  uploadIcon: {
    color: theme.colors.gray[400],
  },
  uploadText: {
    color: theme.colors.gray[500],
    marginTop: 8,
  },
  selectedVideoContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: theme.colors.gray[100],
    padding: 16,
  },
  selectedVideoText: {
    color: theme.colors.gray[800],
  },
  removeVideoButton: {
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeVideoButtonText: {
    color: theme.colors.gray[700],
    marginLeft: 4,
  },
  submitButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonEnabled: {
    backgroundColor: theme.colors.primary,
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.primary + '80', // 50% opacity
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    fontSize: 18,
  },
  loadingText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 8,
  },
});

export default function SubmissionScreen({ route, navigation }) {
  const { competitionId, competitionTitle } = route.params;
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaType, setMediaType] = useState('photo'); // 'photo', 'video', 'text'
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [textContent, setTextContent] = useState('');
  const [loading, setLoading] = useState(false);
  
  const validateForm = () => {
    if (!title.trim()) return 'Please enter a title for your submission';
    if (!description.trim()) return 'Please provide a description';
    
    if (mediaType === 'photo' && !selectedMedia) {
      return 'Please select a photo for your submission';
    }
    
    if (mediaType === 'video' && !selectedMedia) {
      return 'Please select a video for your submission';
    }
    
    if (mediaType === 'text' && !textContent.trim()) {
      return 'Please enter text content for your submission';
    }
    
    return null;
  };
  
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
  
  const uploadMedia = async () => {
    if (!selectedMedia) return null;
    
    try {
      // Get file extension
      const fileExt = selectedMedia.uri.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `submissions/${fileName}`;
      
      // Prepare file for upload
      const response = await fetch(selectedMedia.uri);
      const blob = await response.blob();
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, blob, {
          contentType: selectedMedia.type,
        });
      
      if (error) throw error;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading media:', error);
      throw error;
    }
  };
  
  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }
    
    try {
      setLoading(true);
      
      let mediaUrl = null;
      
      // Upload media if necessary
      if (mediaType !== 'text' && selectedMedia) {
        mediaUrl = await uploadMedia();
      }
      
      // Create submission record
      const submissionData = {
        competition_id: competitionId,
        user_id: user.id,
        title,
        description,
        media_type: mediaType,
        media_url: mediaUrl,
        text_content: mediaType === 'text' ? textContent : null,
        created_at: new Date(),
      };
      
      const { data, error } = await supabase
        .from('submissions')
        .insert([submissionData])
        .select();
      
      if (error) throw error;
      
      Alert.alert(
        'Success',
        'Your submission has been received!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error submitting:', error);
      Alert.alert('Error', 'Failed to submit your entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Submit Your Entry</Text>
          <Text style={styles.subtitle}>
            for "{competitionTitle}"
          </Text>
          
          <View style={styles.formContainer}>
            {/* Title input */}
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter a title for your submission"
                value={title}
                onChangeText={setTitle}
              />
            </View>
            
            {/* Description input */}
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Describe your submission"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
            
            {/* Media type selection */}
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Submission Type</Text>
              <View style={styles.typeSelection}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    mediaType === 'photo' ? styles.typeButtonActive : styles.typeButtonInactive
                  ]}
                  onPress={() => setMediaType('photo')}
                >
                  <Feather 
                    name="image" 
                    size={20} 
                    color={mediaType === 'photo' ? 'white' : '#4B5563'} 
                  />
                  <Text 
                    style={[
                      styles.typeButtonText,
                      mediaType === 'photo' ? styles.activeButtonText : styles.inactiveButtonText
                    ]}
                  >
                    Photo
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    mediaType === 'video' ? styles.typeButtonActive : styles.typeButtonInactive
                  ]}
                  onPress={() => setMediaType('video')}
                >
                  <Feather 
                    name="film" 
                    size={20} 
                    color={mediaType === 'video' ? 'white' : '#4B5563'} 
                  />
                  <Text 
                    style={[
                      styles.typeButtonText,
                      mediaType === 'video' ? styles.activeButtonText : styles.inactiveButtonText
                    ]}
                  >
                    Video
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    mediaType === 'text' ? styles.typeButtonActive : styles.typeButtonInactive
                  ]}
                  onPress={() => setMediaType('text')}
                >
                  <Feather 
                    name="file-text" 
                    size={20} 
                    color={mediaType === 'text' ? 'white' : '#4B5563'} 
                  />
                  <Text 
                    style={[
                      styles.typeButtonText,
                      mediaType === 'text' ? styles.activeButtonText : styles.inactiveButtonText
                    ]}
                  >
                    Text
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Media content based on type */}
            {mediaType === 'photo' && (
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Upload Photo</Text>
                {selectedMedia ? (
                  <View style={styles.mediaPreviewContainer}>
                    <Image
                      source={{ uri: selectedMedia.uri }}
                      style={styles.mediaImage}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      style={styles.removeMediaButton}
                      onPress={() => setSelectedMedia(null)}
                    >
                      <Feather name="x" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.uploadContainer}
                    onPress={pickImage}
                  >
                    <Feather name="upload" size={32} style={styles.uploadIcon} />
                    <Text style={styles.uploadText}>
                      Tap to select a photo
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            
            {mediaType === 'video' && (
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Upload Video</Text>
                {selectedMedia ? (
                  <View style={styles.selectedVideoContainer}>
                    <Text style={styles.selectedVideoText}>
                      Video selected: {selectedMedia.uri.split('/').pop()}
                    </Text>
                    <TouchableOpacity
                      style={styles.removeVideoButton}
                      onPress={() => setSelectedMedia(null)}
                    >
                      <Feather name="x" size={16} color="#4B5563" />
                      <Text style={styles.removeVideoButtonText}>Remove Video</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.uploadContainer}
                    onPress={pickVideo}
                  >
                    <Feather name="video" size={32} style={styles.uploadIcon} />
                    <Text style={styles.uploadText}>
                      Tap to select a video (max 60 sec)
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            
            {mediaType === 'text' && (
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Text Content</Text>
                <TextInput
                  style={[styles.textArea, styles.largeTextArea]}
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
              style={[
                styles.submitButton,
                loading ? styles.submitButtonDisabled : styles.submitButtonEnabled
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.submitButtonContent}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={styles.loadingText}>
                    Submitting...
                  </Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>
                  Submit Entry
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
