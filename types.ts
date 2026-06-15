/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Transaction {
  id: string;
  category: string; // 'Food' | 'Transport' | 'Shopping' | 'Utilities' | 'Salary' | 'Investment Yield' | other
  description: string;
  date: string; // YYYY-MM-DD
  amount: number;
  type: 'income' | 'expense';
  accountType: 'checking' | 'savings' | 'investments' | 'other';
}

export interface BankAccount {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'investments' | 'other';
  balance: number;
  isSynced: boolean;
  accountNumber: string;
}

export interface BudgetGoal {
  id: string;
  title: string;
  category: string;
  target: number;
  current: number;
  color: string; // Tailwind glow / color class mapping
  percentage: number;
}

export interface MockUser {
  email: string;
  passwordHash: string; // simulated
  name: string;
  isLoggedIn: boolean;
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string; // HH:MM
  type: 'alert' | 'success' | 'info';
  isRead: boolean;
}
