import { useEffect, useState } from 'react';
import { Card, CardBody } from '../../components/UI/Card';
import { Modal } from '../../components/UI/Modal';
import { DollarSign, CheckCircle, XCircle, Clock, Plus, Eye, Filter, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { User, FeeRecord } from '../../types';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function FeesPage() {
  const [students, setStudents] = useState<User[]>([]);
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [users, fees] = await Promise.all([
        api.users.list(),
        api.fees.list(),
      ]);
      const studentsList = users.filter((u) => u.role === 'student');
      setStudents(studentsList);
      setFeeRecords(fees);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseDate = (dateStr: string | Date) => {
    try {
      if (dateStr instanceof Date) {
        return dateStr;
      }

      if (typeof dateStr === 'string') {
        if (dateStr.includes('T') || dateStr.includes('Z')) {
          return new Date(dateStr);
        }

        const parts = dateStr.split('-');
        if (parts.length === 3) {
          if (parts[0].length === 4) {
            return new Date(dateStr);
          } else {
            const [day, month, year] = parts.map(Number);
            return new Date(year, month - 1, day);
          }
        }
      }

      return new Date(dateStr);
    } catch (e) {
      console.error('Date parse error:', e, dateStr);
      return new Date();
    }
  };

  const getMonthYearFees = () => {
    const filtered = feeRecords.filter((fee) => {
      const feeDate = parseDate(fee.date);
      const feeMonth = feeDate.getMonth() + 1;
      const feeYear = feeDate.getFullYear();
      const matches = feeMonth === selectedMonth && feeYear === selectedYear;

      return matches;
    });

    return filtered;
  };

  const calculateStats = () => {
    const monthFees = getMonthYearFees();
    const totalCollected = monthFees.reduce((sum, fee) => sum + Number(fee.amount), 0);
    const totalExpected = students.reduce((sum, student) => sum + (student.monthlyFee || 0), 0);
    const totalPending = totalExpected - totalCollected;

    return {
      totalExpected,
      totalCollected,
      totalPending: totalPending > 0 ? totalPending : 0,
    };
  };

  const stats = calculateStats();

  const getStudentPaymentStatus = (student: User) => {
    const monthFees = feeRecords.filter((fee) => {
      const feeDate = parseDate(fee.date);
      return (
        fee.userid === student.id &&
        feeDate.getMonth() + 1 === selectedMonth &&
        feeDate.getFullYear() === selectedYear
      );
    });

    const totalPaid = monthFees.reduce((sum, fee) => sum + Number(fee.amount), 0);
    const expectedAmount = student.monthlyFee || 0;

    if (totalPaid >= expectedAmount) {
      return { status: 'paid', amount: totalPaid };
    } else if (totalPaid > 0) {
      return { status: 'partial', amount: totalPaid };
    } else {
      return { status: 'pending', amount: 0 };
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phone?.includes(searchTerm);

    if (!matchesSearch) return false;

    if (filterStatus === 'all') return true;

    const paymentStatus = getStudentPaymentStatus(student);
    if (filterStatus === 'paid') return paymentStatus.status === 'paid';
    if (filterStatus === 'pending') return paymentStatus.status === 'pending' || paymentStatus.status === 'partial';

    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Fee Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive fee ledger with real-time collection tracking
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardBody className="flex items-center space-x-4">
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20">
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Expected ({MONTHS[selectedMonth - 1]})
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₹{stats.totalExpected.toLocaleString()}
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
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Collected ({MONTHS[selectedMonth - 1]})
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₹{stats.totalCollected.toLocaleString()}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center space-x-4">
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Pending ({MONTHS[selectedMonth - 1]})
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₹{stats.totalPending.toLocaleString()}
              </p>
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

            <div className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                />
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>
          </div>

          <div className="mb-4 flex space-x-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === 'all'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              All Students
            </button>
            <button
              onClick={() => setFilterStatus('paid')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === 'paid'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Paid
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === 'pending'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Pending
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Student</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Phone</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Expected</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Paid</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Balance</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Status</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => {
                  const paymentStatus = getStudentPaymentStatus(student);
                  const expectedAmount = student.monthlyFee || 0;
                  const balance = expectedAmount - paymentStatus.amount;

                  return (
                    <tr
                      key={student.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {student.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{student.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{student.phone}</td>
                      <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        ₹{expectedAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-semibold text-green-600">
                        ₹{paymentStatus.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-semibold text-red-600">
                        ₹{balance > 0 ? balance.toLocaleString() : '0'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 w-fit ${
                            paymentStatus.status === 'paid'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : paymentStatus.status === 'partial'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {paymentStatus.status === 'paid' ? (
                            <CheckCircle size={14} />
                          ) : (
                            <Clock size={14} />
                          )}
                          <span>
                            {paymentStatus.status === 'paid'
                              ? 'Paid'
                              : paymentStatus.status === 'partial'
                              ? 'Partial'
                              : 'Pending'}
                          </span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setIsLedgerModalOpen(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="View Ledger"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setIsPaymentModalOpen(true);
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Record Payment"
                          >
                            <Plus size={18} />
                          </button>
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

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        student={selectedStudent}
        month={selectedMonth}
        year={selectedYear}
        onSuccess={loadData}
      />

      <StudentLedgerModal
        isOpen={isLedgerModalOpen}
        onClose={() => setIsLedgerModalOpen(false)}
        student={selectedStudent}
        feeRecords={feeRecords}
        onDelete={loadData}
      />
    </div>
  );
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: User | null;
  month: number;
  year: number;
  onSuccess: () => void;
}

function PaymentModal({ isOpen, onClose, student, month, year, onSuccess }: PaymentModalProps) {
  const [formData, setFormData] = useState({
    amount: '',
    paymentDate: '',
    paidType: 'cash' as 'cash' | 'upi' | 'bank_transfer' | 'cheque',
    remarks: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student) {
      const day = new Date().getDate().toString().padStart(2, '0');
      const monthStr = month.toString().padStart(2, '0');
      const dateStr = `${day}-${monthStr}-${year}`;

      setFormData({
        amount: student.monthlyFee?.toString() || '',
        paymentDate: dateStr,
        paidType: 'cash',
        remarks: '',
      });
    }
  }, [student, month, year]);

  if (!student) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.fees.create({
        userid: student.id,
        name: student.name,
        phone: student.phone,
        amount: Number(formData.amount),
        paidType: formData.paidType,
        date: formData.paymentDate,
        remarks: formData.remarks,
      });

      alert('Payment recorded successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to record payment:', error);
      alert('Failed to record payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Payment">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Student</label>
          <input
            type="text"
            value={student.name}
            disabled
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Month</label>
            <input
              type="text"
              value={MONTHS[month - 1]}
              disabled
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Year</label>
            <input
              type="text"
              value={year}
              disabled
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount (₹) *</label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Payment Date (DD-MM-YYYY) *
          </label>
          <input
            type="text"
            value={formData.paymentDate}
            onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
            placeholder="08-11-2025"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Method *</label>
          <select
            value={formData.paidType}
            onChange={(e) => setFormData({ ...formData, paidType: e.target.value as any })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
          >
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cheque">Cheque</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Remarks</label>
          <textarea
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
          />
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
            {loading ? 'Recording...' : 'Record Payment'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

interface StudentLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: User | null;
  feeRecords: FeeRecord[];
  onDelete: () => void;
}

function StudentLedgerModal({ isOpen, onClose, student, feeRecords, onDelete }: StudentLedgerModalProps) {
  if (!student) return null;

  const parseDate = (dateStr: string | Date) => {
    try {
      if (dateStr instanceof Date) return dateStr;
      if (typeof dateStr === 'string' && (dateStr.includes('T') || dateStr.includes('Z'))) {
        return new Date(dateStr);
      }
      const parts = dateStr.split('-');
      if (parts.length === 3 && parts[0].length === 4) {
        return new Date(dateStr);
      } else if (parts.length === 3) {
        const [day, month, year] = parts.map(Number);
        return new Date(year, month - 1, day);
      }
      return new Date(dateStr);
    } catch {
      return new Date();
    }
  };

  const formatDate = (dateStr: string | Date) => {
    const date = parseDate(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const studentFees = feeRecords
    .filter((fee) => fee.userid === student.id)
    .sort((a, b) => {
      const dateA = parseDate(a.date);
      const dateB = parseDate(b.date);
      return dateB.getTime() - dateA.getTime();
    });

  const totalPaid = studentFees.reduce((sum, fee) => sum + Number(fee.amount), 0);

  const handleDelete = async (feeId: string) => {
    if (!confirm('Are you sure you want to delete this payment record?')) return;

    try {
      await api.fees.delete(feeId);
      alert('Payment record deleted successfully!');
      onDelete();
    } catch (error) {
      console.error('Failed to delete fee record:', error);
      alert('Failed to delete payment record.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Fee Ledger - ${student.name}`} size="lg">
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Fee</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              ₹{student.monthlyFee?.toLocaleString() || '0'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Payments</p>
            <p className="text-xl font-bold text-green-600">₹{totalPaid.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Payment Count</p>
            <p className="text-xl font-bold text-blue-600">{studentFees.length}</p>
          </div>
        </div>

        {studentFees.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No payment records found for this student.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Method</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Remarks</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {studentFees.map((fee) => (
                  <tr key={fee.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{formatDate(fee.date)}</td>
                    <td className="py-3 px-4 font-semibold text-green-600">₹{Number(fee.amount).toLocaleString()}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400 capitalize">
                      {fee.paidType.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{fee.remarks || '-'}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => handleDelete(fee.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
}
