import { db } from '../config/firebaseConfig';
import { collection, doc, setDoc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '../models/Transaction';

const TRANSACTIONS_KEY = '@fintrack_transactions';

export class FinanceService {
  
  public async addTransaction(transaction: Transaction): Promise<void> {
    try {
      const localData = await AsyncStorage.getItem(TRANSACTIONS_KEY);
      const transactions: Transaction[] = localData ? JSON.parse(localData) : [];
      
      transaction.synced = false;
      transactions.push(transaction);
      
      await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));

      await this.syncTransactionToFirebase(transaction);
    } catch (error) {
      console.error('Erro ao salvar transação localmente:', error);
      throw new Error('Não foi possível salvar a transação no dispositivo.');
    }
  }

  private async syncTransactionToFirebase(transaction: Transaction): Promise<void> {
    try {
      const docRef = doc(db, 'transactions', transaction.id);
      
      // Criamos uma cópia limpa para mandar pro Firebase (sem a prop local 'synced')
      const transactionToSync = { ...transaction };
      delete transactionToSync.synced; 
      
      await setDoc(docRef, transactionToSync);

      // Se passou da linha acima, deu certo. Atualizamos o cache local!
      const localData = await AsyncStorage.getItem(TRANSACTIONS_KEY);
      if (localData) {
        let transactions: Transaction[] = JSON.parse(localData);
        transactions = transactions.map(t => 
          t.id === transaction.id ? { ...t, synced: true } : t
        );
        await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
      }
    } catch (error) {
      console.log('Sem internet ou erro no Firebase. A transação está salva localmente e será sincronizada depois.');
    }
  }

  public async syncPendingTransactions(): Promise<void> {
    try {
      const localData = await AsyncStorage.getItem(TRANSACTIONS_KEY);
      if (!localData) return;

      const transactions: Transaction[] = JSON.parse(localData);
      const pendingTransactions = transactions.filter(t => !t.synced);

      if (pendingTransactions.length === 0) return;

      const batch = writeBatch(db);
      
      pendingTransactions.forEach(transaction => {
        const docRef = doc(db, 'transactions', transaction.id);
        const transactionToSync = { ...transaction };
        delete transactionToSync.synced; 
        batch.set(docRef, transactionToSync);
      });

      await batch.commit();

      const updatedTransactions = transactions.map(t => ({ ...t, synced: true }));
      await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updatedTransactions));
      
      console.log(`${pendingTransactions.length} transações sincronizadas com sucesso!`);
    } catch (error) {
      console.log('Falha ao sincronizar as pendências. O app tentará novamente depois.');
    }
  }

  public async getTransactions(userId: string): Promise<Transaction[]> {
    try {
      // 1. Carrega do local primeiro para renderizar a tela instantaneamente (Offline)
      const localData = await AsyncStorage.getItem(TRANSACTIONS_KEY);
      let localTransactions: Transaction[] = localData ? JSON.parse(localData) : [];
      
      localTransactions = localTransactions.filter(t => t.userId === userId);

      // 2. Tenta buscar do Firebase para atualizar dados em background
      try {
        const q = query(collection(db, 'transactions'), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        
        const firebaseTransactions: Transaction[] = [];
        querySnapshot.forEach((docSnap) => {
          firebaseTransactions.push({ ...docSnap.data(), id: docSnap.id, synced: true } as Transaction);
        });

        if (firebaseTransactions.length > 0) {
           const pendingLocals = localTransactions.filter(t => !t.synced);
           
           // Junta o que veio do banco com o que ainda tá pendente de subir no celular
           const allTransactions = [...firebaseTransactions, ...pendingLocals];
           
           // Remove duplicatas baseadas no ID, caso existam
           const uniqueTransactions = Array.from(new Map(allTransactions.map(item => [item.id, item])).values());

           await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(uniqueTransactions));
           return uniqueTransactions;
        }
      } catch (firebaseError) {
        console.log('Buscando apenas do cache local (Offline mode).');
      }

      return localTransactions;

    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      throw new Error('Não foi possível carregar as transações.');
    }
  }
}