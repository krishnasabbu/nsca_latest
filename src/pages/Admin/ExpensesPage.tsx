import { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { Work } from '../../types';
import { Card } from '../../components/UI/Card';
import { Modal } from '../../components/UI/Modal';
import { Briefcase, Search, Filter, Download, Calendar, DollarSign, TrendingDown, RefreshCw, Plus, Edit2, Trash2, User } from 'lucide-react';

export function ExpensesPage() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPaidBy, setFilterPaidBy] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<string>('all');
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [paidByList, setPaidByList] = useState<string[]>([]);
  const [modesList, setModesList] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWork, setEditingWork] = useState<Work | null>(null);
  const [formData, setFormData] = useState<Partial<Work>>({
    date: new Date().toISOString().split('T')[0],
    workCategory: '',
    workDetails: '',
    paidBy: '',
    amount: 0,
    modeOfTransaction: '',
  });

  useEffect(() => {
    loadWorks();
  }, []);

  const loadWorks = async (forceSync: boolean = false) => {
    try {
      if (forceSync) {
        setSyncing(true);
      } else {
        setLoading(true);
      }
      const data = await api.works.list(forceSync);
      setWorks(data);

      const uniqueCategories = [...new Set(data.map(w => w.workCategory).filter(Boolean))];
      setCategories(uniqueCategories);

      const uniquePaidBy = [...new Set(data.map(w => w.paidBy).filter(Boolean))];
      setPaidByList(uniquePaidBy);

      const uniqueModes = [...new Set(data.map(w => w.modeOfTransaction).filter(Boolean))];
      setModesList(uniqueModes);
    } catch (error) {
      console.error('Failed to load works:', error);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  const handleSync = async () => {
    await loadWorks(true);
  };

  const filteredWorks = useMemo(() => {
    return works.filter(work => {
      const matchesSearch =
        work.workDetails?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        work.workCategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        work.paidBy?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = filterCategory === 'all' || work.workCategory === filterCategory;
      const matchesPaidBy = filterPaidBy === 'all' || work.paidBy === filterPaidBy;
      const matchesMode = filterMode === 'all' || work.modeOfTransaction === filterMode;

      let matchesDateRange = true;
      if (dateRangeStart) {
        const workDate = new Date(work.date);
        const startDate = new Date(dateRangeStart);
        matchesDateRange = workDate >= startDate;
      }
      if (dateRangeEnd && matchesDateRange) {
        const workDate = new Date(work.date);
        const endDate = new Date(dateRangeEnd);
        matchesDateRange = workDate <= endDate;
      }

      return matchesSearch && matchesCategory && matchesPaidBy && matchesMode && matchesDateRange;
    });
  }, [works, searchTerm, filterCategory, filterPaidBy, filterMode, dateRangeStart, dateRangeEnd]);

  const totalAmount = useMemo(() => {
    return filteredWorks.reduce((sum, work) => {
      const amount = typeof work.amount === 'string' ? parseFloat(work.amount) : work.amount;
      const numAmount = !isNaN(amount) && amount !== null ? Number(amount) : 0;
      return sum + numAmount;
    }, 0);
  }, [filteredWorks]);

  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    filteredWorks.forEach(work => {
      const category = work.workCategory || 'Uncategorized';
      const amount = typeof work.amount === 'string' ? parseFloat(work.amount) : work.amount;
      breakdown[category] = (breakdown[category] || 0) + (amount || 0);
    });
    return breakdown;
  }, [filteredWorks]);

  const handleOpenModal = (work?: Work) => {
    if (work) {
      setEditingWork(work);
      setFormData(work);
    } else {
      setEditingWork(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        workCategory: '',
        workDetails: '',
        paidBy: '',
        amount: 0,
        modeOfTransaction: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingWork(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      workCategory: '',
      workDetails: '',
      paidBy: '',
      amount: 0,
      modeOfTransaction: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingWork) {
        await api.works.upsert({ ...formData, id: editingWork.id });
      } else {
        await api.works.create(formData);
      }
      await loadWorks(true);
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save work:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      try {
        await api.works.delete(id);
        await loadWorks(true);
      } catch (error) {
        console.error('Failed to delete work:', error);
      }
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Category', 'Details', 'Paid By', 'Amount', 'Mode'];
    const rows = filteredWorks.map(work => [
      work.date,
      work.workCategory,
      work.workDetails,
      work.paidBy,
      work.amount,
      work.modeOfTransaction
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Briefcase className="text-orange-600" />
            Expenses
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and manage work expenses
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
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus size={20} />
            Add Expense
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Expenses</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {filteredWorks.length}
              </p>
            </div>
            <Briefcase className="text-orange-600" size={40} />
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
            <DollarSign className="text-red-600" size={40} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Categories</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {categories.length}
              </p>
            </div>
            <TrendingDown className="text-yellow-600" size={40} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Avg Expense</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {formatAmount(filteredWorks.length > 0 ? totalAmount / filteredWorks.length : 0)}
              </p>
            </div>
            <TrendingDown className="text-blue-600" size={40} />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Filter size={20} />
            <h3 className="font-semibold">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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
                  placeholder="Search expenses..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Paid By
              </label>
              <select
                value={filterPaidBy}
                onChange={(e) => setFilterPaidBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Payers</option>
                {paidByList.map(paidBy => (
                  <option key={paidBy} value={paidBy}>{paidBy}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Mode
              </label>
              <select
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Modes</option>
                {modesList.map(mode => (
                  <option key={mode} value={mode}>{mode}</option>
                ))}
              </select>
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {(searchTerm || filterCategory !== 'all' || filterPaidBy !== 'all' || filterMode !== 'all' || dateRangeStart || dateRangeEnd) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterCategory('all');
                setFilterPaidBy('all');
                setFilterMode('all');
                setDateRangeStart('');
                setDateRangeEnd('');
              }}
              className="text-orange-600 hover:text-orange-700 text-sm font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Category Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(categoryBreakdown).map(([category, amount]) => (
            <div key={category} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">{category}</p>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Paid By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredWorks.map((work) => (
                <tr key={work.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatDate(work.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                      {work.workCategory}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                    {work.workDetails}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      {work.paidBy}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                    {formatAmount(work.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {work.modeOfTransaction}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal(work)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(work.id)}
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

        {filteredWorks.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No expenses found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by adding a new expense.
            </p>
          </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingWork ? 'Edit Expense' : 'Add Expense'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category *
            </label>
            <input
              type="text"
              value={formData.workCategory}
              onChange={(e) => setFormData({ ...formData, workCategory: e.target.value })}
              placeholder="e.g., Equipment, Utilities, Maintenance"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Details *
            </label>
            <textarea
              value={formData.workDetails}
              onChange={(e) => setFormData({ ...formData, workDetails: e.target.value })}
              placeholder="Describe the expense..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Paid By *
            </label>
            <input
              type="text"
              value={formData.paidBy}
              onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
              placeholder="Name of person who paid"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
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
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Mode *
            </label>
            <select
              value={formData.modeOfTransaction}
              onChange={(e) => setFormData({ ...formData, modeOfTransaction: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="">Select mode</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
              <option value="card">Card</option>
            </select>
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
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              {editingWork ? 'Update' : 'Add'} Expense
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
