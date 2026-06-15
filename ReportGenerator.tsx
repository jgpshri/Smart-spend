/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FileText, Download, CheckSquare, Printer, Award, FileSpreadsheet, Eye, HelpCircle } from 'lucide-react';
import { Transaction, BankAccount, BudgetGoal } from '../types';

interface ReportGeneratorProps {
  transactions: Transaction[];
  accounts: BankAccount[];
  goals: BudgetGoal[];
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  transactions,
  accounts,
  goals
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any | null>(null);
  const [selectedMonth, setSelectedMonth] = useState('June 2024');

  const generateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      // Calculate real statistical aggregations
      const incomeList = transactions.filter(t => t.type === 'income');
      const expenseList = transactions.filter(t => t.type === 'expense');

      const totalGain = incomeList.reduce((sum, t) => sum + t.amount, 0);
      const totalLoss = expenseList.reduce((sum, t) => sum + t.amount, 0);
      const netYield = totalGain - totalLoss;

      const savingsRate = totalGain > 0 ? Math.max(0, Math.round(((totalGain - totalLoss) / totalGain) * 100)) : 0;

      // Group budget allocations overshoots
      const alerts: string[] = [];
      goals.forEach(goal => {
        // Compute spending for this goal's category
        const spent = expenseList
          .filter(t => t.category.toLowerCase() === goal.category.toLowerCase())
          .reduce((sum, t) => sum + t.amount, 0);

        if (spent > goal.target) {
          alerts.push(`Category UNLEASHED: ${goal.title} has overshot limit by ₹${(spent - goal.target).toLocaleString('en-IN', { minimumFractionDigits: 2 })}.`);
        } else if (spent > goal.target * 0.8) {
          alerts.push(`Category WARNING: ${goal.title} is at ${Math.round((spent/goal.target)*100)}% of monthly target.`);
        }
      });

      if (alerts.length === 0) {
        alerts.push("All monthly expense items are within authorized ranges.");
      }

      setGeneratedReport({
        timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
        totalGain,
        totalLoss,
        netYield,
        savingsRate,
        alerts,
        advisorAdvice: savingsRate > 20 
          ? "Excellent capital accumulation rate! Your savings velocity represents optimal asset configuration. Consider allocating surplus credit directly to your Investment Brokerage feed to maximize interest yield."
          : "Capital accumulation velocity is lower than recommended. We advise checking the transaction ledger to prune unnecessary Shopping or Entertainment subscriptions and restore savings ratios."
      });
      setIsGenerating(false);
    }, 1200);
  };

  const printDocument = () => {
    window.print();
  };

  const downloadFile = (content: string, filename: string, contentType: string) => {
    try {
      const blob = new Blob([content], { type: contentType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.id = `download-trigger-${Date.now()}`;
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('File download failed', e);
    }
  };

  const exportToJson = () => {
    const data = {
      auditTitle: `CYBER AUDIT REPORT - ${selectedMonth}`,
      completedAt: generatedReport ? generatedReport.timestamp : new Date().toLocaleString(),
      summaryStats: {
        totalGain: generatedReport ? generatedReport.totalGain : 0,
        totalLoss: generatedReport ? generatedReport.totalLoss : 0,
        netYield: generatedReport ? (generatedReport.totalGain - generatedReport.totalLoss) : 0,
        savingsRate: generatedReport ? generatedReport.savingsRate : 0,
      },
      advisorAdvice: generatedReport ? generatedReport.advisorAdvice : "",
      alertsLog: generatedReport ? generatedReport.alerts : [],
      accountsSheet: accounts,
      budgetGoals: goals,
      transactionLedger: transactions,
    };
    const jsonStr = JSON.stringify(data, null, 2);
    downloadFile(jsonStr, `cyber_audit_report_${selectedMonth.replace(/\s+/g, '_')}.json`, 'application/json');
  };

  const exportToCsv = () => {
    let csv = '';
    
    // Summary metrics section
    csv += `"CYBER FINANCIAL REPORT","${selectedMonth}"\n`;
    csv += `"Completed On","${generatedReport ? generatedReport.timestamp : new Date().toLocaleString()}"\n`;
    csv += `"Credit Earnings (₹)","${generatedReport ? generatedReport.totalGain : 0}"\n`;
    csv += `"Debit Outburst (₹)","${generatedReport ? generatedReport.totalLoss : 0}"\n`;
    csv += `"Net periodic Yield (₹)","${generatedReport ? (generatedReport.totalGain - generatedReport.totalLoss) : 0}"\n`;
    csv += `"Savings Velocity Ratio","${generatedReport ? generatedReport.savingsRate : 0}%"\n\n`;
    
    // Accounts block
    csv += `"ASSETS ACCOUNTS BALANCES SHEET"\n`;
    csv += `"Account Name","Account Number","Type","Balance (₹)"\n`;
    accounts.forEach(acc => {
      csv += `"${acc.name}","${acc.accountNumber}","${acc.type}","${acc.balance}"\n`;
    });
    csv += `\n`;

    // Goals/Budgets block
    csv += `"BUDGETS TARGET TRACKING"\n`;
    csv += `"Title","Category","Target (₹)","Saved/Allocated (₹)","Status %"\n`;
    goals.forEach(g => {
      csv += `"${g.title}","${g.category}","${g.target}","${g.current}","${g.percentage}"\n`;
    });
    csv += `\n`;

    // Ledger block
    csv += `"TRANSACTIONS LEDGER RECORD"\n`;
    csv += `"ID","Date","Category","Description","Type","Amount (₹)","Account Type"\n`;
    if (transactions.length === 0) {
      csv += `"No transactions available under current index"\n`;
    } else {
      transactions.forEach(tx => {
        csv += `"${tx.id}","${tx.date}","${tx.category}","${tx.description.replace(/"/g, '""')}","${tx.type}","${tx.amount}","${tx.accountType}"\n`;
      });
    }
    
    downloadFile(csv, `cyber_financial_ledger_${selectedMonth.replace(/\s+/g, '_')}.csv`, 'text/csv;charset=utf-8;');
  };

  const exportToTxtReport = () => {
    let report = `====================================================================\n`;
    report += `                 CYBERNETIC FINANCIAL AUDIT STATEMENT\n`;
    report += `====================================================================\n`;
    report += `PERIOD OF ANALYSIS    : ${selectedMonth.toUpperCase()}\n`;
    report += `METRICS COMPILED ON   : ${generatedReport ? generatedReport.timestamp : new Date().toLocaleString()}\n`;
    report += `SYSTEM ENCRYPTION KEY : SHA-256 SUM-32\n`;
    report += `====================================================================\n\n`;
    
    report += `1. KEY STATISTICAL INDICATORS:\n`;
    report += `--------------------------------------------------------------------\n`;
    report += `  - CREDIT EARNINGS (INCOME)    : ₹${(generatedReport ? generatedReport.totalGain : 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n`;
    report += `  - DEBIT OUTBURST (EXPENSES)  : ₹${(generatedReport ? generatedReport.totalLoss : 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n`;
    report += `  - NET PERIODIC YIELD (BAL)    : ₹${(generatedReport ? (generatedReport.totalGain - generatedReport.totalLoss) : 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n`;
    report += `  - INCOME SAVINGS VELOCITY RATIO: ${(generatedReport ? generatedReport.savingsRate : 0)}%\n\n`;
    
    report += `2. SYSTEM ADVISORY AUDIT RECOMMENDATION:\n`;
    report += `--------------------------------------------------------------------\n`;
    report += `  ${generatedReport ? generatedReport.advisorAdvice : ''}\n\n`;
    
    report += `3. ACTIVE BUDGET ALERTS & LOG:\n`;
    report += `--------------------------------------------------------------------\n`;
    if (generatedReport && generatedReport.alerts && generatedReport.alerts.length > 0) {
      generatedReport.alerts.forEach((alert: string) => {
        report += `  [!] ${alert}\n`;
      });
    } else {
      report += `  No major diagnostic anomalies registered.\n`;
    }
    report += `\n`;
    
    report += `4. LIQUID ASSETS RECORD:\n`;
    report += `--------------------------------------------------------------------\n`;
    accounts.forEach(acc => {
      report += `  * ${acc.name.padEnd(35)} [${acc.accountNumber}] - Balance: ₹${acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${acc.type.toUpperCase()})\n`;
    });
    report += `\n`;
    
    report += `5. RECENT TRANSACTION CHRONICLE:\n`;
    report += `--------------------------------------------------------------------\n`;
    if (transactions.length === 0) {
      report += `  No transaction lines registered under current ledger index.\n`;
    } else {
      transactions.forEach((tx, idx) => {
        report += `  [${idx+1}] ${tx.date} | ${tx.type.toUpperCase().padEnd(7)} | ${tx.category.padEnd(14)} | ${tx.description.padEnd(35)} | ${tx.type === 'income' ? '+' : '-'}₹${tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n`;
      });
    }
    report += `\n`;
    report += `====================================================================\n`;
    report += `                  *** END OF COMPUTED STATEMENT ***\n`;
    report += `====================================================================\n`;

    downloadFile(report, `cyber_audit_statement_${selectedMonth.replace(/\s+/g, '_')}.txt`, 'text/plain;charset=utf-8;');
  };

  return (
    <div className="bg-[#111112] border border-white/10 rounded-2xl p-6 relative shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <div>
          <span className="text-[10px] tracking-widest text-blue-500 uppercase font-bold font-mono">INTELLIGENT INSIGHTS</span>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
            AUTOMATED REPORTS <FileText className="w-4.5 h-4.5 text-blue-500" />
          </h2>
          <p className="text-xs text-white/40 mt-1 font-sans">
            Build comprehensive wealth audits, tax estimators, and budget diagnostic statements.
          </p>
        </div>

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="bg-[#111112] border border-white/10 text-white rounded-lg py-1.5 px-3 font-mono focus:outline-none focus:border-blue-500"
        >
          <option value="June 2024">June 2024 (Active)</option>
          <option value="May 2024">May 2024</option>
          <option value="April 2024">April 2024</option>
          <option value="Full Year 2024">Full Year 2024</option>
        </select>
      </div>

      {!generatedReport ? (
        <div className="text-center py-10 rounded-xl border border-dashed border-white/10 bg-[#0A0A0B]/20 flex flex-col items-center justify-center p-6">
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3">
            <FileText className="w-5 h-5 text-blue-500" />
          </div>
          <h3 className="text-sm font-extrabold text-white uppercase font-mono tracking-wider">MONTHLY REPORT CONTEXT COMPILER</h3>
          <p className="text-xs text-white/40 mt-1 max-w-sm leading-relaxed mb-4 text-center">
            Instantly run statistical modeling algorithms on cash ledger lines and bank sync channels.
          </p>
          <button
            onClick={generateReport}
            disabled={isGenerating}
            className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-bold tracking-wider uppercase transition-all cursor-pointer shadow-md"
          >
            {isGenerating ? 'ANALYZING ACCOUNTS LEDGER...' : 'COMPILE INTEL AUDIT REPORT'}
          </button>
        </div>
      ) : (
        <div className="space-y-4 animate-fadeIn">
          
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-[#0A0A0B] border border-white/5">
              <span className="text-[9px] font-mono text-white/30 uppercase block">CREDIT EARNINGS</span>
              <p className="text-sm font-extrabold text-emerald-400 font-mono mt-0.5">
                +₹{generatedReport.totalGain.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0A0A0B] border border-white/5">
              <span className="text-[9px] font-mono text-white/30 uppercase block">DEBIT OUTBURST</span>
              <p className="text-sm font-extrabold text-rose-400 font-mono mt-0.5">
                -₹{generatedReport.totalLoss.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0A0A0B] border border-white/5">
              <span className="text-[9px] font-mono text-white/30 uppercase block">SIMULATED INCOME SAVINGS RATIO</span>
              <p className="text-sm font-extrabold text-blue-500 font-mono mt-0.5">
                {generatedReport.savingsRate}% Savings velocity
              </p>
            </div>
          </div>

          {/* Detailed Advisor Section */}
          <div className="p-4 rounded-xl bg-[#0A0A0B] border border-white/10">
            <span className="text-[10px] uppercase font-bold text-blue-500 font-mono block mb-1.5 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-blue-500" /> SYSTEM ADVISORY AUDIT REPORT
            </span>
            <p className="text-xs text-white/80 leading-relaxed">
              {generatedReport.advisorAdvice}
            </p>
          </div>

          {/* Budget status warnings inside report */}
          <div className="p-3 rounded-xl bg-[#0A0A0B]/30 border border-dashed border-white/10">
            <span className="text-[10px] font-mono font-bold text-white/30 block mb-1 uppercase">CATEGORIES STATUS LOG:</span>
            {generatedReport.alerts.map((alert: string, idx: number) => (
              <p key={idx} className="text-xs text-rose-300 font-mono mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                {alert}
              </p>
            ))}
          </div>

          {/* Command buttons for export */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
            <button
              onClick={printDocument}
              type="button"
              className="py-2.5 px-3 rounded-lg bg-[#0A0A0B] border border-white/10 hover:border-blue-500 hover:text-white text-white/70 font-mono text-[10px] font-bold tracking-widest uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              title="Prints standard browser friendly view"
            >
              <Printer className="w-4 h-4 text-blue-400" /> Print Statement
            </button>

            <button
              onClick={exportToTxtReport}
              type="button"
              className="py-2.5 px-3 rounded-lg bg-[#0A0A0B] border border-white/10 hover:border-blue-500 hover:text-white text-white/70 font-mono text-[10px] font-bold tracking-widest uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              title="Download beautiful text format summary statement"
            >
              <FileText className="w-4 h-4 text-amber-400" /> Download Txt
            </button>

            <button
              onClick={exportToJson}
              type="button"
              className="py-2.5 px-3 rounded-lg bg-[#0A0A0B] border border-white/10 hover:border-blue-500 hover:text-white text-white/70 font-mono text-[10px] font-bold tracking-widest uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              title="Download full database snapshot as JSON file"
            >
              <Download className="w-4 h-4 text-teal-400" /> Download JSON
            </button>

            <button
              onClick={exportToCsv}
              type="button"
              className="py-2.5 px-3 rounded-lg bg-[#0A0A0B] border border-white/10 hover:border-blue-500 hover:text-white text-white/70 font-mono text-[10px] font-bold tracking-widest uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              title="Download universal spreadsheet-friendly CSV table"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Spreadsheet CSV
            </button>
          </div>

          <p className="text-[9px] text-center text-white/30 font-mono mt-2 uppercase">
            SECURE COMPRESSION KEY: SHA-256 SUM-32 // AUDIT COMPLETED ON {generatedReport.timestamp}
          </p>

        </div>
      )}

    </div>
  );
};
