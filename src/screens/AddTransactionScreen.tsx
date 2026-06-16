import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, SafeAreaView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../routes';
import { FinanceService } from '../services/FinanceService';
import { auth } from '../config/firebaseConfig';
import { Transaction } from '../models/Transaction';

type AddTransactionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddTransaction'>;

type Props = {
  navigation: AddTransactionScreenNavigationProp;
};

export default function AddTransactionScreen({ navigation }: Props) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const financeService = new FinanceService();

  const handleSave = async () => {
    if (!title.trim() || !amount.trim() || !category.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Erro', 'Por favor, insira um valor numérico válido.');
      return;
    }

    setLoading(true);

    try {
      // Pega o ID real do usuário logado no Firebase
      const userId = auth.currentUser?.uid || '1';
      
      // Gera a data formatada manualmente para evitar bugs no React Native
      const dateObj = new Date();
      const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;

      const newTransaction: Transaction = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        userId: userId,
        title: title.trim(),
        amount: numericAmount,
        type: type,
        category: category.trim(),
        date: formattedDate,
      };

      await financeService.addTransaction(newTransaction);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a transação.');
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
        <Text style={styles.headerTitle}>Nova Transação</Text>
        <View style={{ width: 48 }} />
      </View>

      <View style={styles.typeContainer}>
        <TouchableOpacity
          style={[styles.typeButton, type === 'income' && styles.typeButtonActiveIncome]}
          onPress={() => setType('income')}
        >
          <Text style={[styles.typeText, type === 'income' && styles.typeTextActive]}>Receita</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, type === 'expense' && styles.typeButtonActiveExpense]}
          onPress={() => setType('expense')}
        >
          <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>Despesa</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Título (ex: Salário, Aluguel)"
        placeholderTextColor="#888"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={styles.input}
        placeholder="Valor (ex: 1500.00)"
        placeholderTextColor="#888"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Categoria (ex: Trabalho, Casa)"
        placeholderTextColor="#888"
        value={category}
        onChangeText={setCategory}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
        <Text style={styles.saveButtonText}>{loading ? 'Salvando...' : 'Salvar'}</Text>
      </TouchableOpacity>
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
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#202024',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typeButtonActiveIncome: {
    borderColor: '#00875f',
    backgroundColor: 'rgba(0, 135, 95, 0.1)',
  },
  typeButtonActiveExpense: {
    borderColor: '#f75a68',
    backgroundColor: 'rgba(247, 90, 104, 0.1)',
  },
  typeText: {
    color: '#8b8b8d',
    fontSize: 16,
    fontWeight: 'bold',
  },
  typeTextActive: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#202024',
    color: '#fff',
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#323238',
  },
  saveButton: {
    backgroundColor: '#00875f',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    height: 56,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});