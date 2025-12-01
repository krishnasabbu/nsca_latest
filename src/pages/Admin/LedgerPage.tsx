import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Investment, SmsMessage } from '../../types';
import { calculateLedger, getCurrentMonthStats, MonthlyLedgerEntry } from '../../utils/calcLedger';
import { LedgerDashboard } from '../../components/Ledger/LedgerDashboard';
import { MonthlyLedger } from '../../components/Ledger/MonthlyLedger';
import { LedgerCharts } from '../../components/Ledger/LedgerCharts';
import { Filter } from 'lucide-react';

export function LedgerPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [smsMessages, setSmsMessages] = useState<SmsMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ledger' | 'charts'>('dashboard');
  const [ledgerEntries, setLedgerEntries] = useState<MonthlyLedgerEntry[]>([]);
  const [stats, setStats] = useState({
    totalInvestments: 0,
    currentMonthCredits: 0,
    currentMonthDebits: 0,
    currentClosingBalance: 0,
    differenceFromLastMonth: 0,
  });
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchParty, setSearchParty] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (investments.length > 0 || smsMessages.length > 0) {
      calculateStats();
    }
  }, [investments, smsMessages, filterYear, filterMonth, filterType, searchParty]);

  const loadData = async () => {
    try {
      const [investmentsData, smsData] = await Promise.all([
        api.investments.list(),
        api.smsMessages.list(),
      ]);
      setInvestments(investmentsData);
      setSmsMessages(smsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    let filteredMessages = [...smsMessages];

    if (filterType !== 'all') {
      filteredMessages = filteredMessages.filter(
        (msg) => msg.transactionType.toLowerCase() === filterType.toLowerCase()
      );
    }

    if (searchParty) {
      filteredMessages = filteredMessages.filter((msg) =>
        msg.partyName.toLowerCase().includes(searchParty.toLowerCase())
      );
    }

    if (filterYear !== 'all' || filterMonth !== 'all') {
      filteredMessages = filteredMessages.filter((msg) => {
        const date = new Date(msg.smsDate);
        const year = date.getFullYear().toString();
        const month = (date.getMonth() + 1).toString();

        if (filterYear !== 'all' && year !== filterYear) return false;
        if (filterMonth !== 'all' && month !== filterMonth) return false;
        return true;
      });
    }

    const currentStats = getCurrentMonthStats(investments, filteredMessages);
    setStats(currentStats);

    const entries = calculateLedger(investments, filteredMessages);
    setLedgerEntries(entries);
  };

  const getAvailableYears = () => {
    const years = new Set<number>();
    smsMessages.forEach((msg) => {
      const date = new Date(msg.smsDate);
      years.add(date.getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Financial Ledger
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track investments, transactions, and monthly balances
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex items-center space-x-2">
          <Filter size={20} className="text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Years</option>
            {getAvailableYears().map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Months</option>
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Types</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>

          <input
            type="text"
            placeholder="Search by party name..."
            value={searchParty}
            onChange={(e) => setSearchParty(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500 w-48"
          />
        </div>
      </div>

      <LedgerDashboard
        totalInvestments={stats.totalInvestments}
        currentMonthCredits={stats.currentMonthCredits}
        currentMonthDebits={stats.currentMonthDebits}
        currentClosingBalance={stats.currentClosingBalance}
        differenceFromLastMonth={stats.differenceFromLastMonth}
      />

      <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'dashboard'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-green-600'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'ledger'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-green-600'
          }`}
        >
          Monthly Ledger
        </button>
        <button
          onClick={() => setActiveTab('charts')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'charts'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-green-600'
          }`}
        >
          Charts
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <MonthlyLedger ledgerEntries={ledgerEntries.slice(-6)} />
        </div>
      )}

      {activeTab === 'ledger' && <MonthlyLedger ledgerEntries={ledgerEntries} />}

      {activeTab === 'charts' && <LedgerCharts ledgerEntries={ledgerEntries} />}
    </div>
  );
}
