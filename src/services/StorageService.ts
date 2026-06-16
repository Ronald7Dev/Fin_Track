import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '../models/Transaction';

export class StorageService {
  private readonly TRANSACTIONS_KEY = '@fintrack_transactions';
  private readonly AVATAR_KEY = '@fintrack_avatar';

  public async saveTransaction(newTransaction: Transaction): Promise<void> {
    try {
      const existingTransactions = await this.getTransactions();
      const updatedTransactions = [newTransaction, ...existingTransactions];
      
      await AsyncStorage.setItem(
        this.TRANSACTIONS_KEY,
        JSON.stringify(updatedTransactions)
      );
    } catch (error) {
      console.error('Erro ao salvar a transação:', error);
      throw new Error('Não foi possível salvar a transação.');
    }
  }

  public async getTransactions(): Promise<Transaction[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(this.TRANSACTIONS_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error('Erro ao buscar as transações:', error);
      return [];
    }
  }

  public async saveAvatar(uri: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.AVATAR_KEY, uri);
    } catch (error) {
      console.error('Erro ao salvar o avatar:', error);
    }
  }

  public async getAvatar(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.AVATAR_KEY);
    } catch (error) {
      console.error('Erro ao buscar o avatar:', error);
      return null;
    }
  }

  public async clearAll(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.TRANSACTIONS_KEY);
      await AsyncStorage.removeItem(this.AVATAR_KEY);
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
    }
  }
}