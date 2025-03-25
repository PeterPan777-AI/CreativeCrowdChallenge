import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../styles';
import DragDropUploader from './DragDropUploader';

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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.gray[800],
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  formSpacing: {
    marginTop: 0,
  },
  label: {
    color: theme.colors.gray[700],
    marginBottom: 4,
    fontWeight: '500',
  },
  input: {
    backgroundColor: theme.colors.gray[50],
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: theme.colors.gray[800],
  },
  textArea: {
    minHeight: 80, 
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  mediaTypeContainer: {
    flexDirection: 'row',
    marginHorizontal: -8,
  },
  mediaTypeButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  activeMediaButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  inactiveMediaButton: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.gray[300],
  },
  mediaTypeText: {
    marginTop: 4,
  },
  activeMediaText: {
    color: theme.colors.white,
  },
  inactiveMediaText: {
    color: theme.colors.gray[700],
  },
  mediaPlaceholder: {
    backgroundColor: theme.colors.gray[50],
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.gray[300],
    borderRadius: 8,
    paddingVertical: 32,
    alignItems: 'center',
  },
  mediaPlaceholderText: {
    color: theme.colors.gray[500],
    marginTop: 8,
  },
  imageContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: 256,
    backgroundColor: theme.colors.gray[200],
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: theme.colors.white,
    borderRadius: 999,
    padding: 8,
  },
  videoSelectedContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: theme.colors.gray[100],
    padding: 16,
  },
  videoFilename: {
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
  removeVideoText: {
    color: theme.colors.gray[700],
    marginLeft: 4,
  },
  longTextInput: {
    backgroundColor: theme.colors.gray[50],
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: 8,
    padding: 16,
    color: theme.colors.gray[800],
    minHeight: 160,
    textAlignVertical: 'top',
  },
  submitButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  activeSubmitButton: {
    backgroundColor: theme.colors.primary,
  },
  inactiveSubmitButton: {
    backgroundColor: theme.colors.gray[300],
  },
  submitButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  activeSubmitText: {
    color: theme.colors.white,
  },
  inactiveSubmitText: {
    color: theme.colors.gray[500],
  },
  loadingText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 8,
  }
});

export default function SubmissionForm({ onSubmit, isLoading }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaType, setMediaType] = useState('photo'); // 'photo', 'video', 'text'
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [textContent, setTextContent] = useState('');
  
  // File selection is now handled by the DragDropUploader component
  
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
    <View style={styles.container}>
      <Text style={styles.title}>Submit Your Entry</Text>
      
      <View>
        {/* Title input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter a title for your submission"
            value={title}
            onChangeText={setTitle}
          />
        </View>
        
        {/* Description input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your submission"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
        
        {/* Media type selection */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Submission Type</Text>
          <View style={styles.mediaTypeContainer}>
            <TouchableOpacity
              style={[
                styles.mediaTypeButton,
                mediaType === 'photo' ? styles.activeMediaButton : styles.inactiveMediaButton
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
                  styles.mediaTypeText,
                  mediaType === 'photo' ? styles.activeMediaText : styles.inactiveMediaText
                ]}
              >
                Photo
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.mediaTypeButton,
                mediaType === 'video' ? styles.activeMediaButton : styles.inactiveMediaButton
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
                  styles.mediaTypeText,
                  mediaType === 'video' ? styles.activeMediaText : styles.inactiveMediaText
                ]}
              >
                Video
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.mediaTypeButton,
                mediaType === 'text' ? styles.activeMediaButton : styles.inactiveMediaButton
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
                  styles.mediaTypeText,
                  mediaType === 'text' ? styles.activeMediaText : styles.inactiveMediaText
                ]}
              >
                Text
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Media content based on type */}
        {mediaType === 'photo' && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Upload Photo</Text>
            <DragDropUploader 
              fileType="image"
              maxSize={10} 
              onFileSelect={(file) => setSelectedMedia(file)}
            />
          </View>
        )}
        
        {mediaType === 'video' && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Upload Video</Text>
            <DragDropUploader 
              fileType="video"
              maxSize={50} 
              onFileSelect={(file) => setSelectedMedia(file)}
            />
          </View>
        )}
        
        {mediaType === 'text' && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Text Content</Text>
            <TextInput
              style={styles.longTextInput}
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
            isFormValid() && !isLoading ? styles.activeSubmitButton : styles.inactiveSubmitButton
          ]}
          onPress={handleSubmit}
          disabled={!isFormValid() || isLoading}
        >
          {isLoading ? (
            <View style={styles.submitButtonRow}>
              <ActivityIndicator size="small" color="white" />
              <Text style={styles.loadingText}>
                Submitting...
              </Text>
            </View>
          ) : (
            <Text style={[
              styles.submitButtonText,
              isFormValid() ? styles.activeSubmitText : styles.inactiveSubmitText
            ]}>
              Submit Entry
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
