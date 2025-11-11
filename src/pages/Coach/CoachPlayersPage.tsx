import { useEffect, useState } from 'react';
import { Card, CardBody } from '../../components/UI/Card';
import { Modal } from '../../components/UI/Modal';
import { Plus, Edit } from 'lucide-react';
import { api } from '../../services/api';
import { User } from '../../types';
import { useAuthStore } from '../../store/authStore';

export function CoachPlayersPage() {
  const [players, setPlayers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<User | null>(null);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      if (user?.id) {
        const data = await api.users.getCoachStudents(user.id);
        setPlayers(data);
      }
    } catch (error) {
      console.error('Failed to load players:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Players</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your assigned players</p>
        </div>
        <button onClick={() => { setEditingPlayer(null); setIsModalOpen(true); }} className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-yellow-500 text-white rounded-lg hover:from-green-700 hover:to-yellow-600">
          <Plus size={20} />
          <span>Add Player</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {players.map((player) => (
          <Card key={player.id}>
            <CardBody>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {player.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{player.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{player.batch || 'No Batch'}</p>
                  </div>
                </div>
                <button onClick={() => { setEditingPlayer(player); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                  <Edit size={16} />
                </button>
              </div>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>📞 {player.phone}</p>
                {player.battingStyle && <p>🏏 {player.battingStyle}</p>}
                {player.bowlingStyle && <p>⚡ {player.bowlingStyle}</p>}
                {player.skillLevel && <p>📊 {player.skillLevel}</p>}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <PlayerFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} player={editingPlayer} onSuccess={loadPlayers} coachId={user?.id || ''} />
    </div>
  );
}

function PlayerFormModal({ isOpen, onClose, player, onSuccess, coachId }: any) {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', password: '', age: '', batch: '', battingStyle: '', bowlingStyle: '', skillLevel: '' });

  useEffect(() => {
    if (player) {
      setFormData({ name: player.name || '', phone: player.phone || '', email: player.email || '', password: '', age: player.age || '', batch: player.batch || '', battingStyle: player.battingStyle || '', bowlingStyle: player.bowlingStyle || '', skillLevel: player.skillLevel || '' });
    } else {
      setFormData({ name: '', phone: '', email: '', password: '', age: '', batch: '', battingStyle: '', bowlingStyle: '', skillLevel: '' });
    }
  }, [player]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (player) {
        await api.users.upsert({ id: player.id, ...formData, role: 'student', assignedCoachId: coachId });
      } else {
        await api.users.create({ ...formData, role: 'student', assignedCoachId: coachId });
      }
      onSuccess();
      onClose();
    } catch (error) {
      alert('Failed to save player');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={player ? 'Edit Player' : 'Add Player'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone *</label><input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500" /></div>
          {!player && <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password *</label><input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500" required /></div>}
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Age</label><input type="number" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Batch</label><input type="text" value={formData.batch} onChange={(e) => setFormData({ ...formData, batch: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Batting Style</label><select value={formData.battingStyle} onChange={(e) => setFormData({ ...formData, battingStyle: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"><option value="">Select</option><option value="Right-handed">Right-handed</option><option value="Left-handed">Left-handed</option></select></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bowling Style</label><select value={formData.bowlingStyle} onChange={(e) => setFormData({ ...formData, bowlingStyle: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"><option value="">Select</option><option value="Fast">Fast</option><option value="Medium">Medium</option><option value="Spin">Spin</option></select></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Skill Level</label><select value={formData.skillLevel} onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"><option value="">Select</option><option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option></select></div>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
          <button type="submit" className="px-6 py-2 bg-gradient-to-r from-green-600 to-yellow-500 text-white rounded-lg hover:from-green-700 hover:to-yellow-600">{player ? 'Update' : 'Add'} Player</button>
        </div>
      </form>
    </Modal>
  );
}
