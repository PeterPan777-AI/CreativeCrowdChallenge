import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { Feather } from '@expo/vector-icons';

// Screens
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import CompetitionDetailsScreen from '../screens/CompetitionDetailsScreen';
import SubmissionScreen from '../screens/SubmissionScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CategorySuggestionScreen from '../screens/CategorySuggestionScreen';
import BusinessCompetitionScreen from '../screens/BusinessCompetitionScreen';
import AdminScreen from '../screens/AdminScreen';
import LoadingComponent from '../components/LoadingComponent';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main tab navigator for authenticated users
function MainTabNavigator() {
  const { userDetails } = useAuth();
  const isAdmin = userDetails?.role === 'admin';
  const isBusiness = userDetails?.role === 'business';

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 5,
          paddingTop: 5,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" color={color} size={size} />
          ),
        }}
      />
      
      {isBusiness && (
        <Tab.Screen
          name="Business"
          component={BusinessCompetitionScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Feather name="briefcase" color={color} size={size} />
            ),
          }}
        />
      )}
      
      <Tab.Screen
        name="Categories"
        component={CategorySuggestionScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="list" color={color} size={size} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" color={color} size={size} />
          ),
        }}
      />
      
      {isAdmin && (
        <Tab.Screen
          name="Admin"
          component={AdminScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Feather name="settings" color={color} size={size} />
            ),
          }}
        />
      )}
    </Tab.Navigator>
  );
}

// Stack navigator for home-related screens
function HomeNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#3B82F6',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="Competitions"
        component={HomeScreen}
        options={{ title: 'Score4Me' }}
      />
      <Stack.Screen
        name="CompetitionDetails"
        component={CompetitionDetailsScreen}
        options={({ route }) => ({ title: route.params?.title || 'Competition Details' })}
      />
      <Stack.Screen
        name="Submission"
        component={SubmissionScreen}
      />
    </Stack.Navigator>
  );
}

// Root navigator that handles auth flow
export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
    </Stack.Navigator>
  );
}
