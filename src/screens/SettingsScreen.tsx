import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../routes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../config/firebaseConfig';
import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

type Props = {
  navigation: SettingsScreenNavigationProp;
};

export default function SettingsScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);

  const handleClearData = () => {
    Alert.alert(
      'Apagar todos os dados',
      'Tem certeza? Isso vai remover todas as suas transações do celular e da nuvem. Essa ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar', style: 'destructive', onPress: performDataClear }
      ]
    );
  };

  const performDataClear = async () => {
    setLoading(true);
    try {
      // 1. Limpa o AsyncStorage local
      await AsyncStorage.removeItem('@fintrack_transactions');

      // 2. Limpa as transações do usuário logado no Firebase Firestore
      const userId = auth.currentUser?.uid;
      if (userId) {
        const q = query(collection(db, 'transactions'), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        
        const batch = writeBatch(db);
        querySnapshot.forEach((document) => {
          batch.delete(doc(db, 'transactions', document.id));
        });
        
        await batch.commit();
      }

      Alert.alert('Sucesso', 'Todos os seus dados foram apagados.');
      navigation.goBack();
      
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível apagar os dados. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
        <View style={{ width: 48 }} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gerenciamento de Dados</Text>
        <Text style={styles.sectionDescription}>
          Apagar os dados removerá todo o seu histórico financeiro permanentemente.
        </Text>
        
        <TouchableOpacity 
          style={styles.dangerButton} 
          onPress={handleClearData}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#f75a68" />
          ) : (
            <Text style={styles.dangerButtonText}>Apagar todos os dados</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    color: '#00875f',
    fontSize: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#202024',
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    color: '#8b8b8d',
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  dangerButton: {
    borderWidth: 1,
    borderColor: '#f75a68',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#f75a68',
    fontSize: 16,
    fontWeight: 'bold',
  }
});