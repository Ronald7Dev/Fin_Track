import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../routes';
import { FinanceService } from '../services/FinanceService';
import { auth } from '../config/firebaseConfig';

type StatisticsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Statistics'>;

type Props = {
  navigation: StatisticsScreenNavigationProp;
};

export default function StatisticsScreen({ navigation }: Props) {
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [loading, setLoading] = useState(true);

  const financeService = new FinanceService();

  const calculateTotalIncome = (transactions: any[]) =>
    transactions.reduce((sum, transaction) => {
      const amount = Number(transaction.amount ?? transaction.value ?? transaction.valor ?? 0);
      const type = String(transaction.type ?? '').toLowerCase();

      if (amount > 0 && ['income', 'positive', 'entrada'].includes(type)) {
        return sum + amount;
      }

      if (amount < 0 && ['expense', 'negative', 'saida'].includes(type)) {
        return sum + Math.abs(amount);
      }

      return sum + (amount > 0 ? amount : 0);
    }, 0);

  const calculateTotalExpense = (transactions: any[]) =>
    transactions.reduce((sum, transaction) => {
      const amount = Number(transaction.amount ?? transaction.value ?? transaction.valor ?? 0);
      const type = String(transaction.type ?? '').toLowerCase();

      if (amount < 0 && ['expense', 'negative', 'saida'].includes(type)) {
        return sum + Math.abs(amount);
      }

      if (amount > 0 && ['expense', 'negative', 'saida'].includes(type)) {
        return sum + amount;
      }

      return sum + (amount < 0 ? Math.abs(amount) : 0);
    }, 0);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setLoading(true);
        try {
          const userId = auth.currentUser?.uid || '1';
          const storedTransactions = await financeService.getTransactions(userId);
          
          setIncome(calculateTotalIncome(storedTransactions));
          setExpense(calculateTotalExpense(storedTransactions));
        } catch (error) {
          console.error("Erro ao carregar estatísticas", error);
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }, [])
  );

  const total = income + expense;
  const incomePercentage = total > 0 ? ((income / total) * 100).toFixed(0) : '0';
  const expensePercentage = total > 0 ? ((expense / total) * 100).toFixed(0) : '0';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Estatísticas</Text>
        <View style={{ width: 48 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#00875f" style={styles.loader} />
      ) : (
        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Receitas</Text>
            <Text style={styles.incomeText}>R$ {income.toFixed(2)}</Text>
            <Text style={styles.percentageText}>{incomePercentage}% do total movimentado</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Despesas</Text>
            <Text style={styles.expenseText}>R$ {expense.toFixed(2)}</Text>
            <Text style={styles.percentageText}>{expensePercentage}% do total movimentado</Text>
          </View>

          <View style={[styles.card, styles.balanceCard]}>
            <Text style={styles.cardTitle}>Balanço do Período</Text>
            <Text style={[styles.balanceText, (income - expense) >= 0 ? styles.positive : styles.negative]}>
              R$ {(income - expense).toFixed(2)}
            </Text>
          </View>
        </View>
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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  card: {
    backgroundColor: '#202024',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  balanceCard: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#323238',
  },
  cardTitle: {
    color: '#8b8b8d',
    fontSize: 16,
    marginBottom: 8,
  },
  incomeText: {
    color: '#00875f',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  expenseText: {
    color: '#f75a68',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  balanceText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  positive: {
    color: '#00875f',
  },
  negative: {
    color: '#f75a68',
  },
  percentageText: {
    color: '#8b8b8d',
    fontSize: 14,
  }
});