import { useEffect, useState } from 'react';
import { Card, CardBody } from '../../components/UI/Card';
import { Users, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { api } from '../../services/api';
import { Analytics } from '../../types';

export function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await api.analytics.getOverview();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: 'Total Revenue',
      value: analytics?.totalRevenue ? `₹${analytics.totalRevenue.toLocaleString()}` : '₹0',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      label: 'Active Students',
      value: analytics?.activeStudents || 0,
      icon: Users,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Sessions This Month',
      value: analytics?.sessionsThisMonth || 0,
      icon: Calendar,
      color: 'from-yellow-500 to-orange-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
    {
      label: 'Growth Rate',
      value: analytics?.growthRate ? `${analytics.growthRate}%` : '0%',
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
  ];

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
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Overview of your cricket academy's performance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardBody className="flex items-center space-x-4">
              <div className={`p-4 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`h-8 w-8 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardBody>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <a
                href="/admin/players"
                className="block p-4 rounded-lg bg-gradient-to-r from-green-50 to-yellow-50 dark:from-green-900/20 dark:to-yellow-900/20 hover:from-green-100 hover:to-yellow-100 dark:hover:from-green-900/30 dark:hover:to-yellow-900/30 transition-colors"
              >
                <p className="font-semibold text-gray-900 dark:text-white">
                  Manage Players
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add, edit, or remove players
                </p>
              </a>
              <a
                href="/admin/batches"
                className="block p-4 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 hover:from-blue-100 hover:to-cyan-100 dark:hover:from-blue-900/30 dark:hover:to-cyan-900/30 transition-colors"
              >
                <p className="font-semibold text-gray-900 dark:text-white">
                  Manage Batches
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create and organize batches
                </p>
              </a>
              <a
                href="/admin/attendance"
                className="block p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-colors"
              >
                <p className="font-semibold text-gray-900 dark:text-white">
                  Mark Attendance
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Track daily attendance
                </p>
              </a>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    New player registered
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Batch schedule updated
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Fee payment received
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">1 day ago</p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
