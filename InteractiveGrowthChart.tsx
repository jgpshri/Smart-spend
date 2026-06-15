/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { ShieldCheck } from 'lucide-react';
import { Transaction } from '../types';

interface ExpenseVisualizerProps {
  transactions: Transaction[];
}

export const InteractiveGrowthChart: React.FC<ExpenseVisualizerProps> = ({ transactions }) => {
  const [selectedMonthStr, setSelectedMonthStr] = useState<string>('All');
  const [activeChart, setActiveChart] = useState<'trend' | 'categories'>('trend');

  // Chronologically sorted list of months in the transaction ledger
  const monthsList = useMemo(() => {
    const monthsSet = new Set<string>();
    transactions.forEach(tx => {
      if (tx.date) {
        const [year, month] = tx.date.split('-');
        if (year && month) {
          monthsSet.add(`${year}-${month}`);
        }
      }
    });
    return Array.from(monthsSet).sort();
  }, [transactions]);

  const formatMonthLabel = (yearMonthStr: string) => {
    const [year, month] = yearMonthStr.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const idx = parseInt(month, 10) - 1;
    return `${monthNames[idx]} ${year}`;
  };

  // Monthly trends (Expenses vs Income)
  const trendData = useMemo(() => {
    const agg: Record<string, { yearMonth: string, expense: number, income: number }> = {};
    
    monthsList.forEach(m => {
      agg[m] = { yearMonth: m, expense: 0, income: 0 };
    });

    transactions.forEach(tx => {
      if (tx.date) {
        const [year, month] = tx.date.split('-');
        if (year && month) {
          const ym = `${year}-${month}`;
          if (!agg[ym]) {
            agg[ym] = { yearMonth: ym, expense: 0, income: 0 };
          }
          if (tx.type === 'expense') {
            agg[ym].expense += tx.amount;
          } else {
            agg[ym].income += tx.amount;
          }
        }
      }
    });

    return Object.keys(agg).sort().map(key => ({
      rawMonth: key,
      month: formatMonthLabel(key),
      Expenses: Number(agg[key].expense.toFixed(2)),
      Income: Number(agg[key].income.toFixed(2)),
    }));
  }, [transactions, monthsList]);

  // Category distribution
  const categoryData = useMemo(() => {
    const agg: Record<string, number> = {};
    
    transactions.forEach(tx => {
      if (selectedMonthStr !== 'All') {
        const [year, month] = tx.date.split('-');
        const ym = `${year}-${month}`;
        if (ym !== selectedMonthStr) return;
      }

      if (tx.type === 'expense') {
        agg[tx.category] = (agg[tx.category] || 0) + tx.amount;
      }
    });

    const colorsMap: Record<string, string> = {
      'Food': '#10B981',         // Emerald Green
      'Transport': '#F59E0B',    // Amber / Yellow
      'Shopping': '#EF4444',     // Red
      'Utilities': '#3B82F6',    // Blue
      'Entertainment': '#EC4899', // Pink
      'Investment': '#8B5CF6',   // Purple
      'Vacation': '#06B6D4',     // Cyan
      'Monthlies': '#8B5CF6',    // Purple
      'Groceries': '#10B981',    // Emerald Green
    };

    return Object.keys(agg).map(category => ({
      category,
      Amount: Number(agg[category].toFixed(2)),
      color: colorsMap[category] || '#6B7280',
    })).sort((a, b) => b.Amount - a.Amount);
  }, [transactions, selectedMonthStr]);

  // Derived interactive statistics
  const stats = useMemo(() => {
    let totalExpense = 0;
    let totalIncome = 0;
    let count = 0;

    transactions.forEach(tx => {
      if (selectedMonthStr !== 'All') {
        const [year, month] = tx.date.split('-');
        const ym = `${year}-${month}`;
        if (ym !== selectedMonthStr) return;
      }

      if (tx.type === 'expense') {
        totalExpense += tx.amount;
        count++;
      } else {
        totalIncome += tx.amount;
      }
    });

    let maxCat = 'N/A';
    let maxCatVal = 0;
    categoryData.forEach(item => {
      if (item.Amount > maxCatVal) {
        maxCatVal = item.Amount;
        maxCat = item.category;
      }
    });

    // Approximate daily burn rate (assume 30 days)
    const activeMonths = selectedMonthStr === 'All' ? Math.max(monthsList.length, 1) : 1;
    const days = 30 * activeMonths;

    return {
      totalExpense: Number(totalExpense.toFixed(2)),
      totalIncome: Number(totalIncome.toFixed(2)),
      count,
      maxCat,
      maxCatVal: Number(maxCatVal.toFixed(2)),
      averageBurn: Number((totalExpense / days).toFixed(2))
    };
  }, [transactions, selectedMonthStr, categoryData, monthsList]);

  return (
    <div id="monthly-expense-tracker-section" className="bg-[#111112] border border-white/10 rounded-2xl p-6 relative shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <span className="text-[10px] tracking-widest text-blue-500 uppercase font-bold font-mono">FLOW VISUALIZER</span>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
            EXPENSE TRACKING & CATEGORY BURNOUT
          </h2>
          <p className="text-xs text-white/40 mt-1 font-sans">
            Real-time visual monitoring of categorised cash spending directly synced with the transaction ledger.
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {/* Active Month Dropdown Selector */}
          <select
            value={selectedMonthStr}
            onChange={(e) => setSelectedMonthStr(e.target.value)}
            className="bg-[#0A0A0B] border border-white/10 rounded-lg py-1.5 px-3 font-mono text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="All">All Registered Months</option>
            {monthsList.map(m => (
              <option key={m} value={m}>{formatMonthLabel(m)}</option>
            ))}
          </select>

          {/* Toggle buttons for chart category vs trend */}
          <div className="flex gap-1 p-1 bg-white/5 rounded-lg border border-white/10">
            <button
              onClick={() => setActiveChart('trend')}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                activeChart === 'trend'
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              Trends
            </button>
            <button
              onClick={() => setActiveChart('categories')}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                activeChart === 'categories'
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              Categories
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart View */}
        <div className="lg:col-span-8 h-80 w-full bg-[#0A0A0B]/30 border border-white/5 rounded-xl p-4">
          <ResponsiveContainer width="100%" height="100%">
            {activeChart === 'trend' ? (
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" opacity={0.6} />
                <XAxis dataKey="month" stroke="rgba(255, 255, 255, 0.3)" fontSize={11} fontStyle="mono" />
                <YAxis stroke="rgba(255, 255, 255, 0.3)" fontSize={11} fontStyle="mono" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111112', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, undefined]}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Area type="monotone" name="Income (₹)" dataKey="Income" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" name="Expenses (₹)" dataKey="Expenses" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" />
              </AreaChart>
            ) : (
              categoryData.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/30 font-mono text-xs border border-dashed border-white/10 rounded-xl">
                  No expense records analyzed in selected period.
                </div>
              ) : (
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" opacity={0.6} />
                  <XAxis dataKey="category" stroke="rgba(255, 255, 255, 0.3)" fontSize={11} fontStyle="mono" />
                  <YAxis stroke="rgba(255, 255, 255, 0.3)" fontSize={11} fontStyle="mono" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111112', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Spent']}
                  />
                  <Bar dataKey="Amount" radius={[4, 4, 0, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              )
            )}
          </ResponsiveContainer>
        </div>

        {/* Analytics Breakdown Card Panel */}
        <div className="lg:col-span-4 bg-[#0A0A0B]/40 border border-white/10 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-white/30 font-bold tracking-widest font-mono block mb-2">LEDGER METRIC ENGINE</span>
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wide">
              {selectedMonthStr === 'All' ? 'ALL-TIME FLOW' : formatMonthLabel(selectedMonthStr)} ANALYSIS
            </h4>
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="p-2.5 bg-[#0A0A0B]/60 rounded-lg border border-white/5">
                <span className="text-[8px] text-white/40 block font-mono">TOTAL SPENT</span>
                <span className="text-base font-bold text-rose-400 font-mono">₹{stats.totalExpense.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-2.5 bg-[#0A0A0B]/60 rounded-lg border border-white/5">
                <span className="text-[8px] text-white/40 block font-mono">TOTAL GAIN</span>
                <span className="text-base font-bold text-emerald-400 font-mono">₹{stats.totalIncome.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="space-y-2 mt-3.5 text-xs font-sans">
              <div className="flex justify-between items-center p-2 bg-[#0A0A0B]/60 rounded-lg border border-white/5">
                <span className="text-white/40 font-mono">Ledger debits:</span>
                <span className="text-white font-bold font-mono">{stats.count} operations</span>
              </div>
              
              <div className="flex justify-between items-center p-2 bg-[#0A0A0B]/60 rounded-lg border border-white/5">
                <span className="text-white/40 font-mono">Top Category:</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-bold font-mono">{stats.maxCat}</span>
                  {stats.maxCatVal > 0 && (
                    <span className="text-[9px] text-[#EF4444] font-bold font-mono">₹{stats.maxCatVal.toLocaleString('en-IN')}</span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center p-2 bg-[#0A0A0B]/60 rounded-lg border border-white/5">
                <span className="text-white/40 font-mono">Est. Daily Burn:</span>
                <span className="text-white font-bold font-mono">₹{stats.averageBurn.toLocaleString('en-IN')}/day</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-1 text-[10px] text-white/30 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>LEDGER SYNC ENGINE: SECURE</span>
          </div>
        </div>

      </div>

    </div>
  );
};
