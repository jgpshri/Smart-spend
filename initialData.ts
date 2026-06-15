/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BankAccount, Transaction, BudgetGoal } from '../types';

export const INITIAL_ACCOUNTS: BankAccount[] = [
  {
    id: 'checking',
    name: 'Checking Account',
    type: 'checking',
    balance: 20000,
    isSynced: true,
    accountNumber: '•••• 8921'
  },
  {
    id: 'savings',
    name: 'High-Yield Savings',
    type: 'savings',
    balance: 0,
    isSynced: true,
    accountNumber: '•••• 4302'
  },
  {
    id: 'investments',
    name: 'Portfolio Investment Brokerage',
    type: 'investments',
    balance: 0,
    isSynced: true,
    accountNumber: '•••• 5591'
  },
  {
    id: 'other',
    name: 'Crypto & Alternative Assets',
    type: 'other',
    balance: 0,
    isSynced: false,
    accountNumber: '•••• 1209'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_GOALS: BudgetGoal[] = [
  {
    id: 'g-1',
    title: 'GROCERIES PROVISIONS',
    category: 'Groceries',
    target: 6000,
    current: 0,
    color: '#10B981', // Emerald Green 30% Needs
    percentage: 0
  },
  {
    id: 'g-2',
    title: 'SECURE UTILITIES',
    category: 'Utilities',
    target: 4000,
    current: 0,
    color: '#3B82F6', // Blue 20% Needs
    percentage: 0
  },
  {
    id: 'g-3',
    title: 'SHOPPING MODERATION',
    category: 'Shopping',
    target: 4000,
    current: 0,
    color: '#EF4444', // Red 20% Wants
    percentage: 0
  },
  {
    id: 'g-4',
    title: 'ENTERTAINMENT CAP',
    category: 'Entertainment',
    target: 2000,
    current: 0,
    color: '#F59E0B', // Amber 10% Wants
    percentage: 0
  },
  {
    id: 'g-5',
    title: 'SAVINGS & INVESTMENT VAULT',
    category: 'Investment',
    target: 4000,
    current: 0,
    color: '#8B5CF6', // Purple 20% Savings
    percentage: 0
  }
];

// Seeded 12-month net worth projection data to represent long term financial growth
export const GROWTH_TRENDS_DATA = [
  { month: 'Jan', netWorth: 41200, assets: 45200, liabilities: 4000 },
  { month: 'Feb', netWorth: 43400, assets: 47200, liabilities: 3800 },
  { month: 'Mar', netWorth: 45800, assets: 49300, liabilities: 3500 },
  { month: 'Apr', netWorth: 46200, assets: 49500, liabilities: 3300 },
  { month: 'May', netWorth: 49800, assets: 52800, liabilities: 3000 },
  { month: 'Jun', netWorth: 58870.89, assets: 61670.89, liabilities: 2800 },
  { month: 'Jul', netWorth: 61200, assets: 63800, liabilities: 2600 },
  { month: 'Aug', netWorth: 64100, assets: 66500, liabilities: 2400 },
  { month: 'Sep', netWorth: 67300, assets: 69500, liabilities: 2200 },
  { month: 'Oct', netWorth: 71000, assets: 73000, liabilities: 2000 },
  { month: 'Nov', netWorth: 75200, assets: 77000, liabilities: 1800 },
  { month: 'Dec', netWorth: 81500, assets: 83000, liabilities: 1500 }
];
