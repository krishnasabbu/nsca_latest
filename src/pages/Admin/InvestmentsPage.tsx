import { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { Investment } from '../../types';
import { Card } from '../../components/UI/Card';
import { Modal } from '../../components/UI/Modal';
import { TrendingUp, Search, Filter, Download, Calendar, DollarSign, PieChart, RefreshCw, Plus, Edit2, Trash2 } from 'lucide-react';

export function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [formData, setFormData] = useState<Partial<Investment>>({
    date: new Date().toISOString().split('T')[0],
    name: '',
    amount: 0,
  });

  useEffect(() => {
    loadInvestments();
  }, []);

  const loadInvestments = async (forceSync: boolean = false) => {
    try {
      if (forceSync) {
        setSyncing(true);
      } else {
        setLoading(true);
      }
      const data = await api.investments.list(forceSync);
      setInvestments(data);
    } catch (error) {
      console.error('Failed to load investments:', error);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  const handleSync = async () => {
    await loadInvestments(true);
  };

  const filteredInvestments = useMemo(() => {
    return investments.filter(investment => {
      const matchesSearch =
        investment.name?.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesDateRange = true;
      if (dateRangeStart) {
        const investmentDate = new Date(investment.date);
        const startDate = new Date(dateRangeStart);
        matchesDateRange = investmentDate >= startDate;
      }
      if (dateRangeEnd && matchesDateRange) {
        const investmentDate = new Date(investment.date);
        const endDate = new Date(dateRangeEnd);
        matchesDateRange = investmentDate <= endDate;
      }

      return matchesSearch && matchesDateRange;
    });
  }, [investments, searchTerm, dateRangeStart, dateRangeEnd]);

  const totalAmount = useMemo(() => {
    return filteredInvestments.reduce((sum, investment) => {
      const amount = typeof investment.amount === 'string' ? parseFloat(investment.amount) : investment.amount;
      const numAmount = !isNaN(amount) && amount !== null ? Number(amount) : 0;
      return sum + numAmount;
    }, 0);
  }, [filteredInvestments]);

  const monthlyBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    filteredInvestments.forEach(investment => {
      const date = new Date(investment.date);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      const amount = typeof investment.amount === 'string' ? parseFloat(investment.amount) : investment.amount;
      breakdown[monthYear] = (breakdown[monthYear] || 0) + (amount || 0);
    });
    return breakdown;
  }, [filteredInvestments]);

  const handleOpenModal = (investment?: Investment) => {
    if (investment) {
      setEditingInvestment(investment);
      setFormData(investment);
    } else {
      setEditingInvestment(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        name: '',
        amount: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingInvestment(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      name: '',
      amount: 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingInvestment) {
        await api.investments.upsert({ ...formData, id: editingInvestment.id });
      } else {
        await api.investments.create(formData);
      }
      await loadInvestments(true);
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save investment:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this investment?')) {
      try {
        await api.investments.delete(id);
        await loadInvestments(true);
      } catch (error) {
        console.error('Failed to delete investment:', error);
      }
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Name', 'Amount'];
    const rows = filteredInvestments.map(investment => [
      investment.date,
      investment.name,
      investment.amount
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `investments-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const formatAmount = (amount: number | string | null | undefined) => {
    if (amount === null || amount === undefined || amount === '') return '₹0.00';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '₹0.00';
    return `₹${numAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="text-emerald-600" />
            Investments
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and manage your investments
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={20} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing...' : 'Sync'}
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={20} />
            Export CSV
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus size={20} />
            Add Investment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Investments</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {filteredInvestments.length}
              </p>
            </div>
            <TrendingUp className="text-emerald-600" size={40} />
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
              <p className="text-gray-600 dark:text-gray-400 text-sm">Avg Investment</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {formatAmount(filteredInvestments.length > 0 ? totalAmount / filteredInvestments.length : 0)}
              </p>
            </div>
            <PieChart className="text-blue-600" size={40} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">This Month</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {formatAmount(
                  filteredInvestments
                    .filter(inv => {
                      const invDate = new Date(inv.date);
                      const now = new Date();
                      return invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear();
                    })
                    .reduce((sum, inv) => sum + (typeof inv.amount === 'string' ? parseFloat(inv.amount) : inv.amount), 0)
                )}
              </p>
            </div>
            <Calendar className="text-yellow-600" size={40} />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Filter size={20} />
            <h3 className="font-semibold">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  placeholder="Search investments..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                From Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="date"
                  value={dateRangeStart}
                  onChange={(e) => setDateRangeStart(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                To Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="date"
                  value={dateRangeEnd}
                  onChange={(e) => setDateRangeEnd(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {(searchTerm || dateRangeStart || dateRangeEnd) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setDateRangeStart('');
                setDateRangeEnd('');
              }}
              className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(monthlyBreakdown).map(([month, amount]) => (
            <div key={month} className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900 dark:to-green-900 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">{month}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatAmount(amount)}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Investment Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredInvestments.map((investment) => (
                <tr key={investment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatDate(investment.date)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={16} className="text-emerald-500" />
                      {investment.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                    {formatAmount(investment.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal(investment)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(investment.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInvestments.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No investments found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by adding a new investment.
            </p>
          </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingInvestment ? 'Edit Investment' : 'Add Investment'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Investment Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Stocks, Mutual Funds, Real Estate"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount *
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              {editingInvestment ? 'Update' : 'Add'} Investment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
