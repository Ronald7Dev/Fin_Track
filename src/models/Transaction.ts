export interface Transaction {
  id: string;
  userId: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  description?: string;
  synced?: boolean;
}