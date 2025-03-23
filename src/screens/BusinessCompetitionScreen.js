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
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import supabase from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

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
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Loading your competitions...</Text>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView className="flex-1 bg-background">
        <View className="p-4">
          <Text className="text-2xl font-bold text-gray-800 mb-2">Business Dashboard</Text>
          <Text className="text-gray-600 mb-6">
            Manage your business competitions
          </Text>
          
          {!showForm ? (
            <TouchableOpacity
              className="bg-primary py-3 rounded-lg items-center mb-6"
              onPress={() => setShowForm(true)}
            >
              <Text className="text-white font-bold text-lg">Create New Competition</Text>
            </TouchableOpacity>
          ) : (
            // Competition creation form
            <View className="bg-white rounded-lg p-4 shadow-sm mb-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold text-gray-800">Create Competition</Text>
                <TouchableOpacity onPress={() => setShowForm(false)}>
                  <Feather name="x" size={24} color="#4B5563" />
                </TouchableOpacity>
              </View>
              
              <View className="space-y-4">
                {/* Title input */}
                <View>
                  <Text className="text-gray-700 mb-1 font-medium">Competition Title</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                    placeholder="Enter competition title"
                    value={title}
                    onChangeText={setTitle}
                  />
                </View>
                
                {/* Description input */}
                <View>
                  <Text className="text-gray-700 mb-1 font-medium">Description</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                    placeholder="Describe your competition"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
                
                {/* Category selection */}
                <View>
                  <Text className="text-gray-700 mb-1 font-medium">Category</Text>
                  <View className="flex-row flex-wrap">
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        className={`mr-2 mb-2 px-3 py-2 rounded-full ${
                          categoryId === category.id ? 'bg-primary' : 'bg-gray-200'
                        }`}
                        onPress={() => setCategoryId(category.id)}
                      >
                        <Text
                          className={`${
                            categoryId === category.id ? 'text-white' : 'text-gray-700'
                          }`}
                        >
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                {/* Prize amount */}
                <View>
                  <Text className="text-gray-700 mb-1 font-medium">Prize Amount ($)</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                    placeholder="Enter prize amount"
                    value={prizeAmount}
                    onChangeText={setPrizeAmount}
                    keyboardType="numeric"
                  />
                </View>
                
                {/* Date selection */}
                <View className="flex-row space-x-4">
                  <View className="flex-1">
                    <Text className="text-gray-700 mb-1 font-medium">Start Date</Text>
                    <TouchableOpacity
                      className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3"
                      onPress={() => setShowStartDatePicker(true)}
                    >
                      <Text className="text-gray-800">{formatDate(startDate)}</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View className="flex-1">
                    <Text className="text-gray-700 mb-1 font-medium">End Date</Text>
                    <TouchableOpacity
                      className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3"
                      onPress={() => setShowEndDatePicker(true)}
                    >
                      <Text className="text-gray-800">{formatDate(endDate)}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Product information */}
                <View>
                  <Text className="text-gray-700 mb-1 font-medium">Product Name</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                    placeholder="Enter product name"
                    value={productName}
                    onChangeText={setProductName}
                  />
                </View>
                
                <View>
                  <Text className="text-gray-700 mb-1 font-medium">Product Description</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
                    placeholder="Detailed description of your product"
                    value={productDescription}
                    onChangeText={setProductDescription}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
                
                {/* Product image */}
                <View>
                  <Text className="text-gray-700 mb-2 font-medium">Product Image</Text>
                  {productImage ? (
                    <View className="rounded-lg overflow-hidden mb-2">
                      <Image
                        source={{ uri: productImage.uri }}
                        className="w-full h-48 bg-gray-200"
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        className="absolute top-2 right-2 bg-white rounded-full p-2"
                        onPress={() => setProductImage(null)}
                      >
                        <Feather name="x" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      className="bg-gray-50 border border-dashed border-gray-300 rounded-lg py-6 items-center"
                      onPress={pickImage}
                    >
                      <Feather name="image" size={32} color="#9CA3AF" />
                      <Text className="text-gray-500 mt-2">
                        Upload product image or banner
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                
                <TouchableOpacity
                  className={`rounded-lg py-3.5 items-center mt-4 ${
                    formLoading ? 'bg-primary/70' : 'bg-primary'
                  }`}
                  onPress={handleSubmit}
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <View className="flex-row items-center">
                      <ActivityIndicator size="small" color="white" />
                      <Text className="text-white font-bold text-lg ml-2">
                        Creating...
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-white font-bold text-lg">
                      Create Competition
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          {/* Display business competitions */}
          <Text className="text-xl font-bold text-gray-800 mb-4">
            Your Competitions
          </Text>
          
          {competitions.length === 0 ? (
            <View className="bg-white rounded-lg p-8 items-center">
              <Feather name="award" size={48} color="#CBD5E1" />
              <Text className="text-gray-500 mt-4 text-center">
                You haven't created any competitions yet.
              </Text>
            </View>
          ) : (
            competitions.map((competition) => (
              <View 
                key={competition.id} 
                className="bg-white rounded-lg p-4 shadow-sm mb-4"
              >
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-lg font-bold text-gray-800">
                    {competition.title}
                  </Text>
                  <View className={`px-3 py-1 rounded-full ${competition.status === 'active' ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <Text className={`text-xs font-medium ${competition.status === 'active' ? 'text-green-800' : 'text-gray-800'}`}>
                      {competition.status.charAt(0).toUpperCase() + competition.status.slice(1)}
                    </Text>
                  </View>
                </View>
                
                <Text className="text-gray-600 mb-3">
                  {competition.description.length > 100 
                    ? competition.description.substring(0, 100) + '...' 
                    : competition.description}
                </Text>
                
                <View className="flex-row mb-3">
                  <View className="mr-4">
                    <Text className="text-xs text-gray-500">Category</Text>
                    <Text className="text-gray-800">{competition.categories?.name}</Text>
                  </View>
                  
                  <View className="mr-4">
                    <Text className="text-xs text-gray-500">Prize</Text>
                    <Text className="text-gray-800">${competition.prize_amount}</Text>
                  </View>
                  
                  <View>
                    <Text className="text-xs text-gray-500">Product</Text>
                    <Text className="text-gray-800">{competition.product_name}</Text>
                  </View>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-gray-500 text-xs">
                    {formatDate(new Date(competition.start_date))} - {formatDate(new Date(competition.end_date))}
                  </Text>
                  
                  <TouchableOpacity
                    className="flex-row items-center"
                    onPress={() => handleViewCompetition(competition.id)}
                  >
                    <Text className="text-primary font-medium mr-1">View Details</Text>
                    <Feather name="chevron-right" size={16} color="#3B82F6" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
      
      {/* Date pickers */}
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
      />
    </KeyboardAvoidingView>
  );
}
