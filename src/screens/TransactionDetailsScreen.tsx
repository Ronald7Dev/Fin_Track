import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Share, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../routes';

type DetailsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TransactionDetails'>;
type DetailsRouteProp = RouteProp<RootStackParamList, 'TransactionDetails'>;

type Props = {
  navigation: DetailsNavigationProp;
  route: DetailsRouteProp;
};

export default function TransactionDetailsScreen({ navigation, route }: Props) {
  const { transaction } = route.params;

  const handleShare = async () => {
    try {
      const typeLabel = transaction.type === 'income' ? 'Entrada' : 'Saída';
      const message = `Detalhes da Transação do FinTrack:\n\nTítulo: ${transaction.title}\nData: ${transaction.date}\nTipo: ${typeLabel}\nValor: R$ ${transaction.amount.toFixed(2)}`;
      
      await Share.share({
        message: message,
        title: 'Compartilhar Transação',
      });
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível compartilhar a transação.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Título</Text>
        <Text style={styles.value}>{transaction.title}</Text>

        <View style={styles.divider} />

        <Text style={styles.label}>Data</Text>
        <Text style={styles.value}>{transaction.date}</Text>

        <View style={styles.divider} />

        <Text style={styles.label}>Tipo da Transação</Text>
        <Text style={[styles.value, transaction.type === 'expense' ? styles.expenseText : styles.incomeText]}>
          {transaction.type === 'income' ? 'Entrada (+)' : 'Saída (-)'}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.label}>Valor</Text>
        <Text style={styles.amountValue}>R$ {transaction.amount.toFixed(2)}</Text>
      </View>

      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <Text style={styles.shareButtonText}>Compartilhar Recibo</Text>
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
    marginBottom: 40,
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
  card: {
    backgroundColor: '#202024',
    padding: 24,
    borderRadius: 12,
    marginBottom: 32,
  },
  label: {
    color: '#8b8b8d',
    fontSize: 14,
    marginBottom: 4,
  },
  value: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#323238',
    marginVertical: 16,
  },
  incomeText: {
    color: '#00875f',
  },
  expenseText: {
    color: '#f75a68',
  },
  amountValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  shareButton: {
    backgroundColor: '#00875f',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});