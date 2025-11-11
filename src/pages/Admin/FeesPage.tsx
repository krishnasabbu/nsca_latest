import { useEffect, useState } from 'react';
import { Card, CardBody } from '../../components/UI/Card';
import { DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { User } from '../../types';

export function FeesPage() {
  const [players, setPlayers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending'>('all');

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      const users = await api.users.list();
      setPlayers(users.filter((u) => u.role === 'student'));
    } catch (error) {
      console.error('Failed to load players:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div></div>;

  const stats = {
    total: players.length * 5000,
    paid: Math.floor(players.length * 0.7) * 5000,
    pending: Math.ceil(players.length * 0.3) * 5000,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Fee Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Track and manage student fees</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardBody className="flex items-center space-x-4">
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20">
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Expected</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{stats.total.toLocaleString()}</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center space-x-4">
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Collected</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{stats.paid.toLocaleString()}</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center space-x-4">
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{stats.pending.toLocaleString()}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody>
          <div className="mb-6">
            <div className="flex space-x-2">
              <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg transition-colors ${filter === 'all' ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>All</button>
              <button onClick={() => setFilter('paid')} className={`px-4 py-2 rounded-lg transition-colors ${filter === 'paid' ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>Paid</button>
              <button onClick={() => setFilter('pending')} className={`px-4 py-2 rounded-lg transition-colors ${filter === 'pending' ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>Pending</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Player</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Batch</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Last Payment</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, idx) => {
                  const isPaid = idx % 3 !== 0;
                  return (
                    <tr key={player.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{player.name}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{player.batch || '-'}</td>
                      <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">₹5,000</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 w-fit ${isPaid ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                          {isPaid ? <CheckCircle size={14} /> : <Clock size={14} />}
                          <span>{isPaid ? 'Paid' : 'Pending'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{isPaid ? '10 Nov 2025' : '-'}</td>
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
