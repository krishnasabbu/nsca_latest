import { useEffect, useState } from 'react';
import { Card, CardBody } from '../../components/UI/Card';
import { Calendar, Check, X, Clock, Users } from 'lucide-react';
import { api } from '../../services/api';
import { Attendance, User, Batch } from '../../types';
import { useAuthStore } from '../../store/authStore';

export function AttendancePage() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [players, setPlayers] = useState<User[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [bulkStatus, setBulkStatus] = useState<'present' | 'absent' | 'late'>('present');
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [attendanceData, usersData, batchesData] = await Promise.all([
        api.attendance.list(),
        api.users.list(),
        api.batches.list(),
      ]);
      setAttendance(attendanceData);
      setPlayers(usersData.filter((u) => u.role === 'student'));
      setBatches(batchesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (playerId: string, status: 'present' | 'absent' | 'late') => {
    try {
      const existing = attendance.find((a) => a.userId === playerId && a.date === selectedDate);
      const player = players.find((p) => p.id === playerId);

      if (existing) {
        await api.attendance.update({
          id: existing.id,
          status,
          date: selectedDate,
          userId: playerId,
          markedBy: user?.id || '',
          batchId: player?.batchId || ''
        });
      } else {
        await api.attendance.create({
          date: selectedDate,
          userId: playerId,
          status,
          markedBy: user?.id || '',
          batchId: player?.batchId || ''
        });
      }
      await loadData();
    } catch (error) {
      console.error('Failed to mark attendance:', error);
    }
  };

  const markBulkAttendance = async () => {
    if (!confirm(`Mark all displayed students as ${bulkStatus}?`)) return;

    try {
      const filteredPlayersList = getFilteredPlayers();

      for (const player of filteredPlayersList) {
        const existing = attendance.find((a) => a.userId === player.id && a.date === selectedDate);

        if (existing) {
          await api.attendance.update({
            id: existing.id,
            status: bulkStatus,
            date: selectedDate,
            userId: player.id,
            markedBy: user?.id || '',
            batchId: player.batchId || ''
          });
        } else {
          await api.attendance.create({
            date: selectedDate,
            userId: player.id,
            status: bulkStatus,
            markedBy: user?.id || '',
            batchId: player.batchId || ''
          });
        }
      }

      await loadData();
      alert('Bulk attendance marked successfully!');
    } catch (error) {
      console.error('Failed to mark bulk attendance:', error);
      alert('Failed to mark bulk attendance');
    }
  };

  const getAttendanceStatus = (playerId: string) => {
    const record = attendance.find((a) => a.userId === playerId && a.date === selectedDate);
    return record?.status;
  };

  const getFilteredPlayers = () => {
    if (selectedBatch === 'all') {
      return players;
    }
    return players.filter((p) => p.batchId === selectedBatch);
  };

  const filteredPlayers = getFilteredPlayers();
  const presentCount = filteredPlayers.filter((p) => getAttendanceStatus(p.id) === 'present').length;
  const absentCount = filteredPlayers.filter((p) => getAttendanceStatus(p.id) === 'absent').length;
  const lateCount = filteredPlayers.filter((p) => getAttendanceStatus(p.id) === 'late').length;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Attendance Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Mark and track daily attendance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredPlayers.length}</p>
              </div>
              <Users className="text-gray-400" size={32} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Present</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{presentCount}</p>
              </div>
              <Check className="text-green-500" size={32} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Late</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{lateCount}</p>
              </div>
              <Clock className="text-yellow-500" size={32} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Absent</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{absentCount}</p>
              </div>
              <X className="text-red-500" size={32} />
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody>
          <div className="mb-6 space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="text-green-500" size={24} />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Users className="text-green-500" size={24} />
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Batches</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Bulk Mark as:
                </label>
                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value as 'present' | 'absent' | 'late')}
                  className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                >
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="absent">Absent</option>
                </select>
              </div>

              <button
                onClick={markBulkAttendance}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-yellow-500 text-white rounded-lg hover:from-green-700 hover:to-yellow-600 transition-all font-medium"
              >
                Mark All {selectedBatch !== 'all' && batches.find((b) => b.id === selectedBatch)?.name} Students
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {filteredPlayers.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No students found for the selected batch.
              </div>
            ) : (
              filteredPlayers.map((player) => {
                const status = getAttendanceStatus(player.id);
                const playerBatch = batches.find((b) => b.id === player.batchId);

                return (
                  <div key={player.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {player.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{player.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{playerBatch?.name || 'No Batch'}</p>
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
              })
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
