import { useEffect, useState } from 'react';
import { Card, CardBody } from '../../components/UI/Card';
import { Wallet, CheckCircle, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { User } from '../../types';

export function SalaryPage() {
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      const users = await api.users.list();
      setStaff(users.filter((u) => u.role === 'coach' || u.role === 'support'));
    } catch (error) {
      console.error('Failed to load staff:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div></div>;

  const totalSalaries = staff.length * 30000;
  const paidSalaries = Math.floor(staff.length * 0.8) * 30000;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Salary Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage coach and staff salaries</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardBody className="flex items-center space-x-4">
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20">
              <Wallet className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Salaries</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{totalSalaries.toLocaleString()}</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center space-x-4">
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Paid This Month</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{paidSalaries.toLocaleString()}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Staff Member</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Role</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Monthly Salary</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Last Paid</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((member, idx) => {
                  const isPaid = idx % 5 !== 0;
                  return (
                    <tr key={member.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {member.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{member.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400 capitalize">{member.role}</td>
                      <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">₹30,000</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 w-fit ${isPaid ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                          {isPaid ? <CheckCircle size={14} /> : <Clock size={14} />}
                          <span>{isPaid ? 'Paid' : 'Pending'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{isPaid ? '01 Nov 2025' : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
