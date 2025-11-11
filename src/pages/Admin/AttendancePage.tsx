import { useEffect, useState } from 'react';
import { Card, CardBody } from '../../components/UI/Card';
import { Calendar, Check, X, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { Attendance, User } from '../../types';
import { useAuthStore } from '../../store/authStore';

export function AttendancePage() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [players, setPlayers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [attendanceData, usersData] = await Promise.all([
        api.attendance.list(),
        api.users.list(),
      ]);
      setAttendance(attendanceData);
      setPlayers(usersData.filter((u) => u.role === 'student'));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (playerId: string, status: 'present' | 'absent' | 'late') => {
    try {
      const existing = attendance.find((a) => a.userId === playerId && a.date === selectedDate);
      if (existing) {
        await api.attendance.update({ id: existing.id, status, date: selectedDate, userId: playerId, markedBy: user?.id || '' });
      } else {
        await api.attendance.create({ date: selectedDate, userId: playerId, status, markedBy: user?.id || '', batchId: '' });
      }
      await loadData();
    } catch (error) {
      console.error('Failed to mark attendance:', error);
    }
  };

  const getAttendanceStatus = (playerId: string) => {
    const record = attendance.find((a) => a.userId === playerId && a.date === selectedDate);
    return record?.status;
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Attendance Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Mark and track daily attendance</p>
      </div>

      <Card>
        <CardBody>
          <div className="mb-6 flex items-center space-x-4">
            <Calendar className="text-green-500" size={24} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="space-y-2">
            {players.map((player) => {
              const status = getAttendanceStatus(player.id);
              return (
                <div key={player.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {player.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{player.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{player.batch || 'No Batch'}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => markAttendance(player.id, 'present')}
                      className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                        status === 'present'
                          ? 'bg-green-500 text-white'
                          : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                      }`}
                    >
                      <Check size={18} />
                      <span>Present</span>
                    </button>
                    <button
                      onClick={() => markAttendance(player.id, 'late')}
                      className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                        status === 'late'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                      }`}
                    >
                      <Clock size={18} />
                      <span>Late</span>
                    </button>
                    <button
                      onClick={() => markAttendance(player.id, 'absent')}
                      className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                        status === 'absent'
                          ? 'bg-red-500 text-white'
                          : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                      }`}
                    >
                      <X size={18} />
                      <span>Absent</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
