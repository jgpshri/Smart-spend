/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Database, 
  LogOut, 
  Activity, 
  Cpu, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  UserCheck, 
  Sliders, 
  X,
  CreditCard,
  BookOpen
} from 'lucide-react';
import { BankAccount, Transaction, BudgetGoal, MockUser, PushNotification } from './types';
import { INITIAL_ACCOUNTS, INITIAL_TRANSACTIONS, INITIAL_GOALS } from './data/initialData';
import { SecureAuth } from './components/SecureAuth';
import { TransactionLedger } from './components/TransactionLedger';
import { FinancialObjectives } from './components/FinancialObjectives';
import { InteractiveGrowthChart } from './components/InteractiveGrowthChart';
import { ReportGenerator } from './components/ReportGenerator';
import { NotificationPanel } from './components/NotificationToast';

export default function App() {
  // Session / User authentication state
  const [user, setUser] = useState<MockUser | null>(() => {
    const savedUser = localStorage.getItem('finance_ledger_v3_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Financial status state pools
  const [accounts, setAccounts] = useState<BankAccount[]>(() => {
    const savedAccounts = localStorage.getItem('finance_ledger_v3_accounts');
    return savedAccounts ? JSON.parse(savedAccounts) : INITIAL_ACCOUNTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const savedTx = localStorage.getItem('finance_ledger_v3_transactions');
    return savedTx ? JSON.parse(savedTx) : INITIAL_TRANSACTIONS;
  });

  const [goals, setGoals] = useState<BudgetGoal[]>(() => {
    const savedGoals = localStorage.getItem('finance_ledger_v3_goals');
    return savedGoals ? JSON.parse(savedGoals) : INITIAL_GOALS;
  });

  // Dynamic system-level alarm status stack
  const [notifications, setNotifications] = useState<PushNotification[]>(() => {
    const savedNotes = localStorage.getItem('finance_ledger_v3_notifications');
    return savedNotes ? JSON.parse(savedNotes) : [
      {
        id: 'n-1',
        title: 'AUTHENTICATOR SYNC',
        message: 'Decentralized firewall protocols are running. Biometric fingerprint verification enabled.',
        timestamp: '12:00',
        type: 'info',
        isRead: false
      }
    ];
  });

  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedAccountFilter, setSelectedAccountFilter] = useState<'all' | 'checking' | 'savings' | 'investments' | 'other'>('all');
  const [systemTime, setSystemTime] = useState('');
  const [currentTab, setCurrentTab] = useState<'ledger' | 'budgets' | 'analytics' | 'reports'>('ledger');

  // Update clock effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSystemTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Save changes to localStorage on any state modification
  useEffect(() => {
    localStorage.setItem('finance_ledger_v3_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('finance_ledger_v3_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('finance_ledger_v3_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('finance_ledger_v3_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('finance_ledger_v3_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('finance_ledger_v3_user');
    }
  }, [user]);

  // Push notifications helper
  const addNotification = (title: string, message: string, type: 'alert' | 'success' | 'info') => {
    const date = new Date();
    const timeString = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    const newNote: PushNotification = {
      id: Math.random().toString(36).substr(2, 9),
      title: title.toUpperCase(),
      message,
      timestamp: timeString,
      type,
      isRead: false
    };

    setNotifications(prev => [newNote, ...prev]);
    // Gently flash or sound trigger can be simulated here
  };

  const handleLogin = (newUser: MockUser) => {
    setUser(newUser);
    addNotification(
      'ACCESS AUTHENTICATED',
      `Welcome back, ${newUser.name}. Dynamic multi-channel network sync initialized successfully.`,
      'success'
    );
  };

  const handleLogout = () => {
    setUser(null);
    setShowNotifications(false);
  };

  // Toggle account synchronization link
  const onToggleSync = (accountId: string) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === accountId) {
        const nextSyncState = !acc.isSynced;
        setTimeout(() => {
          addNotification(
            nextSyncState ? 'PLAID LINK CONNECTED' : 'PLAID LINK DISCONNECTED',
            nextSyncState 
              ? `Account channel [${acc.name}] successfully plugged. Net worth registers real-time update.` 
              : `Account channel [${acc.name}] disconnected from live server feeds.`,
            nextSyncState ? 'success' : 'alert'
          );
        }, 300);
        return { ...acc, isSynced: nextSyncState };
      }
      return acc;
    }));
  };

  // Trigger automated balance refresh simulation
  const onRefreshBalances = () => {
    setAccounts(prev => prev.map(acc => {
      if (acc.isSynced) {
        // Random micro adjustment to simulate market fluctuations!
        const changePercent = (Math.random() * 2 - 1) * 0.005; // -0.5% to +0.5%
        const delta = acc.balance * changePercent;
        return {
          ...acc,
          balance: parseFloat((acc.balance + delta).toFixed(2))
        };
      }
      return acc;
    }));
    addNotification(
      'BALANCE SYNC COMPLETED',
      'Asset net-worth evaluations finished querying external bank servers.',
      'info'
    );
  };

  // Record an incoming or outgoing cashflow log
  const onAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const txId = 'tx-' + Math.random().toString(36).substr(2, 9);
    const completedTx: Transaction = {
      id: txId,
      ...newTx
    };

    // 1. Add to statement ledger
    setTransactions(prev => [completedTx, ...prev]);

    // 2. Adjust target account balance in real-time context
    setAccounts(prev => prev.map(acc => {
      if (acc.type === completedTx.accountType) {
        const factor = completedTx.type === 'income' ? 1 : -1;
        return {
          ...acc,
          balance: parseFloat((acc.balance + (completedTx.amount * factor)).toFixed(2))
        };
      }
      return acc;
    }));

    // 3. Automated warning rules regarding budget overruns
    const relatedBudget = goals.find(g => g.category.toLowerCase() === completedTx.category.toLowerCase());
    if (relatedBudget && completedTx.type === 'expense') {
      // Fetch total expense for this category including the new one
      const totalSpentForCategory = transactions
        .filter(tx => tx.category.toLowerCase() === completedTx.category.toLowerCase() && tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0) + completedTx.amount;

      const percentage = Math.round((totalSpentForCategory / relatedBudget.target) * 100);

      if (percentage >= 100) {
        addNotification(
          'CRITICAL BUDGET OVERRUN',
          `Alert! Category [${relatedBudget.title}] has surpassed established threshold limits of ₹${relatedBudget.target.toLocaleString('en-IN')}. Current spent: ₹${totalSpentForCategory.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${percentage}%).`,
          'alert'
        );
      } else if (percentage >= 80) {
        addNotification(
          'BUDGET WARNING NOTICE',
          `Caution! Category [${relatedBudget.title}] has reached ${percentage}% of established monthly targets. Remaining cap: ₹${(relatedBudget.target - totalSpentForCategory).toLocaleString('en-IN', { minimumFractionDigits: 2 })}.`,
          'alert'
        );
      } else {
        addNotification(
          'TRANSACTION LOGGED',
          `Approved debit code of ₹${completedTx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} on category ${completedTx.category}.`,
          'success'
        );
      }
    } else {
      addNotification(
        'TRANSACTION RECEIVED',
        `Deposited credit of ₹${completedTx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} to ${completedTx.accountType} feed.`,
        'success'
      );
    }
  };

  // Revert a posted ledger line
  const onDeleteTransaction = (id: string) => {
    const targetTx = transactions.find(t => t.id === id);
    if (!targetTx) return;

    // Reject transaction and restore account balance
    setAccounts(prev => prev.map(acc => {
      if (acc.type === targetTx.accountType) {
        const factor = targetTx.type === 'income' ? -1 : 1; // reverse effect
        return {
          ...acc,
          balance: parseFloat((acc.balance + (targetTx.amount * factor)).toFixed(2))
        };
      }
      return acc;
    }));

    // Remove from log
    setTransactions(prev => prev.filter(t => t.id !== id));
    addNotification(
      'TRANSACTION AUDITED',
      `Ledger item [${targetTx.description}] was purged from statement indices.`,
      'info'
    );
  };

  // Update/Edit an existing transaction log and adjust account balances
  const onEditTransaction = (updatedTx: Transaction) => {
    const oldTx = transactions.find(t => t.id === updatedTx.id);
    if (!oldTx) return;

    // 1. Revert previous transaction balance effect, and apply edited transaction balance effect
    setAccounts(prev => prev.map(acc => {
      let balance = acc.balance;
      if (acc.type === oldTx.accountType) {
        const factor = oldTx.type === 'income' ? -1 : 1;
        balance += (oldTx.amount * factor);
      }
      if (acc.type === updatedTx.accountType) {
        const factor = updatedTx.type === 'income' ? 1 : -1;
        balance += (updatedTx.amount * factor);
      }
      return {
        ...acc,
        balance: parseFloat(balance.toFixed(2))
      };
    }));

    // 2. Update the transaction ledger line
    setTransactions(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t));

    // 3. Trigger alert verification
    const relatedBudget = goals.find(g => g.category.toLowerCase() === updatedTx.category.toLowerCase());
    if (relatedBudget && updatedTx.type === 'expense') {
      const totalSpentForCategory = transactions
        .filter(t => t.id !== updatedTx.id && t.category.toLowerCase() === updatedTx.category.toLowerCase() && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0) + updatedTx.amount;

      const percentage = Math.round((totalSpentForCategory / relatedBudget.target) * 100);
      if (percentage >= 100) {
        addNotification(
          'CRITICAL BUDGET OVERRUN',
          `Alert! Category [${relatedBudget.title}] has surpassed established threshold limits of ₹${relatedBudget.target.toLocaleString('en-IN')}. Current spent: ₹${totalSpentForCategory.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${percentage}%).`,
          'alert'
        );
      }
    } else {
      addNotification(
        'TRANSACTION UPDATED',
        `Ledger item [${updatedTx.description}] was successfully updated.`,
        'success'
      );
    }
  };

  // Adjust manually deposited savings goal balances
  const onUpdateGoalDeposit = (goalId: string, amount: number) => {
    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        const nextCurrent = Math.max(0, g.current + amount);
        
        // Subtract or add deposit directly from checking/savings account
        setAccounts(accs => accs.map(acc => {
          if (acc.type === 'checking') {
            return {
              ...acc,
              balance: parseFloat((acc.balance - amount).toFixed(2))
            };
          }
          return acc;
        }));

        setTimeout(() => {
          addNotification(
            'SAVINGS VAULT ADJUSTMENT',
            `Allocated ₹${Math.abs(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })} ${amount > 0 ? 'deposited directly to' : 'withdrawn from'} [${g.title}] portfolio.`,
            'success'
          );
        }, 200);

        return {
          ...g,
          current: nextCurrent
        };
      }
      return g;
    }));
  };

  // Add custom target objective budget
  const onAddGoal = (newGoal: Omit<BudgetGoal, 'id' | 'percentage'>) => {
    const goalId = 'g-' + Math.random().toString(36).substr(2, 9);
    setGoals(prev => [
      ...prev,
      {
        id: goalId,
        percentage: 0,
        ...newGoal
      }
    ]);
    addNotification(
      'NEW GOAL CREATED',
      `Established custom tracking parameters for [${newGoal.title}] budget. Target set at ₹${newGoal.target.toLocaleString('en-IN')}.`,
      'success'
    );
  };

  // Edit/Update target goal parameters
  const onEditGoal = (updatedGoal: BudgetGoal) => {
    setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
    addNotification(
      'GOAL PARAMS MODIFIED',
      `Financial objective [${updatedGoal.title}] parameters were successfully updated in master record.`,
      'success'
    );
  };

  // Delete/Purge target goal
  const onDeleteGoal = (id: string) => {
    const targetGoal = goals.find(g => g.id === id);
    if (!targetGoal) return;
    setGoals(prev => prev.filter(g => g.id !== id));
    addNotification(
      'GOAL PURGED',
      `Financial objective [${targetGoal.title}] targets were completely archived.`,
      'info'
    );
  };

  // Clean dismiss and actions
  const onDismissNote = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const onClearAllNotes = () => {
    setNotifications([]);
  };

  const onMarkReadNote = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const onUpdateAccounts = (updatedAccounts: BankAccount[]) => {
    setAccounts(updatedAccounts);
    addNotification(
      'BALANCES SHEET COMPILATION',
      'Account sheets updated. Ledger calculations updated.',
      'info'
    );
  };

  const onStartFresh = (startingBalances: Record<string, number>) => {
    // 1. Purge transactions
    setTransactions([]);
    
    // 2. Set account starting balances based on inputs
    setAccounts([
      {
        id: 'checking',
        name: 'Checking Account',
        type: 'checking',
        balance: startingBalances.checking,
        isSynced: true,
        accountNumber: '•••• 8921'
      },
      {
        id: 'savings',
        name: 'High-Yield Savings',
        type: 'savings',
        balance: startingBalances.savings,
        isSynced: true,
        accountNumber: '•••• 4302'
      },
      {
        id: 'investments',
        name: 'Portfolio Investment Brokerage',
        type: 'investments',
        balance: startingBalances.investments,
        isSynced: true,
        accountNumber: '•••• 5591'
      },
      {
        id: 'other',
        name: 'Crypto & Alternative Assets',
        type: 'other',
        balance: startingBalances.other,
        isSynced: false,
        accountNumber: '•••• 1209'
      }
    ]);

    // 3. Reset goals to zero progress
    setGoals(prev => prev.map(g => ({
      ...g,
      current: 0,
      percentage: 0
    })));

    // 4. Alert notifications
    addNotification(
      'SYSTEM ONBOARDING SCRIPT',
      'Simulated ledger historical lines wiped. Welcome to your fresh active ledger!',
      'success'
    );
  };

  return (
    <div className="bg-[#0A0A0B] text-[#E4E3E0] min-h-screen font-sans flex flex-col antialiased relative overflow-x-hidden selection:bg-blue-600/30 selection:text-blue-200">
      
      {/* Subtle Aesthetic Soft Glow Highlights */}
      <div className="absolute top-[10%] right-[5%] w-[400px] h-[400px] rounded-full bg-blue-500/3 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[25%] left-[2%] w-[500px] h-[500px] rounded-full bg-white/1 blur-[150px] pointer-events-none"></div>

      {/* Screen container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col gap-6 relative z-10">
        
        {/* Render auth panel if logged out */}
        <AnimatePresence mode="wait">
          {!user ? (
            <motion.div
              key="auth-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="flex-1 flex items-center justify-center"
            >
              <SecureAuth onLoginSuccess={handleLogin} />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Header Interface HUD */}
              <header className="bg-[#111112] border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
                
                {/* Branding */}
                <div className="flex items-center gap-3 self-start md:self-auto">
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shadow-md">
                    <Cpu className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold tracking-tighter text-blue-500 leading-none">
                      SMART<span className="text-white">SPEND</span>
                    </h1>
                    <p className="text-[10px] uppercase tracking-widest text-white/30 flex items-center gap-1.5 mt-1 font-sans">
                      <Activity className="w-3.5 h-3.5 text-emerald-500" /> Secure Asset Management
                    </p>
                  </div>
                </div>

                {/* Center Stats */}
                <div className="hidden lg:flex gap-6 font-mono text-[11px] text-white/40">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <div>
                      <span className="block text-[9px] text-white/30 font-bold uppercase">LIVE SYNC STATUS:</span>
                      <span className="text-white/60 font-bold">ACTIVE</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <div>
                      <span className="block text-[9px] text-white/30 font-bold uppercase">SYSTEM TIME :</span>
                      <span className="text-[#3B82F6] font-bold">{systemTime || '21:36:58'} UTC</span>
                    </div>
                  </div>
                </div>

                {/* User HUD / Control Center */}
                <div className="flex items-center gap-4 self-end md:self-auto w-full md:w-auto justify-end">
                  
                  {/* Alert notification bell icon with badge */}
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-blue-500 text-white/70 hover:text-white transition-all relative cursor-pointer"
                    >
                      <Bell className="w-4.5 h-4.5" />
                      {notifications.filter(n => !n.isRead).length > 0 && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border border-[#0A0A0B] animate-ping"></span>
                      )}
                    </button>

                    {/* Popover notifications */}
                    {showNotifications && (
                      <div className="absolute right-0 mt-3 z-50 shadow-2xl min-w-[340px] sm:min-w-[400px]">
                        <NotificationPanel
                          notifications={notifications}
                          onDismiss={onDismissNote}
                          onClearAll={onClearAllNotes}
                          onMarkRead={onMarkReadNote}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pl-3 border-l border-white/10">
                    <div className="text-right">
                      <p className="text-xs font-bold text-white uppercase tracking-wide">{user.name}</p>
                      <span className="text-[9px] text-[#3B82F6] font-mono tracking-widest font-extrabold block">PREMIUM ACCESS</span>
                    </div>
                    
                    <button
                      onClick={handleLogout}
                      className="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-rose-500/10 hover:border-rose-500/40 text-rose-400 transition-all cursor-pointer"
                      title="Terminate session secure"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>

                </div>

              </header>

              {/* Modern Glassmorphic Navigation Menu Bar */}
              <nav id="smartspend-navigation-menu" className="bg-[#111112] border border-white/10 rounded-xl p-2 flex flex-wrap items-center justify-between gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                <div className="flex flex-wrap gap-1 w-full md:w-auto">
                  <button
                    onClick={() => setCurrentTab('ledger')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      currentTab === 'ledger'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" /> Ledger Lines
                  </button>

                  <button
                    onClick={() => setCurrentTab('budgets')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      currentTab === 'budgets'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Sliders className="w-4 h-4" /> Budget Targets
                  </button>

                  <button
                    onClick={() => setCurrentTab('analytics')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      currentTab === 'analytics'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Activity className="w-4 h-4" /> Visual Tracking
                  </button>

                  <button
                    onClick={() => setCurrentTab('reports')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      currentTab === 'reports'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <FileText className="w-4 h-4" /> Audit Compiler
                  </button>
                </div>

                <div className="hidden md:flex items-center gap-3 pr-2 font-mono text-[10px] text-white/30">
                  <span>SECURE CHANNEL ENCRYPTED</span>
                  <Database className="w-3.5 h-3.5 text-blue-500" />
                </div>
              </nav>

              {/* Dynamic Pages Container with AnimatePresence Page Transitions */}
              <div className="min-h-[500px]">
                <AnimatePresence mode="wait">
                  {currentTab === 'ledger' && (
                    <motion.div
                      key="ledger-page"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.25 }}
                    >
                      <TransactionLedger
                        transactions={transactions}
                        onAddTransaction={onAddTransaction}
                        onDeleteTransaction={onDeleteTransaction}
                        onEditTransaction={onEditTransaction}
                        selectedAccountType={selectedAccountFilter}
                      />
                    </motion.div>
                  )}

                  {currentTab === 'budgets' && (
                    <motion.div
                      key="budgets-page"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.25 }}
                    >
                      <FinancialObjectives
                        goals={goals}
                        transactions={transactions}
                        onAddGoal={onAddGoal}
                        onUpdateGoalDeposit={onUpdateGoalDeposit}
                        onEditGoal={onEditGoal}
                        onDeleteGoal={onDeleteGoal}
                      />
                    </motion.div>
                  )}

                  {currentTab === 'analytics' && (
                    <motion.div
                      key="analytics-page"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.25 }}
                    >
                      <InteractiveGrowthChart transactions={transactions} />
                    </motion.div>
                  )}

                  {currentTab === 'reports' && (
                    <motion.div
                      key="reports-page"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.25 }}
                    >
                      <ReportGenerator 
                        transactions={transactions}
                        accounts={accounts}
                        goals={goals}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Secure Foot signature */}
              <footer className="text-center py-6 text-white/30 text-[11px] font-mono border-t border-white/10 mt-10">
                <p>SMART SPEND CONSOLE © 2026. AES-256 END-TO-END DECRYPTED.</p>
                <div className="flex gap-4 justify-center mt-2 text-white/20">
                  <span className="hover:text-blue-400 transition-colors">SSL SECURE CONNECTION</span>
                  <span>•</span>
                  <span className="hover:text-blue-400 transition-colors">PLAID ENGINE INTEGRATED</span>
                  <span>•</span>
                  <span>HOST ID: SMARTSPEND-CLOUDRUN-PROD</span>
                </div>
              </footer>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

