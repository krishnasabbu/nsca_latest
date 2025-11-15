import { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { SmsMessage } from '../../types';
import { Card } from '../../components/UI/Card';
import { MessageSquare, Search, Filter, Download, Calendar, DollarSign, User } from 'lucide-react';

export function SmsMessagesPage() {
  const [messages, setMessages] = useState<SmsMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSender, setFilterSender] = useState<string>('all');
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');
  const [senders, setSenders] = useState<string[]>([]);
  const [transactionTypes, setTransactionTypes] = useState<string[]>([]);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await api.smsMessages.list();
      setMessages(data);

      const uniqueSenders = [...new Set(data.map(m => m.senderAddress).filter(Boolean))];
      setSenders(uniqueSenders);

      const uniqueTypes = [...new Set(data.map(m => m.transactionType).filter(Boolean))];
      setTransactionTypes(uniqueTypes);
    } catch (error) {
      console.error('Failed to load SMS messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseCustomDate = (dateString: string): Date | null => {
    if (!dateString) return null;

    const parts = dateString.match(/(\d{1,2})-(\d{1,2})-(\d{2})\s+(\d{1,2}):(\d{2}):(\d{2})/);
    if (!parts) {
      const fallbackDate = new Date(dateString);
      return isNaN(fallbackDate.getTime()) ? null : fallbackDate;
    }

    const day = parseInt(parts[1], 10);
    const month = parseInt(parts[2], 10);
    const year = parseInt(parts[3], 10) + 2000;
    const hour = parseInt(parts[4], 10);
    const minute = parseInt(parts[5], 10);
    const second = parseInt(parts[6], 10);

    const date = new Date(year, month - 1, day, hour, minute, second);

    return isNaN(date.getTime()) ? null : date;
  };

  const filteredMessages = useMemo(() => {
    let filtered = [...messages];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(msg =>
        msg.fullMessage?.toLowerCase().includes(term) ||
        msg.partyName?.toLowerCase().includes(term) ||
        msg.transactionId?.toLowerCase().includes(term) ||
        msg.upiId?.toLowerCase().includes(term)
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(msg => msg.transactionType === filterType);
    }

    if (filterSender !== 'all') {
      filtered = filtered.filter(msg => msg.senderAddress === filterSender);
    }

    if (dateRangeStart) {
      filtered = filtered.filter(msg => {
        const msgDate = parseCustomDate(msg.smsDate);
        const startDate = new Date(dateRangeStart);
        return msgDate && msgDate >= startDate;
      });
    }

    if (dateRangeEnd) {
      filtered = filtered.filter(msg => {
        const msgDate = parseCustomDate(msg.smsDate);
        const endDate = new Date(dateRangeEnd);
        endDate.setHours(23, 59, 59, 999);
        return msgDate && msgDate <= endDate;
      });
    }

    filtered.sort((a, b) => {
      const dateA = parseCustomDate(b.smsDate);
      const dateB = parseCustomDate(a.smsDate);
      if (!dateA || !dateB) return 0;
      return dateA.getTime() - dateB.getTime();
    });

    return filtered;
  }, [messages, searchTerm, filterType, filterSender, dateRangeStart, dateRangeEnd]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterSender('all');
    setDateRangeStart('');
    setDateRangeEnd('');
  };

  const exportToCSV = () => {
    const headers = [
      'SMS Date',
      'Sender Address',
      'Transaction Type',
      'Amount',
      'UPI ID',
      'Transaction ID',
      'Party Name',
      'Full Message'
    ];

    const rows = filteredMessages.map(msg => [
      msg.smsDate,
      msg.senderAddress,
      msg.transactionType,
      msg.amount,
      msg.upiId,
      msg.transactionId,
      msg.partyName,
      `"${msg.fullMessage.replace(/"/g, '""')}"`
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sms-messages-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';

    const date = parseCustomDate(dateString);
    if (!date) return 'Invalid Date';

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatAmount = (amount: number) => {
    if (!amount) return 'N/A';
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const totalAmount = filteredMessages.reduce((sum, msg) => sum + (msg.amount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="text-green-600" />
            SMS Messages
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage transaction SMS messages
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download size={20} />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Messages</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {filteredMessages.length}
              </p>
            </div>
            <MessageSquare className="text-blue-600" size={40} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Amount</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {formatAmount(totalAmount)}
              </p>
            </div>
            <DollarSign className="text-green-600" size={40} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Unique Senders</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {senders.length}
              </p>
            </div>
            <User className="text-yellow-600" size={40} />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Filter size={20} />
            <h3 className="font-semibold">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search messages..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Transaction Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Types</option>
                {transactionTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sender
              </label>
              <select
                value={filterSender}
                onChange={(e) => setFilterSender(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Senders</option>
                {senders.map(sender => (
                  <option key={sender} value={sender}>{sender}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={dateRangeStart}
                onChange={(e) => setDateRangeStart(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={dateRangeEnd}
                onChange={(e) => setDateRangeEnd(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Sender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Party Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  UPI ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Message
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredMessages.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No messages found
                  </td>
                </tr>
              ) : (
                filteredMessages.map((message) => (
                  <tr key={message.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                        <Calendar size={16} className="text-gray-400" />
                        {formatDate(message.smsDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {message.senderAddress || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        message.transactionType === 'credit'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : message.transactionType === 'debit'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {message.transactionType || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {formatAmount(message.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {message.partyName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {message.upiId || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-mono">
                      {message.transactionId || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-md">
                      <div className="truncate" title={message.fullMessage}>
                        {message.fullMessage || 'N/A'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
