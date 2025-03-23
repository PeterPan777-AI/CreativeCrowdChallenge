import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
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
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.gray[800],
  },
  formContainer: {
    marginTop: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
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
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    backgroundColor: 'rgba(59, 130, 246, 0.7)',
  },
  submitButtonText: {
    color: theme.colors.white,
    fontWeight: 'bold',
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.gray[500],
    textAlign: 'center',
    fontStyle: 'italic',
  }
});

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
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.headerRow}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.headerText}>Suggest a New Category</Text>
        <Feather 
          name={expanded ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color="#4B5563" 
        />
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Category Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter a name for the category"
              value={name}
              onChangeText={setName}
              maxLength={50}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe what this category is about"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
          
          <TouchableOpacity
            style={[
              styles.submitButton,
              (loading || !name.trim() || !description.trim()) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={loading || !name.trim() || !description.trim()}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Suggestion</Text>
            )}
          </TouchableOpacity>
          
          <Text style={styles.footerText}>
            Your suggestion will be reviewed by our administrators.
          </Text>
        </View>
      )}
    </View>
  );
}
