import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import { Alert, Platform } from 'react-native';

// Get Supabase URL and key from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Debug logging - this will show in dev console
console.log('Supabase URL available:', !!supabaseUrl);
console.log('Supabase Anon Key available:', !!supabaseAnonKey);

// More visible debugging in web
if (Platform.OS === 'web') {
  // Add a div to the document to display debug info
  const debugElement = document.createElement('div');
  debugElement.id = 'debug-info';
  debugElement.style.position = 'fixed';
  debugElement.style.top = '10px';
  debugElement.style.left = '10px';
  debugElement.style.backgroundColor = 'rgba(0,0,0,0.7)';
  debugElement.style.color = 'white';
  debugElement.style.padding = '10px';
  debugElement.style.zIndex = '9999';
  debugElement.style.borderRadius = '5px';
  debugElement.style.fontSize = '14px';
  
  debugElement.innerText = `Supabase URL: ${supabaseUrl ? 'Available' : 'Missing'}
Supabase Anon Key: ${supabaseAnonKey ? 'Available' : 'Missing'}`;
  
  // Wait for document to be ready
  if (document.body) {
    document.body.appendChild(debugElement);
  } else {
    window.addEventListener('DOMContentLoaded', () => {
      document.body.appendChild(debugElement);
    });
  }
}

// Check if credentials are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials are missing!');
  
  if (Platform.OS !== 'web') {
    Alert.alert(
      'Configuration Error',
      'Supabase credentials are missing. Please check your environment variables.'
    );
  }
}

// Initialize the Supabase client
let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  console.log('Supabase client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  // Create a non-functional client to prevent app crashes
  supabase = {
    auth: {
      signIn: () => Promise.reject(new Error('Supabase client not initialized')),
      signUp: () => Promise.reject(new Error('Supabase client not initialized')),
      signOut: () => Promise.reject(new Error('Supabase client not initialized')),
      onAuthStateChange: () => ({ data: null, error: new Error('Supabase client not initialized') }),
      getSession: () => Promise.resolve({ data: null, error: new Error('Supabase client not initialized') }),
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.reject(new Error('Supabase client not initialized')) }) }),
      insert: () => Promise.reject(new Error('Supabase client not initialized')),
    }),
  };
}

export default supabase;
