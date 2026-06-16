import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TransactionDetailsScreen from '../screens/TransactionDetailsScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { Transaction } from '../models/Transaction';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  AddTransaction: undefined;
  Profile: undefined;
  TransactionDetails: { transaction: Transaction };
  Statistics: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Routes() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#121214' }
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddTransaction" component={AddTransactionScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="TransactionDetails" component={TransactionDetailsScreen} />
        <Stack.Screen name="Statistics" component={StatisticsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}