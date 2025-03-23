import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import supabase from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { theme, globalStyles } from '../styles';
// import DateTimePickerModal from 'react-native-modal-datetime-picker'; // Temporarily disabled

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    color: theme.colors.gray[600],
    marginTop: 16,
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
  createButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  createButtonText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    fontSize: 18,
  },
  formContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 24,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.gray[800],
  },
  formGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: theme.colors.gray[700],
    marginBottom: 4,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: theme.colors.gray[50],
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: theme.colors.gray[800],
  },
  textArea: {
    backgroundColor: theme.colors.gray[50],
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: 8,
    padding: 16,
    color: theme.colors.gray[800],
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryChip: {
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary,
  },
  categoryChipInactive: {
    backgroundColor: theme.colors.gray[200],
  },
  categoryChipTextActive: {
    color: theme.colors.white,
  },
  categoryChipTextInactive: {
    color: theme.colors.gray[700],
  },
  dateRow: {
    flexDirection: 'row',
    gap: 16,
  },
  dateColumn: {
    flex: 1,
  },
  dateDisplay: {
    backgroundColor: theme.colors.gray[50],
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateText: {
    color: theme.colors.gray[800],
  },
  dateHint: {
    fontSize: 12,
    color: theme.colors.gray[500],
    marginTop: 4,
  },
  mediaPreviewContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  mediaImage: {
    width: '100%',
    height: 192,
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
    backgroundColor: theme.colors.gray[50],
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.gray[300],
    borderRadius: 8,
    paddingVertical: 24,
    alignItems: 'center',
  },
  uploadIcon: {
    color: theme.colors.gray[400],
  },
  uploadText: {
    color: theme.colors.gray[500],
    marginTop: 8,
  },
  submitButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
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
  competitionsList: {
    gap: 16,
  },
  competitionCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  competitionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  competitionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.gray[800],
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: theme.colors.success + '20', // 20% opacity
  },
  endedBadge: {
    backgroundColor: theme.colors.error + '20', // 20% opacity
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  activeStatusText: {
    color: theme.colors.success,
  },
  endedStatusText: {
    color: theme.colors.error,
  },
  metadataRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  metadataItem: {
    marginRight: 16,
    marginBottom: 8,
  },
  metadataLabel: {
    fontSize: 12,
    color: theme.colors.gray[500],
  },
  metadataValue: {
    color: theme.colors.gray[800],
  },
  competitionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  createdAtText: {
    color: theme.colors.gray[500],
    fontSize: 12,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    color: theme.colors.primary,
    fontWeight: '500',
    marginRight: 4,
  },
});

export default function BusinessCompetitionScreen({ navigation }) {
  const { user, userDetails } = useAuth();
  const [competitions, setCompetitions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const [prizeAmount, setPrizeAmount] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // Default to 1 week later
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productImage, setProductImage] = useState(null);
  
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  
  useEffect(() => {
    fetchBusinessCompetitions();
    fetchCategories();
    
    // Set up subscription for competition changes
    const subscription = supabase
      .channel('business_competition_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'competitions',
        filter: user ? `created_by=eq.${user.id}` : undefined
      }, () => {
        fetchBusinessCompetitions();
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [user]);
  
  const fetchBusinessCompetitions = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('competitions')
        .select(`
          *,
          categories(name)
        `)
        .eq('created_by', user.id)
        .eq('type', 'business')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setCompetitions(data || []);
    } catch (error) {
      console.error('Error fetching business competitions:', error);
      Alert.alert('Error', 'Failed to load your competitions');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
        
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
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
      aspect: [16, 9],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets[0]) {
      setProductImage(result.assets[0]);
    }
  };
  
  const uploadProductImage = async () => {
    if (!productImage) return null;
    
    try {
      // Get file extension
      const fileExt = productImage.uri.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `product-images/${fileName}`;
      
      // Prepare file for upload
      const response = await fetch(productImage.uri);
      const blob = await response.blob();
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, blob, {
          contentType: productImage.type,
        });
      
      if (error) throw error;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };
  
  const validateForm = () => {
    if (!title.trim()) return 'Please enter a competition title';
    if (!description.trim()) return 'Please provide a description';
    if (!categoryId) return 'Please select a category';
    if (!prizeAmount || isNaN(Number(prizeAmount)) || Number(prizeAmount) <= 0) {
      return 'Please enter a valid prize amount';
    }
    if (!productName.trim()) return 'Please enter a product name';
    if (!productDescription.trim()) return 'Please provide a product description';
    
    return null;
  };
  
  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }
    
    try {
      setFormLoading(true);
      
      // Upload product image if selected
      let productImageUrl = null;
      if (productImage) {
        productImageUrl = await uploadProductImage();
      }
      
      // Create competition record
      const competitionData = {
        title,
        description,
        category_id: categoryId,
        prize_amount: Number(prizeAmount),
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: 'active',
        type: 'business',
        created_by: user.id,
        created_at: new Date().toISOString(),
        product_name: productName,
        product_description: productDescription,
        product_image_url: productImageUrl,
      };
      
      const { data, error } = await supabase
        .from('competitions')
        .insert([competitionData])
        .select();
      
      if (error) throw error;
      
      Alert.alert(
        'Success',
        'Your business competition has been created',
        [{ text: 'OK', onPress: () => {
          setShowForm(false);
          resetForm();
        }}]
      );
      
      fetchBusinessCompetitions();
    } catch (error) {
      console.error('Error creating competition:', error);
      Alert.alert('Error', 'Failed to create competition. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };
  
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategoryId(null);
    setPrizeAmount('');
    setStartDate(new Date());
    setEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    setProductName('');
    setProductDescription('');
    setProductImage(null);
  };
  
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const handleViewCompetition = (competitionId) => {
    navigation.navigate('Home', {
      screen: 'CompetitionDetails',
      params: { competitionId }
    });
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading your competitions...</Text>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Business Dashboard</Text>
          <Text style={styles.subtitle}>
            Manage your business competitions
          </Text>
          
          {!showForm ? (
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setShowForm(true)}
            >
              <Text style={styles.createButtonText}>Create New Competition</Text>
            </TouchableOpacity>
          ) : (
            // Competition creation form
            <View style={styles.formContainer}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>Create Competition</Text>
                <TouchableOpacity onPress={() => setShowForm(false)}>
                  <Feather name="x" size={24} color="#4B5563" />
                </TouchableOpacity>
              </View>
              
              <View style={{gap: 16}}>
                {/* Title input */}
                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Competition Title</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter competition title"
                    value={title}
                    onChangeText={setTitle}
                  />
                </View>
                
                {/* Description input */}
                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Description</Text>
                  <TextInput
                    style={styles.textArea}
                    placeholder="Describe your competition"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
                
                {/* Category selection */}
                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Category</Text>
                  <View style={styles.categoriesContainer}>
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.categoryChip,
                          categoryId === category.id 
                            ? styles.categoryChipActive 
                            : styles.categoryChipInactive
                        ]}
                        onPress={() => setCategoryId(category.id)}
                      >
                        <Text
                          style={
                            categoryId === category.id 
                              ? styles.categoryChipTextActive 
                              : styles.categoryChipTextInactive
                          }
                        >
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                {/* Prize amount */}
                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Prize Amount ($)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter prize amount"
                    value={prizeAmount}
                    onChangeText={setPrizeAmount}
                    keyboardType="numeric"
                  />
                </View>
                
                {/* Date selection */}
                <View style={styles.dateRow}>
                  <View style={styles.dateColumn}>
                    <Text style={styles.inputLabel}>Start Date</Text>
                    <View style={styles.dateDisplay}>
                      <Text style={styles.dateText}>{formatDate(startDate)}</Text>
                      <Text style={styles.dateHint}>Default: Today</Text>
                    </View>
                  </View>
                  
                  <View style={styles.dateColumn}>
                    <Text style={styles.inputLabel}>End Date</Text>
                    <View style={styles.dateDisplay}>
                      <Text style={styles.dateText}>{formatDate(endDate)}</Text>
                      <Text style={styles.dateHint}>Default: 7 days later</Text>
                    </View>
                  </View>
                </View>
                
                {/* Product information */}
                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Product Name</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter product name"
                    value={productName}
                    onChangeText={setProductName}
                  />
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Product Description</Text>
                  <TextInput
                    style={styles.textArea}
                    placeholder="Detailed description of your product"
                    value={productDescription}
                    onChangeText={setProductDescription}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
                
                {/* Product image */}
                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Product Image</Text>
                  {productImage ? (
                    <View style={styles.mediaPreviewContainer}>
                      <Image
                        source={{ uri: productImage.uri }}
                        style={styles.mediaImage}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        style={styles.removeMediaButton}
                        onPress={() => setProductImage(null)}
                      >
                        <Feather name="x" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.uploadContainer}
                      onPress={pickImage}
                    >
                      <Feather name="image" size={32} style={styles.uploadIcon} />
                      <Text style={styles.uploadText}>
                        Upload product image or banner
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                
                <TouchableOpacity
                  style={[
                    styles.submitButton, 
                    formLoading 
                      ? styles.submitButtonDisabled 
                      : styles.submitButtonEnabled
                  ]}
                  onPress={handleSubmit}
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <View style={styles.submitButtonContent}>
                      <ActivityIndicator size="small" color="white" />
                      <Text style={styles.submitButtonText}>
                        Creating...
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.submitButtonText}>
                      Create Competition
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          {/* Display business competitions */}
          <Text style={styles.title}>
            Your Competitions
          </Text>
          
          {competitions.length === 0 ? (
            <View style={[styles.formContainer, { alignItems: 'center', padding: 32 }]}>
              <Feather name="award" size={48} color="#CBD5E1" />
              <Text style={[styles.subtitle, { textAlign: 'center', marginTop: 16 }]}>
                You haven't created any competitions yet.
              </Text>
            </View>
          ) : (
            competitions.map((competition) => (
              <View 
                key={competition.id} 
                style={styles.competitionCard}
              >
                <View style={styles.competitionCardHeader}>
                  <Text style={styles.competitionTitle}>
                    {competition.title}
                  </Text>
                  <View style={[
                    styles.statusBadge,
                    competition.status === 'active' ? styles.activeBadge : styles.endedBadge
                  ]}>
                    <Text style={[
                      styles.statusText,
                      competition.status === 'active' ? styles.activeStatusText : styles.endedStatusText
                    ]}>
                      {competition.status.charAt(0).toUpperCase() + competition.status.slice(1)}
                    </Text>
                  </View>
                </View>
                
                <Text style={globalStyles.bodyText}>
                  {competition.description.length > 100 
                    ? competition.description.substring(0, 100) + '...' 
                    : competition.description}
                </Text>
                
                <View style={styles.metadataRow}>
                  <View style={styles.metadataItem}>
                    <Text style={styles.metadataLabel}>Category</Text>
                    <Text style={styles.metadataValue}>{competition.categories?.name}</Text>
                  </View>
                  
                  <View style={styles.metadataItem}>
                    <Text style={styles.metadataLabel}>Prize</Text>
                    <Text style={styles.metadataValue}>${competition.prize_amount}</Text>
                  </View>
                  
                  <View style={styles.metadataItem}>
                    <Text style={styles.metadataLabel}>Product</Text>
                    <Text style={styles.metadataValue}>{competition.product_name}</Text>
                  </View>
                </View>
                
                <View style={styles.competitionFooter}>
                  <Text style={styles.createdAtText}>
                    {formatDate(new Date(competition.start_date))} - {formatDate(new Date(competition.end_date))}
                  </Text>
                  
                  <TouchableOpacity
                    style={styles.viewDetailsButton}
                    onPress={() => handleViewCompetition(competition.id)}
                  >
                    <Text style={styles.viewDetailsText}>View Details</Text>
                    <Feather name="chevron-right" size={16} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
      
      {/* Date pickers - temporarily disabled
      <DateTimePickerModal
        isVisible={showStartDatePicker}
        mode="date"
        onConfirm={(date) => {
          setStartDate(date);
          setShowStartDatePicker(false);
        }}
        onCancel={() => setShowStartDatePicker(false)}
        minimumDate={new Date()}
      />
      
      <DateTimePickerModal
        isVisible={showEndDatePicker}
        mode="date"
        onConfirm={(date) => {
          setEndDate(date);
          setShowEndDatePicker(false);
        }}
        onCancel={() => setShowEndDatePicker(false)}
        minimumDate={new Date(startDate.getTime() + 24 * 60 * 60 * 1000)} // At least 1 day after start date
      /> */}
    </KeyboardAvoidingView>
  );
}
