import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Routes from './src/routes';

export default function App() {
  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar style="light" backgroundColor="#121214" translucent={false} />
      <Routes />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
});