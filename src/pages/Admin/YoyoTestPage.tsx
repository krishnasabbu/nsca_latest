import { useEffect, useState } from 'react';
import { Card, CardBody } from '../../components/UI/Card';
import { Modal } from '../../components/UI/Modal';
import { Plus, Edit, Trash2, TrendingUp } from 'lucide-react';
import { api } from '../../services/api';
import { YoyoTestResult, User } from '../../types';

export function YoyoTestPage() {
  const [results, setResults] = useState<YoyoTestResult[]>([]);
  const [players, setPlayers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<YoyoTestResult | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [resultsData, usersData] = await Promise.all([
        api.yoyoTest.list(),
        api.users.list(),
      ]);
      setResults(resultsData);
      setPlayers(usersData.filter((u) => u.role === 'student'));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this result?')) return;
    try {
      await api.yoyoTest.delete(id);
      await loadData();
    } catch (error) {
      alert('Failed to delete result');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Yoyo Test Results</h1>
          <p className="text-gray-600 dark:text-gray-400">Track player fitness performance</p>
        </div>
        <button onClick={() => { setEditingResult(null); setIsModalOpen(true); }} className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-yellow-500 text-white rounded-lg hover:from-green-700 hover:to-yellow-600">
          <Plus size={20} />
          <span>Add Result</span>
        </button>
      </div>

      <Card>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Player</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Test Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Level</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Shuttles</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Distance (m)</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Score</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => {
                  const player = players.find((p) => p.id === result.userId);
                  return (
                    <tr key={result.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{player?.name || result.userName}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{result.testDate}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{result.level}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{result.shuttles}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{result.distance}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <TrendingUp size={16} className="text-green-500" />
                          <span className="font-semibold text-gray-900 dark:text-white">{result.score}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button onClick={() => { setEditingResult(result); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><Edit size={18} /></button>
                          <button onClick={() => handleDelete(result.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 size={18} /></button>
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

      <YoyoTestFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} result={editingResult} players={players} onSuccess={loadData} />
    </div>
  );
}

function YoyoTestFormModal({ isOpen, onClose, result, players, onSuccess }: any) {
  const [formData, setFormData] = useState({ userId: '', testDate: '', level: 0, shuttles: 0, distance: 0, score: 0, remarks: '' });

  useEffect(() => {
    if (result) {
      setFormData({ userId: result.userId || '', testDate: result.testDate || '', level: result.level || 0, shuttles: result.shuttles || 0, distance: result.distance || 0, score: result.score || 0, remarks: result.remarks || '' });
    } else {
      setFormData({ userId: '', testDate: new Date().toISOString().split('T')[0], level: 0, shuttles: 0, distance: 0, score: 0, remarks: '' });
    }
  }, [result]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (result) {
        await api.yoyoTest.update({ id: result.id, ...formData });
      } else {
        await api.yoyoTest.create(formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      alert('Failed to save result');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={result ? 'Edit Result' : 'Add Result'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Player *</label>
          <select value={formData.userId} onChange={(e) => setFormData({ ...formData, userId: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500" required>
            <option value="">Select Player</option>
            {players.map((player: User) => <option key={player.id} value={player.id}>{player.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Test Date *</label>
            <input type="date" value={formData.testDate} onChange={(e) => setFormData({ ...formData, testDate: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Level</label>
            <input type="number" value={formData.level} onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Shuttles</label>
            <input type="number" value={formData.shuttles} onChange={(e) => setFormData({ ...formData, shuttles: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Distance (m)</label>
            <input type="number" value={formData.distance} onChange={(e) => setFormData({ ...formData, distance: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Score</label>
            <input type="number" value={formData.score} onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Remarks</label>
          <textarea value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} rows={3} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"></textarea>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
          <button type="submit" className="px-6 py-2 bg-gradient-to-r from-green-600 to-yellow-500 text-white rounded-lg hover:from-green-700 hover:to-yellow-600">{result ? 'Update' : 'Add'} Result</button>
        </div>
      </form>
    </Modal>
  );
}
