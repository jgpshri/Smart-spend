/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Target, Plus, TrendingUp, AlertCircle, ShoppingCart, Zap, MessageSquare, Flame, Laptop, Pencil, Trash2 } from 'lucide-react';
import { BudgetGoal, Transaction } from '../types';

interface FinancialObjectivesProps {
  goals: BudgetGoal[];
  transactions: Transaction[];
  onAddGoal: (goal: Omit<BudgetGoal, 'id' | 'percentage'>) => void;
  onUpdateGoalDeposit: (goalId: string, amount: number) => void;
  onEditGoal?: (goal: BudgetGoal) => void;
  onDeleteGoal?: (id: string) => void;
}

export const FinancialObjectives: React.FC<FinancialObjectivesProps> = ({
  goals,
  transactions,
  onAddGoal,
  onUpdateGoalDeposit,
  onEditGoal,
  onDeleteGoal
}) => {
  const [showAddGoalForm, setShowAddGoalForm] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalCategory, setGoalCategory] = useState('Groceries');
  const [goalTarget, setGoalTarget] = useState('');
  const [isSavingsFund, setIsSavingsFund] = useState(false);

  // Deposit/Withdrawal simulation states for designated saving portfolios (e.g. Vacation Fund)
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedGoalForDeposit, setSelectedGoalForDeposit] = useState<string | null>(null);

  // States for editing a financial goal
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editGoalTitle, setEditGoalTitle] = useState('');
  const [editGoalTarget, setEditGoalTarget] = useState('');
  const [editGoalCategory, setEditGoalCategory] = useState('');

  const handleStartEditGoal = (goal: BudgetGoal) => {
    setEditingGoalId(goal.id);
    setEditGoalTitle(goal.title);
    setEditGoalTarget(goal.target.toString());
    setEditGoalCategory(goal.category);
  };

  const handleSaveGoalEdit = (id: string) => {
    if (!editGoalTitle || !editGoalTarget || isNaN(Number(editGoalTarget)) || Number(editGoalTarget) <= 0) {
      alert("Please specify a valid title and positive target amount.");
      return;
    }

    if (onEditGoal) {
      const match = goals.find(g => g.id === id);
      onEditGoal({
        id,
        title: editGoalTitle.toUpperCase(),
        target: Number(editGoalTarget),
        category: editGoalCategory,
        current: match ? match.current : 0,
        color: match ? match.color : '#3B82F6',
        percentage: match ? match.percentage : 0
      });
    }
    setEditingGoalId(null);
  };

  // Automatically map and compute progress representing real spending depletions or savings additions
  const computedGoals = goals.map(goal => {
    let current = goal.current;
    
    // If it's a category budget, dynamically derive current from relevant transaction logs
    if (!isGoalASavingsVault(goal.category)) {
      const totalSpentForCategory = transactions
        .filter(tx => tx.category.toLowerCase() === goal.category.toLowerCase() && tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0);
      current = totalSpentForCategory;
    }

    const percentage = Math.min(100, Math.round((current / goal.target) * 100));

    return {
      ...goal,
      current,
      percentage
    };
  });

  // Simple identifier to check if category is manually managed savings
  function isGoalASavingsVault(cat: string) {
    return ['vacation', 'savings', 'portfolio', 'investment', 'crypto'].includes(cat.toLowerCase());
  }

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle || !goalTarget || isNaN(Number(goalTarget)) || Number(goalTarget) <= 0) {
      alert("Please provide the Goal title and positive numeric Target goals.");
      return;
    }

    const colorsList = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6'];
    const randomColor = colorsList[goals.length % colorsList.length];

    onAddGoal({
      title: goalTitle.toUpperCase(),
      category: isSavingsFund ? 'Savings' : goalCategory,
      target: Number(goalTarget),
      current: isSavingsFund ? 0 : 0,
      color: randomColor
    });

    setGoalTitle('');
    setGoalTarget('');
    setShowAddGoalForm(false);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalForDeposit || !depositAmount || isNaN(Number(depositAmount))) return;
    
    onUpdateGoalDeposit(selectedGoalForDeposit, Number(depositAmount));
    setDepositAmount('');
    setSelectedGoalForDeposit(null);
  };

  // Find the primary featured goal (for matching Vacation Fund at 75% in the tablet UI)
  const primaryGoal = computedGoals.find(g => g.title === 'VACATION FUND') || computedGoals[0];
  const secondaryGoals = computedGoals.filter(g => g.id !== (primaryGoal ? primaryGoal.id : ''));

  return (
    <div className="bg-[#111112] border border-white/10 rounded-2xl p-6 relative shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      
      {/* Top Title Bar */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] tracking-widest text-blue-500 uppercase font-bold font-mono">GOALS/BUDGET</span>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">FINANCIAL OBJECTIVES</h2>
          <p className="text-xs text-white/40 mt-1 font-sans">
            Track your allocated capital against established monthly targets.
          </p>
        </div>
        <button
          onClick={() => setShowAddGoalForm(!showAddGoalForm)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold font-sans tracking-wide transition-all cursor-pointer shadow-md"
        >
          <Plus className="w-4.5 h-4.5" /> ADD NEW GOAL
        </button>
      </div>

      {/* Inline Goal Form */}
      {showAddGoalForm && (
        <form onSubmit={handleCreateGoal} className="mb-5 p-4 rounded-xl bg-[#0A0A0B] border border-white/10 text-xs space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center pb-2 border-b border-white/10">
            <span className="font-bold text-white font-mono tracking-wider uppercase">CREATE TARGET GOAL CHANNEL</span>
            <button
              type="button"
              onClick={() => setShowAddGoalForm(false)}
              className="text-white/40 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-white/40 font-bold mb-1 uppercase font-mono">GOAL TITLE (E.G. NEW LAPTOP)</label>
              <input
                type="text"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                className="w-full bg-[#111112] border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-blue-500 font-mono"
                placeholder="Laptop fund, New Tesla, Skiing trip..."
                required
              />
            </div>

            <div>
              <label className="block text-[10px] text-white/40 font-bold mb-1 uppercase font-mono">BUDGET GOAL TARGET VALUE (₹)</label>
              <input
                type="number"
                value={goalTarget}
                onChange={(e) => setGoalTarget(e.target.value)}
                className="w-full bg-[#111112] border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-blue-500 font-mono"
                placeholder="1000"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[10px] text-white/40 font-bold uppercase font-mono">GOAL CHANNEL STRATEGY</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-white/70 font-mono cursor-pointer">
                <input
                  type="radio"
                  checked={!isSavingsFund}
                  onChange={() => setIsSavingsFund(false)}
                  className="accent-blue-500"
                />
                Track Monthly Spend Category Spending Limits
              </label>
              <label className="flex items-center gap-2 text-white/70 font-mono cursor-pointer">
                <input
                  type="radio"
                  checked={isSavingsFund}
                  onChange={() => setIsSavingsFund(true)}
                  className="accent-blue-500"
                />
                Dedicated Saving Nest/Vault Deposit Fund
              </label>
            </div>
          </div>

          {!isSavingsFund && (
            <div>
              <label className="block text-[10px] text-white/40 font-bold mb-1 uppercase font-mono">LINKED EXPENSE CATEGORY</label>
              <select
                value={goalCategory}
                onChange={(e) => setGoalCategory(e.target.value)}
                className="w-full bg-[#111112] border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-blue-500 font-mono"
              >
                <option value="Food">Food / Groceries</option>
                <option value="Transport">Transport / Commining</option>
                <option value="Shopping">Shopping / Bags</option>
                <option value="Utilities">Utilities / Grid</option>
                <option value="Entertainment">Entertainment / VR</option>
                <option value="Monthlies">Monthlies</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer"
          >
            INITIALIZE SAVINGS OBJECTIVE
          </button>
        </form>
      )}

      {/* Manual Vault Deposit Form */}
      {selectedGoalForDeposit && (
        <form onSubmit={handleDepositSubmit} className="mb-5 p-4 rounded-xl bg-[#0A0A0B] border border-white/10 text-xs space-y-3 animate-fadeIn">
          <div className="flex justify-between items-center pb-2 border-b border-white/10">
            <span className="font-bold text-white font-mono uppercase">Vault Deposit Transaction</span>
            <button type="button" onClick={() => setSelectedGoalForDeposit(null)} className="text-white/40">Cancel</button>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="flex-1 bg-[#111112] border border-white/10 rounded-lg py-2 px-3 text-white font-mono focus:outline-none focus:border-blue-500"
              placeholder="Amount to deposit (+) or withdraw (-)"
              required
            />
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold font-mono rounded-lg transition-colors cursor-pointer">
              Submit
            </button>
          </div>
        </form>
      )}

      {/* Edit Goal Parameters Form */}
      {editingGoalId && (
        <form onSubmit={(e) => { e.preventDefault(); handleSaveGoalEdit(editingGoalId); }} className="mb-5 p-4 rounded-xl bg-[#0A0A0B] border border-blue-500/50 text-xs space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center pb-2 border-b border-white/10">
            <span className="font-bold text-blue-400 font-mono tracking-wider uppercase">EDIT ESTABLISHED TARGET / BUDGET</span>
            <button
              type="button"
              onClick={() => setEditingGoalId(null)}
              className="text-white/40 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-white/40 font-bold mb-1 uppercase font-mono">GOAL TITLE</label>
              <input
                type="text"
                value={editGoalTitle}
                onChange={(e) => setEditGoalTitle(e.target.value)}
                className="w-full bg-[#111112] border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-blue-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] text-white/40 font-bold mb-1 uppercase font-mono">TARGET VALUE (₹)</label>
              <input
                type="number"
                value={editGoalTarget}
                onChange={(e) => setEditGoalTarget(e.target.value)}
                className="w-full bg-[#111112] border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-blue-500 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-white/40 font-bold mb-1 uppercase font-mono">LINKED CATEGORY</label>
            <select
              value={editGoalCategory}
              onChange={(e) => setEditGoalCategory(e.target.value)}
              className="w-full bg-[#111112] border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-blue-500 font-mono"
            >
              <option value="Savings">Savings Nest/Vault</option>
              <option value="Food">Food / Groceries</option>
              <option value="Transport">Transport / Commuting</option>
              <option value="Shopping">Shopping / Bags</option>
              <option value="Utilities">Utilities / Grid</option>
              <option value="Entertainment">Entertainment / VR</option>
              <option value="Monthlies">Monthlies</option>
            </select>
          </div>

          <div className="flex gap-2">
            {onDeleteGoal && (
              <button
                type="button"
                onClick={() => {
                  if (confirm("Are you sure you want to completely archive this budget/objective?")) {
                    onDeleteGoal(editingGoalId);
                    setEditingGoalId(null);
                  }
                }}
                className="px-4 py-3 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white font-bold font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer"
              >
                Archive Objective
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center"
            >
              Save Parameters
            </button>
          </div>
        </form>
      )}

      {/* Goals Display Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Left Featured Circle (Vacation Fund style) */}
        {primaryGoal && (
          <div className="md:col-span-5 flex flex-col items-center justify-center p-5 rounded-xl bg-[#0A0A0B] border border-white/10 shadow-md relative group">
            
            <div className="absolute top-2.5 right-2.5 flex gap-1 items-center opacity-0 group-hover:opacity-100 transition-all">
              <button
                type="button"
                onClick={() => handleStartEditGoal(primaryGoal)}
                className="p-1 rounded bg-[#111112] border border-white/10 text-white/55 hover:text-blue-400 cursor-pointer"
                title="Edit goal parameters"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="relative w-36 h-36">
              {/* Radial background circle */}
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke={primaryGoal.color}
                  strokeWidth="8"
                  strokeDasharray={`${2.512 * primaryGoal.percentage} ${251.2 - 2.512 * primaryGoal.percentage}`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  className="transition-all duration-1000 rotate-[-90deg] origin-[50px_50px]"
                />
              </svg>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-white/30 font-mono uppercase tracking-widest block">PROGRESS</span>
                <span className="text-3xl font-extrabold text-white font-mono">{primaryGoal.percentage}%</span>
              </div>
            </div>

            <div className="text-center mt-3">
              <h3 className="text-xs font-extrabold text-blue-500 tracking-wider uppercase font-mono">{primaryGoal.title}</h3>
              <p className="text-xs text-white/40 mt-1 font-mono">
                ₹{primaryGoal.current.toLocaleString('en-IN')}/ ₹{primaryGoal.target.toLocaleString('en-IN')} <span className="text-xs font-bold text-white/30">({primaryGoal.percentage}%)</span>
              </p>
              
              {isGoalASavingsVault(primaryGoal.category) && (
                <button
                  type="button"
                  onClick={() => setSelectedGoalForDeposit(primaryGoal.id)}
                  className="mt-2 text-[10px] uppercase tracking-wider font-mono px-3 py-1 bg-white/5 border border-white/10 hover:border-blue-500 text-white/70 hover:text-white rounded-lg transition-all cursor-pointer"
                >
                  Adjust Vault Balance
                </button>
              )}
            </div>
          </div>
        )}

        {/* Right Sibling Progress Circles */}
        <div className="md:col-span-7 grid grid-cols-2 gap-4">
          {secondaryGoals.map((g) => (
            <div key={g.id} className="p-3.5 rounded-xl bg-[#0A0A0B] border border-white/10 flex flex-col items-center relative group shadow-sm">
              <div className="absolute top-2 right-2 flex gap-1 items-center opacity-0 group-hover:opacity-100 transition-all">
                <button
                  type="button"
                  onClick={() => handleStartEditGoal(g)}
                  className="p-1 rounded bg-[#111112] border border-white/10 text-white/55 hover:text-blue-400 cursor-pointer"
                  title="Edit parameters"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="relative w-16 h-16">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="transparent"
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="transparent"
                    stroke={g.color}
                    strokeWidth="10"
                    strokeDasharray={`${2.63 * g.percentage} ${263 - 2.63 * g.percentage}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 rotate-[-90deg] origin-[50px_50px]"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-mono text-[11px] font-bold text-white">
                  {g.percentage}%
                </div>
              </div>

              <div className="text-center mt-2">
                <p className="text-[10px] font-bold text-white uppercase tracking-wider font-mono truncate max-w-[100px]" title={g.title}>
                  {g.title}
                </p>
                <p className="text-[9px] text-white/40 font-mono mt-0.5">
                  ₹{g.current.toLocaleString('en-IN', { maximumFractionDigits: 0 })} / ₹{g.target.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>

                {isGoalASavingsVault(g.category) ? (
                  <button
                    type="button"
                    onClick={() => setSelectedGoalForDeposit(g.id)}
                    className="mt-1.5 text-[8px] uppercase tracking-wider font-mono px-2 py-0.5 bg-white/5 border border-white/10 hover:border-blue-500 text-white/70 hover:text-white rounded transition-all cursor-pointer"
                  >
                    Manage Vault
                  </button>
                ) : (
                  <span className="text-[8px] text-white/20 font-mono uppercase mt-1 block tracking-tight">
                    DEBIT MONITOR
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>

      <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-1.5 text-[10px] font-mono text-white/30">
        <AlertCircle className="w-4.5 h-4.5 text-blue-500 animate-pulse flex-shrink-0" />
        <span>BUDGET ALERTS ARE DELIVERED AUTOMATICALLY WHEN AN EXPENSE SURPASSES THE WARNING MARGIN.</span>
      </div>

    </div>
  );
};
