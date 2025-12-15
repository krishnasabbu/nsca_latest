import { useEffect, useState } from 'react';
import { Card, CardBody } from '../../components/UI/Card';
import { Modal } from '../../components/UI/Modal';
import { Wallet, CheckCircle, Clock, Plus, Edit, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { User, Salary } from '../../types';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function SalaryPage() {
  const [staff, setStaff] = useState<User[]>([]);
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [filteredSalaries, setFilteredSalaries] = useState<Salary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSalary, setEditingSalary] = useState<{ user: User; salary?: Salary } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterSalaries();
  }, [salaries, selectedMonth, selectedYear]);

  const loadData = async (forceSync: boolean = false) => {
    try {
      if (forceSync) setLoading(true);
      const [staffList, allSalaries] = await Promise.all([
        api.users.getStaff(forceSync),
        api.salaries.list(forceSync),
      ]);
      setStaff(staffList);
      setSalaries(allSalaries);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSalaries = () => {
    const monthStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    const filtered = salaries.filter((s) => s.date.startsWith(monthStr));
    setFilteredSalaries(filtered);
  };

  const getStaffSalaryStatus = (staffMember: User) => {
    const monthStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    const salary = salaries.find(
      (s) => s.userId === staffMember.id && s.date.startsWith(monthStr)
    );
    return salary || null;
  };

  const calculateStats = () => {
    const totalSalaries = filteredSalaries.reduce((sum, s) => sum + Number(s.salary), 0);
    const paidCount = filteredSalaries.filter((s) => s.status === 'paid').length;
    const pendingCount = filteredSalaries.filter((s) => s.status === 'pending').length;

    return {
      totalSalaries,
      paidCount,
      pendingCount,
      totalStaff: staff.length,
    };
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this salary record?')) return;
    try {
      await api.salaries.delete(id);
      await loadData(true);
      alert('Salary record deleted successfully!');
    } catch (error) {
      console.error('Failed to delete salary:', error);
      alert('Failed to delete salary record.');
    }
  };

  const stats = calculateStats();

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Salary Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage coach and staff salaries</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardBody className="flex items-center space-x-4">
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20">
              <Wallet className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Total ({MONTHS[selectedMonth - 1]})
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₹{stats.totalSalaries.toLocaleString()}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center space-x-4">
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Paid</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.paidCount}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center space-x-4">
            <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20">
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingCount}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center space-x-4">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              >
                {MONTHS.map((month, idx) => (
                  <option key={idx} value={idx + 1}>
                    {month}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              >
                {[2024, 2025, 2026].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Total Staff: {staff.length}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Staff Member</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Role</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Max Salary</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Paid Salary</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Date</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => {
                  const salaryRecord = getStaffSalaryStatus(member);
                  const hasSalary = salaryRecord !== null;

                  return (
                    <tr
                      key={member.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {member.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{member.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400 capitalize">{member.role}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {member.monthlyFee ? `₹${Number(member.monthlyFee).toLocaleString()}` : 'Not set'}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        {hasSalary ? `₹${Number(salaryRecord.salary).toLocaleString()}` : '-'}
                      </td>
                      <td className="py-3 px-4">
                        {hasSalary ? (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 w-fit ${
                              salaryRecord.status === 'paid'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}
                          >
                            {salaryRecord.status === 'paid' ? (
                              <CheckCircle size={14} />
                            ) : (
                              <Clock size={14} />
                            )}
                            <span className="capitalize">{salaryRecord.status}</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400">
                            Not Set
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {hasSalary ? new Date(salaryRecord.date).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end space-x-2">
                          {hasSalary ? (
                            <>
                              <button
                                onClick={() => {
                                  setEditingSalary({ user: member, salary: salaryRecord });
                                  setIsModalOpen(true);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Edit Salary"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(salaryRecord.id)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Delete Salary"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingSalary({ user: member });
                                setIsModalOpen(true);
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                              title="Add Salary"
                            >
                              <Plus size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <SalaryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={editingSalary}
        month={selectedMonth}
        year={selectedYear}
        onSuccess={() => loadData(true)}
      />
    </div>
  );
}

interface SalaryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: { user: User; salary?: Salary } | null;
  month: number;
  year: number;
  onSuccess: () => void;
}

function SalaryFormModal({ isOpen, onClose, data, month, year, onSuccess }: SalaryFormModalProps) {
  const [formData, setFormData] = useState({
    salary: '',
    date: '',
    status: 'paid' as 'paid' | 'pending',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-01`;
      if (data.salary) {
        setFormData({
          salary: String(data.salary.salary),
          date: data.salary.date.split('T')[0],
          status: data.salary.status,
        });
      } else {
        setFormData({
          salary: '',
          date: dateStr,
          status: 'paid',
        });
      }
    }
  }, [data, month, year]);

  if (!data) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const salaryData: Partial<Salary> = {
        userId: data.user.id,
        salary: Number(formData.salary),
        date: formData.date,
        status: formData.status,
      };

      if (data.salary) {
        await api.salaries.upsert({ ...salaryData, id: data.salary.id });
        alert('Salary updated successfully!');
      } else {
        await api.salaries.create(salaryData);
        alert('Salary created successfully!');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save salary:', error);
      alert('Failed to save salary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={data.salary ? `Edit Salary - ${data.user.name}` : `Add Salary - ${data.user.name}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Staff Member
          </label>
          <input
            type="text"
            value={data.user.name}
            disabled
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role
            </label>
            <input
              type="text"
              value={data.user.role}
              disabled
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white capitalize"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Monthly Salary
            </label>
            <input
              type="text"
              value={data.user.monthlyFee ? `₹${Number(data.user.monthlyFee).toLocaleString()}` : 'Not set'}
              disabled
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Salary Amount (₹) *
          </label>
          <input
            type="number"
            value={formData.salary}
            onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
            required
            max={data.user.monthlyFee || undefined}
          />
          {data.user.monthlyFee && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Maximum allowed: ₹{Number(data.user.monthlyFee).toLocaleString()}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status *
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'paid' | 'pending' })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
            >
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-green-600 to-yellow-500 text-white rounded-lg hover:from-green-700 hover:to-yellow-600 transition-all disabled:opacity-50"
          >
            {loading ? 'Saving...' : data.salary ? 'Update' : 'Create'} Salary
          </button>
        </div>
      </form>
    </Modal>
  );
}
