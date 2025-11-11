import { useEffect, useState } from 'react';
import { Card, CardBody } from '../../components/UI/Card';
import { Users, Calendar, Video, Activity } from 'lucide-react';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export function CoachDashboard() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (user?.id) {
        const studentsData = await api.users.getCoachStudents(user.id);
        setStudents(studentsData);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  const stats = [
    { label: 'My Students', value: students.length, icon: Users, color: 'from-blue-500 to-cyan-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Active Batches', value: new Set(students.map(s => s.batch)).size, icon: Calendar, color: 'from-green-500 to-emerald-600', bgColor: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Training Videos', value: 12, icon: Video, color: 'from-yellow-500 to-orange-600', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { label: 'Avg Attendance', value: '85%', icon: Activity, color: 'from-purple-500 to-pink-600', bgColor: 'bg-purple-50 dark:bg-purple-900/20' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Coach Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back, {user?.name}!
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
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardBody>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">My Students</h3>
            <div className="space-y-3">
              {students.slice(0, 5).map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {student.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{student.batch || 'No Batch'}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-semibold rounded-full">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <a href="/coach/attendance" className="block p-4 rounded-lg bg-gradient-to-r from-green-50 to-yellow-50 dark:from-green-900/20 dark:to-yellow-900/20 hover:from-green-100 hover:to-yellow-100 dark:hover:from-green-900/30 dark:hover:to-yellow-900/30 transition-colors">
                <p className="font-semibold text-gray-900 dark:text-white">Mark Attendance</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Record today's attendance</p>
              </a>
              <a href="/coach/media" className="block p-4 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 hover:from-blue-100 hover:to-cyan-100 dark:hover:from-blue-900/30 dark:hover:to-cyan-900/30 transition-colors">
                <p className="font-semibold text-gray-900 dark:text-white">Upload Training Video</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Share training content</p>
              </a>
              <a href="/coach/yoyo-test" className="block p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-colors">
                <p className="font-semibold text-gray-900 dark:text-white">Add Test Results</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Record fitness test scores</p>
              </a>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
