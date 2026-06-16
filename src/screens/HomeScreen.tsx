import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../routes';
import { Transaction } from '../models/Transaction';
import { FinanceService } from '../services/FinanceService';
import { auth } from '../config/firebaseConfig';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

export default function HomeScreen({ navigation }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<number>(0);

  const financeService = new FinanceService();

  const loadFinanceData = async () => {
    await financeService.syncPendingTransactions();

    const userId = auth.currentUser?.uid || '1';
    
    const storedTransactions = await financeService.getTransactions(userId);
    const currentBalance = storedTransactions.reduce((total, transaction) => {
      return transaction.type === 'income'
        ? total + transaction.amount
        : total - transaction.amount;
    }, 0);
    
    setTransactions(storedTransactions);
    setBalance(currentBalance);
  };

  useFocusEffect(
    useCallback(() => {
      loadFinanceData();
    }, [])
  );

  const renderItem = ({ item }: { item: Transaction }) => (
    <TouchableOpacity 
      style={styles.transactionItem}
      onPress={() => navigation.navigate('TransactionDetails', { transaction: item })}
    >
      <View>
        <Text style={styles.transactionTitle}>{item.title}</Text>
        <Text style={styles.transactionDate}>{item.date}</Text>
      </View>
      <Text style={[styles.transactionAmount, item.type === 'expense' && styles.expenseAmount]}>
        {item.type === 'income' ? '+' : '-'} R$ {item.amount.toFixed(2)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.profileButton}>Perfil</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.balanceCard}>
        <View style={styles.balanceInfo}>
          <Text style={styles.balanceLabel}>Seu saldo</Text>
          <Text style={styles.balanceValue}>R$ {balance.toFixed(2)}</Text>
        </View>
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => navigation.navigate('AddTransaction')}
          >
            <Text style={styles.addButtonIcon}>+</Text>
          </TouchableOpacity>
          <Text style={styles.actionLabel}>Adicionar</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Histórico Recente</Text>
      
      {transactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhuma transação registrada ainda.</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    marginBottom: 24,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileButton: {
    color: '#00875f',
    fontSize: 16,
    fontWeight: '600',
  },
  balanceCard: {
    backgroundColor: '#202024',
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    color: '#e1e1e6',
    fontSize: 16,
    marginBottom: 8,
  },
  balanceValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  actionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  addButtonIcon: {
    color: '#121214',
    fontSize: 24,
    fontWeight: '400',
  },
  actionLabel: {
    color: '#e1e1e6',
    fontSize: 14,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  transactionItem: {
    backgroundColor: '#202024',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionDate: {
    color: '#8b8b8d',
    fontSize: 14,
  },
  transactionAmount: {
    color: '#00875f',
    fontSize: 16,
    fontWeight: 'bold',
  },
  expenseAmount: {
    color: '#f75a68',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  emptyText: {
    color: '#8b8b8d',
    fontSize: 16,
  }
});