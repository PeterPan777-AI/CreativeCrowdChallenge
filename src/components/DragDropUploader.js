import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { globalStyles, theme } from '../styles';

export default function DragDropUploader({ onFileSelect, fileType = 'image', maxSize = 10 }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const dropAreaRef = useRef(null);

  // Calculate max file size in bytes (default 10MB)
  const maxSizeBytes = maxSize * 1024 * 1024;

  // Handle different file types
  const acceptedTypes = {
    image: ['image/jpeg', 'image/png', 'image/gif'],
    video: ['video/mp4', 'video/quicktime'],
    all: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime']
  };

  // For web platform only
  const handleDragEnter = (e) => {
    if (Platform.OS === 'web') {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    if (Platform.OS === 'web') {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    if (Platform.OS === 'web') {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleDrop = (e) => {
    if (Platform.OS === 'web') {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      
      const droppedFile = e.dataTransfer.files[0];
      if (!droppedFile) return;
      
      validateAndSetFile(droppedFile);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError('');
    
    // Validate file type
    if (!acceptedTypes[fileType].includes(selectedFile.type)) {
      setError(`Invalid file type. Please upload a ${fileType} file.`);
      return;
    }
    
    // Validate file size
    if (selectedFile.size > maxSizeBytes) {
      setError(`File is too large. Maximum size is ${maxSize}MB.`);
      return;
    }
    
    // Set file and call parent callback
    setFile(selectedFile);
    onFileSelect(selectedFile);
  };

  const pickFile = async () => {
    try {
      setError('');
      
      // Request permissions
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          setError('Permission to access media library is required!');
          return;
        }
      }
      
      // Launch media library
      const options = {
        mediaTypes: fileType === 'image' 
          ? ImagePicker.MediaTypeOptions.Images 
          : fileType === 'video'
            ? ImagePicker.MediaTypeOptions.Videos
            : ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
      };
      
      const result = await ImagePicker.launchImageLibraryAsync(options);
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        
        // Create a File object for web or use the URI for native
        if (Platform.OS === 'web') {
          const response = await fetch(selectedAsset.uri);
          const blob = await response.blob();
          const file = new File([blob], `upload.${selectedAsset.uri.split('.').pop()}`, { 
            type: blob.type 
          });
          validateAndSetFile(file);
        } else {
          // For mobile, we just use the URI
          setFile(selectedAsset);
          onFileSelect(selectedAsset);
        }
      }
    } catch (error) {
      console.error('Error picking file:', error);
      setError('An error occurred while picking the file.');
    }
  };

  // Style for the drop area based on dragging state
  const dropAreaStyle = [
    styles.dropArea,
    isDragging && styles.dropAreaActive,
    file && styles.dropAreaWithFile
  ];

  // Preview component based on file type
  const renderPreview = () => {
    if (!file) return null;
    
    if (Platform.OS === 'web') {
      // For web platform
      if (file.type.includes('image')) {
        return (
          <Image
            source={{ uri: URL.createObjectURL(file) }}
            style={styles.preview}
            resizeMode="cover"
          />
        );
      } else if (file.type.includes('video')) {
        return (
          <video width="100%" height="200" controls>
            <source src={URL.createObjectURL(file)} type={file.type} />
            Your browser does not support the video tag.
          </video>
        );
      }
    } else {
      // For mobile platforms
      if (file.type && file.type.includes('image')) {
        return (
          <Image
            source={{ uri: file.uri }}
            style={styles.preview}
            resizeMode="cover"
          />
        );
      } else if (file.type && file.type.includes('video')) {
        return (
          <View style={styles.videoPreview}>
            <Text style={styles.videoText}>Video Selected</Text>
            <Text style={styles.videoFilename}>{file.fileName || 'video'}</Text>
          </View>
        );
      }
    }
    
    return (
      <Text style={styles.fileSelected}>File selected</Text>
    );
  };

  // Web-specific props for drag and drop
  const dragDropProps = Platform.OS === 'web' ? {
    onDragEnter: handleDragEnter,
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
  } : {};

  return (
    <View style={styles.container}>
      <TouchableOpacity
        ref={dropAreaRef}
        style={dropAreaStyle}
        onPress={pickFile}
        activeOpacity={0.7}
        {...dragDropProps}
      >
        {file ? (
          renderPreview()
        ) : (
          <View style={styles.uploadPrompt}>
            <Text style={styles.uploadText}>
              {Platform.OS === 'web' 
                ? 'Drag & drop or click to upload' 
                : 'Tap to choose a file'}
            </Text>
            <Text style={styles.uploadSubtext}>
              {fileType === 'image' 
                ? 'Supported formats: JPG, PNG, GIF' 
                : fileType === 'video'
                  ? 'Supported formats: MP4, MOV'
                  : 'Supported formats: JPG, PNG, GIF, MP4, MOV'}
            </Text>
            <Text style={styles.uploadSubtext}>Max size: {maxSize}MB</Text>
          </View>
        )}
      </TouchableOpacity>
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      
      {file && (
        <TouchableOpacity 
          style={styles.removeButton} 
          onPress={() => {
            setFile(null);
            onFileSelect(null);
          }}
        >
          <Text style={styles.removeButtonText}>Remove File</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 10,
  },
  dropArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 20,
    backgroundColor: theme.colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  dropAreaActive: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`, // 10% opacity
  },
  dropAreaWithFile: {
    borderStyle: 'solid',
    borderColor: theme.colors.success,
  },
  uploadPrompt: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 8,
  },
  uploadSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 4,
  },
  videoPreview: {
    width: '100%',
    height: 200,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  videoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  videoFilename: {
    color: '#ddd',
    fontSize: 14,
    marginTop: 8,
  },
  fileSelected: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    marginTop: 8,
  },
  removeButton: {
    backgroundColor: theme.colors.error,
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 10,
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
});