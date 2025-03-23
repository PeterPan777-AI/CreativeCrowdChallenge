import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { signIn, signUp } = useAuth();
  
  const passwordRef = useRef(null);
  const usernameRef = useRef(null);
  
  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };
  
  const validateForm = () => {
    if (!email) return 'Email is required';
    if (!validateEmail(email)) return 'Please enter a valid email address';
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (!isLogin && !username) return 'Username is required';
    return null;
  };
  
  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }
    
    setLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
      } else {
        const { error } = await signUp(email, password, username);
        if (error) throw error;
        else {
          Alert.alert(
            'Registration Successful',
            'Please check your email to verify your account before logging in.'
          );
          setIsLogin(true);
        }
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setPassword('');
    if (isLogin) {
      setUsername('');
    }
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <StatusBar style="dark" />
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        className="bg-background"
      >
        <View className="flex-1 justify-center px-6 py-12">
          <View className="items-center mb-10">
            <Text className="text-4xl font-bold text-primary mb-2">Score4Me</Text>
            <Text className="text-lg text-gray-600 text-center">
              {isLogin ? 'Welcome back!' : 'Create your account'}
            </Text>
          </View>
          
          <View className="space-y-4">
            {!isLogin && (
              <View>
                <Text className="text-gray-700 mb-1 ml-1 font-medium">Username</Text>
                <View className="flex-row items-center border border-gray-300 rounded-lg px-4 py-3 bg-white">
                  <Feather name="user" size={20} color="#4B5563" />
                  <TextInput
                    className="flex-1 ml-2 text-base text-gray-800"
                    placeholder="Enter your username"
                    value={username}
                    onChangeText={setUsername}
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    ref={usernameRef}
                  />
                </View>
              </View>
            )}
            
            <View>
              <Text className="text-gray-700 mb-1 ml-1 font-medium">Email</Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg px-4 py-3 bg-white">
                <Feather name="mail" size={20} color="#4B5563" />
                <TextInput
                  className="flex-1 ml-2 text-base text-gray-800"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    isLogin 
                      ? passwordRef.current?.focus() 
                      : usernameRef.current?.focus();
                  }}
                />
              </View>
            </View>
            
            <View>
              <Text className="text-gray-700 mb-1 ml-1 font-medium">Password</Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg px-4 py-3 bg-white">
                <Feather name="lock" size={20} color="#4B5563" />
                <TextInput
                  className="flex-1 ml-2 text-base text-gray-800"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  ref={passwordRef}
                  onSubmitEditing={handleSubmit}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Feather 
                    name={showPassword ? 'eye-off' : 'eye'} 
                    size={20} 
                    color="#4B5563" 
                  />
                </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity
              className={`rounded-lg py-3.5 items-center ${loading ? 'bg-primary/70' : 'bg-primary'} mt-4`}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text className="text-white font-bold text-lg">
                {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="items-center py-4"
              onPress={toggleAuthMode}
            >
              <Text className="text-primary font-medium">
                {isLogin 
                  ? "Don't have an account? Sign Up" 
                  : "Already have an account? Sign In"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
