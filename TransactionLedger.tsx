/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Plus, Trash2, Edit3, Calendar, DollarSign, Filter, Utensils, Car, ShoppingBag, Zap, Tv, Coins, ArrowUpRight, ArrowDownRight, Tag } from 'lucide-react';
import { Transaction } from '../types';

interface TransactionLedgerProps {
  transactions: Transaction[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  onEditTransaction?: (transaction: Transaction) => void;
  selectedAccountType: string;
}

export const TransactionLedger: React.FC<TransactionLedgerProps> = ({
  transactions,
  onAddTransaction,
  onDeleteTransaction,
  onEditTransaction,
  selectedAccountType
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Recent' | 'Income' | 'Expense'>('All');
  
  // States for adding a transaction
  const [showAddForm, setShowAddForm] = useState(false);
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [accountType, setAccountType] = useState<'checking' | 'savings' | 'investments' | 'other'>('checking');

  // States for editing a transaction
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState('Food');
  const [editDescription, setEditDescription] = useState('');
  const [editDate, setEditDate] = useState(new Date().toISOString().substring(0, 10));
  const [editAmount, setEditAmount] = useState('');
  const [editType, setEditType] = useState<'income' | 'expense'>('expense');
  const [editAccountType, setEditAccountType] = useState<'checking' | 'savings' | 'investments' | 'other'>('checking');

  const handleStartEdit = (tx: Transaction) => {
    setEditingTxId(tx.id);
    setEditCategory(tx.category);
    setEditDescription(tx.description);
    setEditDate(tx.date);
    setEditAmount(tx.amount.toString());
    setEditType(tx.type);
    setEditAccountType(tx.accountType);
  };

  const handleSaveEdit = (id: string) => {
    if (!editDescription || !editAmount || isNaN(Number(editAmount)) || Number(editAmount) <= 0) {
      alert("Please specify a valid description and positive numerical amount.");
      return;
    }

    if (onEditTransaction) {
      onEditTransaction({
        id,
        category: editCategory,
        description: editDescription,
        date: editDate,
        amount: Number(editAmount),
        type: editType,
        accountType: editAccountType
      });
    }
    setEditingTxId(null);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'food':
        return <Utensils className="w-4 h-4 text-amber-400" />;
      case 'transport':
        return <Car className="w-4 h-4 text-cyan-400" />;
      case 'shopping':
        return <ShoppingBag className="w-4 h-4 text-pink-400" />;
      case 'utilities':
        return <Zap className="w-4 h-4 text-rose-400" />;
      case 'entertainment':
        return <Tv className="w-4 h-4 text-purple-400" />;
      case 'salary':
      case 'investment yield':
        return <Coins className="w-4 h-4 text-emerald-400" />;
      default:
        return <Tag className="w-4 h-4 text-slate-400" />;
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'food': return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      case 'transport': return 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400';
      case 'shopping': return 'bg-pink-500/10 border-pink-500/30 text-pink-400';
      case 'utilities': return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
      case 'entertainment': return 'bg-purple-500/10 border-purple-500/30 text-purple-400';
      case 'salary': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      default: return 'bg-slate-500/10 border-slate-500/30 text-slate-400';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      alert("Please specify a valid description and positive numerical amount.");
      return;
    }

    onAddTransaction({
      category,
      description,
      date,
      amount: Number(amount),
      type,
      accountType
    });

    // Reset Form
    setDescription('');
    setAmount('');
    setShowAddForm(false);
  };

  // 1. Filter by selected account channel first if any
  let filtered = transactions;
  if (selectedAccountType !== 'all') {
    filtered = filtered.filter(tx => tx.accountType === selectedAccountType);
  }

  // 2. Filter by search term (categories, description, amount)
  if (searchTerm.trim() !== '') {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(tx => 
      tx.category.toLowerCase().includes(term) ||
      tx.description.toLowerCase().includes(term) ||
      tx.amount.toString().includes(term)
    );
  }

  // 3. Filter by Tab selection
  if (activeTab === 'Recent') {
    // Show only transactions in the last month or last 3 items
    filtered = [...filtered].sort((a,b) => b.date.localeCompare(a.date)).slice(0, 3);
  } else if (activeTab === 'Income') {
    filtered = filtered.filter(tx => tx.type === 'income');
  } else if (activeTab === 'Expense') {
    filtered = filtered.filter(tx => tx.type === 'expense');
  }

  // Double check list ordering: default latest first for standard logs view
  const displayList = activeTab === 'Recent' ? filtered : [...filtered].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="bg-[#111112] border border-white/10 rounded-2xl p-6 relative shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      
      {/* Top section */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] tracking-widest text-blue-500 uppercase font-bold font-mono">FLOW ANALYSIS</span>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">TRANSACTION LEDGER</h2>
          <p className="text-xs text-white/40 mt-1 font-sans">
            Monitor, categorize, and audit your cash flow with precision.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold font-sans tracking-wide transition-all cursor-pointer shadow-md"
        >
          <Plus className="w-4.5 h-4.5" /> ADD ENTRY
        </button>
      </div>

      {/* Add Dialog Form (Inline Overlay/Drawer Style for responsive safety) */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-5 p-4 rounded-xl bg-[#0A0A0B] border border-white/10 text-xs space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center pb-2 border-b border-white/10">
            <span className="font-bold text-white font-mono tracking-wider uppercase">NEW CASH TRANSACTION RECORD</span>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-white/40 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-white/40 font-bold mb-1 uppercase font-mono">FLOW DIRECTION</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`flex-1 py-1.5 rounded-md font-mono font-bold border transition-all cursor-pointer ${
                    type === 'expense' 
                      ? 'bg-rose-500/20 border-rose-400 text-rose-300' 
                      : 'bg-[#111112] border-white/10 text-white/40'
                  }`}
                >
                  DEBIT (-)
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`flex-1 py-1.5 rounded-md font-mono font-bold border transition-all cursor-pointer ${
                    type === 'income' 
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' 
                      : 'bg-[#111112] border-white/10 text-white/40'
                  }`}
                >
                  CREDIT (+)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-white/40 font-bold mb-1 uppercase font-mono">SINKING ACCOUNT</label>
              <select
                value={accountType}
                onChange={(e: any) => setAccountType(e.target.value)}
                className="w-full bg-[#111112] border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-blue-500 font-mono"
              >
                <option value="checking">Checking Account</option>
                <option value="savings">Savings Vault</option>
                <option value="investments">Investments Brokerage</option>
                <option value="other">Alternative Assets</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-white/40 font-bold mb-1 uppercase font-mono">CATEGORY NAME</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#111112] border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-blue-500 font-mono"
              >
                <option value="Food">Food / Groceries</option>
                <option value="Transport">Transport / Commute</option>
                <option value="Shopping">Shopping / Lifestyle</option>
                <option value="Utilities">Utilities / Bills</option>
                <option value="Entertainment">Entertainment / VR</option>
                <option value="Salary">Salary Earnings</option>
                <option value="Monthlies">Monthlies</option>
                <option value="Vacation">Vacation Savings</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-white/40 font-bold mb-1 uppercase font-mono">QUANTITY AMOUNT (₹)</label>
              <div className="relative font-mono">
                <span className="absolute left-3 top-2.5 text-white/40 font-sans font-bold">₹</span>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#111112] border border-white/10 rounded-lg py-2 pl-7 pr-3 text-white focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-white/40 font-bold mb-1 uppercase font-mono">DESCRIPTION CERT</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#111112] border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-blue-500 font-mono"
                placeholder="Fresh Organics Store, flight ticket..."
                required
              />
            </div>

            <div>
              <label className="block text-[10px] text-white/40 font-bold mb-1 uppercase font-mono">COMMITTED TIMESTAMP</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#111112] border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-blue-500 font-mono"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer"
          >
            WRITE TO DIGITAL TRANSACTION LEDGER
          </button>
        </form>
      )}

      {/* Tabs And Search Section */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-4">
        {/* Navigation Tabs */}
        <div className="flex gap-1 p-1 bg-white/5 rounded-lg border border-white/10 h-10 w-full sm:w-auto">
          {(['All', 'Recent', 'Income', 'Expense'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 sm:flex-initial px-4.5 rounded-lg text-xs font-bold font-mono tracking-wide transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Input Box */}
        <div className="relative w-full sm:max-w-xs h-10">
          <Search className="absolute left-3.5 top-3 text-white/30 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-full bg-[#0A0A0B] border border-white/10 rounded-lg pl-10 pr-4 text-xs text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition-colors font-mono"
            placeholder="Search cash logs..."
          />
        </div>
      </div>

      {/* Transactions list */}
      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
        {displayList.length === 0 ? (
          <div className="text-center py-12 text-white/30 font-mono text-xs border border-dashed border-white/10 rounded-xl">
            No transaction records match the filter keys.
          </div>
        ) : (
          displayList.map((tx) => {
            const isIncome = tx.type === 'income';

            if (editingTxId === tx.id) {
              return (
                <div key={tx.id} className="p-4 rounded-xl bg-[#0A0A0B] border border-blue-500/50 space-y-3 animate-fadeIn">
                  <div className="flex justify-between items-center pb-1.5 border-b border-white/5">
                    <span className="font-mono text-[9px] text-blue-400 font-bold uppercase tracking-wider">EDITING LEDGER LINE: {tx.description}</span>
                    <button 
                      type="button" 
                      onClick={() => setEditingTxId(null)}
                      className="text-white/40 hover:text-white text-[10px] uppercase font-mono"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="block text-[8px] text-white/30 font-mono font-bold mb-0.5">DESCRIPTION</label>
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full bg-[#111112] border border-white/10 rounded px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[8px] text-white/30 font-mono font-bold mb-0.5">AMOUNT (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        className="w-full bg-[#111112] border border-white/10 rounded px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[8px] text-white/30 font-mono font-bold mb-0.5">TIMESTAMP</label>
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="w-full bg-[#111112] border border-white/10 rounded px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="block text-[8px] text-white/30 font-mono font-bold mb-0.5">CATEGORY</label>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full bg-[#111112] border border-white/10 rounded px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                      >
                        <option value="Food">Food / Groceries</option>
                        <option value="Transport">Transport / Commute</option>
                        <option value="Shopping">Shopping / Lifestyle</option>
                        <option value="Utilities">Utilities / Bills</option>
                        <option value="Entertainment">Entertainment / VR</option>
                        <option value="Salary">Salary Earnings</option>
                        <option value="Monthlies">Monthlies</option>
                        <option value="Vacation">Vacation Savings</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[8px] text-white/30 font-mono font-bold mb-0.5">FLOW DIRECTION</label>
                      <select
                        value={editType}
                        onChange={(e: any) => setEditType(e.target.value)}
                        className="w-full bg-[#111112] border border-white/10 rounded px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                      >
                        <option value="expense">DEBIT (-)</option>
                        <option value="income">CREDIT (+)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[8px] text-white/30 font-mono font-bold mb-0.5">ACCOUNT FEED</label>
                      <select
                        value={editAccountType}
                        onChange={(e: any) => setEditAccountType(e.target.value)}
                        className="w-full bg-[#111112] border border-white/10 rounded px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                      >
                        <option value="checking">Checking Account</option>
                        <option value="savings">Savings Vault</option>
                        <option value="investments">Investments Brokerage</option>
                        <option value="other">Alternative Assets</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-1.5 justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setEditingTxId(null)}
                      className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-white/60 hover:text-white font-mono text-[9px] font-bold uppercase cursor-pointer"
                    >
                      Bypass
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(tx.id)}
                      className="px-3.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-mono text-[9px] font-bold uppercase cursor-pointer"
                    >
                      Commit
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={tx.id}
                className="flex justify-between items-center p-3.5 rounded-xl bg-[#0A0A0B]/40 border border-white/5 hover:border-white/10 transition-all duration-300 relative group"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-3 rounded-xl border flex items-center justify-center relative ${getCategoryColor(tx.category)}`}>
                    {getCategoryIcon(tx.category)}
                    {/* Tiny account type indicator */}
                    <span className="absolute -bottom-1 -right-1 bg-[#111112] text-[8px] border border-white/10 px-1 rounded font-mono font-bold text-white/50 uppercase">
                      {tx.accountType.substring(0,4)}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide">{tx.description}</h4>
                    <p className="text-[10px] text-white/40 mt-0.5 flex items-center gap-1.5 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-white/20" />
                      {tx.date.replace(/-/g, '/')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right mr-2">
                    <p className={`text-xs font-bold font-mono tracking-tight flex items-center justify-end gap-1 ${
                      isIncome ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {isIncome ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {isIncome ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                    <span className="text-[9px] font-mono font-extrabold bg-[#111112] border border-white/10 px-2 py-0.5 rounded-full text-white/50">
                      {tx.category.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => handleStartEdit(tx)}
                      className="p-1.5 rounded-lg bg-[#111112] border border-white/10 text-white/40 hover:text-blue-400 hover:border-blue-400/50 cursor-pointer"
                      title="Edit ledger line"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteTransaction(tx.id)}
                      className="p-1.5 rounded-lg bg-[#111112] border border-white/10 text-white/40 hover:text-rose-400 hover:border-rose-400/50 cursor-pointer"
                      title="Audit purge"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
