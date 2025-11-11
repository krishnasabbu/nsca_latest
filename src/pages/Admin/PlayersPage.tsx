import { useEffect, useState } from 'react';
import { Card, CardBody } from '../../components/UI/Card';
import { Modal } from '../../components/UI/Modal';
import { Plus, Search, Edit, Trash2, Filter, Eye } from 'lucide-react';
import { api } from '../../services/api';
import { User, Batch } from '../../types';

export function PlayersPage() {
  const [players, setPlayers] = useState<User[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<User[]>([]);
  const [coaches, setCoaches] = useState<User[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBatch, setFilterBatch] = useState('');
  const [filterCoach, setFilterCoach] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<User | null>(null);
  const [viewingPlayer, setViewingPlayer] = useState<User | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterPlayers();
  }, [players, searchTerm, filterBatch, filterCoach]);

  const loadData = async () => {
    try {
      const [usersData, coachesData, batchesData] = await Promise.all([
        api.users.list(),
        api.users.getCoaches(),
        api.batches.list(),
      ]);
      const studentsList = usersData.filter((u) => u.role === 'student');
      setPlayers(studentsList);
      setCoaches(coachesData);
      setBatches(batchesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPlayers = () => {
    let filtered = players;

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(p.phone || '').includes(searchTerm)
      );
    }

    if (filterBatch) {
      filtered = filtered.filter((p) => p.batchId === filterBatch);
    }

    if (filterCoach) {
      filtered = filtered.filter((p) => p.assignedCoachId === filterCoach);
    }

    setFilteredPlayers(filtered);
  };

  const handleOpenModal = (player?: User) => {
    setEditingPlayer(player || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPlayer(null);
  };

  const handleDeletePlayer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this player?')) return;

    try {
      await api.users.delete(id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete player:', error);
      alert('Failed to delete player');
    }
  };


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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Players Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all players in the academy
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-yellow-500 text-white rounded-lg hover:from-green-700 hover:to-yellow-600 transition-all transform hover:scale-105"
        >
          <Plus size={20} />
          <span>Add Player</span>
        </button>
      </div>

      <Card>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <select
                value={filterBatch}
                onChange={(e) => setFilterBatch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
              >
                <option value="">All Batches</option>
                {batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <select
                value={filterCoach}
                onChange={(e) => setFilterCoach(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
              >
                <option value="">All Coaches</option>
                {coaches.map((coach) => (
                  <option key={coach.id} value={coach.id}>
                    {coach.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
              Showing {filteredPlayers.length} of {players.length} players
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    Phone
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    Batch
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    Coach
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((player) => {
                  const coach = coaches.find((c) => c.id === player.assignedCoachId);
                  return (
                    <tr
                      key={player.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {player.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {player.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {player.phone}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {batches.find((b) => b.id === player.batchId)?.name || '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {coach?.name || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            player.status === 'active'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                          }`}
                        >
                          {player.status || 'active'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => { setViewingPlayer(player); setIsViewModalOpen(true); }}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="View Profile"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleOpenModal(player)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeletePlayer(player.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
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

      <PlayerFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        player={editingPlayer}
        coaches={coaches}
        batches={batches}
        onSuccess={loadData}
      />

      <PlayerProfileModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        player={viewingPlayer}
        coach={coaches.find((c) => c.id === viewingPlayer?.assignedCoachId)}
        batch={batches.find((b) => b.id === viewingPlayer?.batchId)}
      />
    </div>
  );
}

interface PlayerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: User | null;
  coaches: User[];
  batches: Batch[];
  onSuccess: () => void;
}

function PlayerFormModal({ isOpen, onClose, player, coaches, batches, onSuccess }: PlayerFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    age: '',
    batchId: '',
    fatherName: '',
    motherName: '',
    altPhone: '',
    coachingType: '',
    monthlyFee: '',
    assignedCoachId: '',
    battingStyle: '',
    bowlingStyle: '',
    skillLevel: '',
    status: 'active',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (player) {
      setFormData({
        name: player.name || '',
        phone: player.phone || '',
        email: player.email || '',
        password: '',
        age: player.age || '',
        batchId: player.batchId || '',
        fatherName: player.fatherName || '',
        motherName: player.motherName || '',
        altPhone: player.altPhone || '',
        coachingType: player.coachingType || '',
        monthlyFee: player.monthlyFee?.toString() || '',
        assignedCoachId: player.assignedCoachId || '',
        battingStyle: player.battingStyle || '',
        bowlingStyle: player.bowlingStyle || '',
        skillLevel: player.skillLevel || '',
        status: player.status || 'active',
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        password: '',
        age: '',
        batchId: '',
        fatherName: '',
        motherName: '',
        altPhone: '',
        coachingType: '',
        monthlyFee: '',
        assignedCoachId: '',
        battingStyle: '',
        bowlingStyle: '',
        skillLevel: '',
        status: 'active',
      });
    }
  }, [player]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (player) {
        await api.users.upsert({
          id: player.id,
          ...formData,
          role: 'student' as const,
          status: formData.status as 'active' | 'inactive',
        });
      } else {
        await api.users.create({
          ...formData,
          role: 'student' as const,
          status: formData.status as 'active' | 'inactive',
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save player:', error);
      alert('Failed to save player');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={player ? 'Edit Player' : 'Add New Player'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {!player && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required={!player}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Age
            </label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Batch
            </label>
            <select
              value={formData.batchId}
              onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select Batch</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Assigned Coach
            </label>
            <select
              value={formData.assignedCoachId}
              onChange={(e) => setFormData({ ...formData, assignedCoachId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select Coach</option>
              {coaches.map((coach) => (
                <option key={coach.id} value={coach.id}>
                  {coach.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Batting Style
            </label>
            <select
              value={formData.battingStyle}
              onChange={(e) => setFormData({ ...formData, battingStyle: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select Style</option>
              <option value="Right-handed">Right-handed</option>
              <option value="Left-handed">Left-handed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bowling Style
            </label>
            <select
              value={formData.bowlingStyle}
              onChange={(e) => setFormData({ ...formData, bowlingStyle: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select Style</option>
              <option value="Fast">Fast</option>
              <option value="Medium">Medium</option>
              <option value="Spin">Spin</option>
              <option value="None">None</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Skill Level
            </label>
            <select
              value={formData.skillLevel}
              onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select Level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Father's Name
            </label>
            <input
              type="text"
              value={formData.fatherName}
              onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mother's Name
            </label>
            <input
              type="text"
              value={formData.motherName}
              onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Alternative Phone
            </label>
            <input
              type="tel"
              value={formData.altPhone}
              onChange={(e) => setFormData({ ...formData, altPhone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Coaching Type
            </label>
            <select
              value={formData.coachingType}
              onChange={(e) => setFormData({ ...formData, coachingType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select Type</option>
              <option value="Normal">Normal</option>
              <option value="Special">Special</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Monthly Fee (₹)
            </label>
            <input
              type="number"
              value={formData.monthlyFee}
              onChange={(e) => setFormData({ ...formData, monthlyFee: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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
            {loading ? 'Saving...' : player ? 'Update Player' : 'Add Player'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

interface PlayerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: User | null;
  coach?: User;
  batch?: Batch;
}

function PlayerProfileModal({ isOpen, onClose, player, coach, batch }: PlayerProfileModalProps) {
  if (!player) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Player Profile" size="lg">
      <div className="space-y-6">
        <div className="flex items-center space-x-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-3xl">
            {player.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{player.name}</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              player.status === 'active'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
            }`}>
              {player.status || 'active'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Phone</h3>
            <p className="text-gray-900 dark:text-white">{player.phone}</p>
          </div>

          {player.altPhone && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Alternative Phone</h3>
              <p className="text-gray-900 dark:text-white">{player.altPhone}</p>
            </div>
          )}

          {player.email && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Email</h3>
              <p className="text-gray-900 dark:text-white">{player.email}</p>
            </div>
          )}

          {player.age && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Age</h3>
              <p className="text-gray-900 dark:text-white">{player.age} years</p>
            </div>
          )}

          {player.fatherName && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Father's Name</h3>
              <p className="text-gray-900 dark:text-white">{player.fatherName}</p>
            </div>
          )}

          {player.motherName && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Mother's Name</h3>
              <p className="text-gray-900 dark:text-white">{player.motherName}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Batch</h3>
            <p className="text-gray-900 dark:text-white">{batch?.name || '-'}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Coach</h3>
            <p className="text-gray-900 dark:text-white">{coach?.name || '-'}</p>
          </div>

          {player.coachingType && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Coaching Type</h3>
              <p className="text-gray-900 dark:text-white">{player.coachingType}</p>
            </div>
          )}

          {player.monthlyFee !== undefined && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Monthly Fee</h3>
              <p className="text-gray-900 dark:text-white">₹{player.monthlyFee}</p>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cricket Details</h3>
          <div className="grid grid-cols-2 gap-6">
            {player.battingStyle && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Batting Style</h3>
                <p className="text-gray-900 dark:text-white">{player.battingStyle}</p>
              </div>
            )}

            {player.bowlingStyle && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Bowling Style</h3>
                <p className="text-gray-900 dark:text-white">{player.bowlingStyle}</p>
              </div>
            )}

            {player.skillLevel && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Skill Level</h3>
                <p className="text-gray-900 dark:text-white">{player.skillLevel}</p>
              </div>
            )}

            {player.fitnessLevel && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Fitness Level</h3>
                <p className="text-gray-900 dark:text-white">{player.fitnessLevel}</p>
              </div>
            )}
          </div>
        </div>

        {player.joinDate && (
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Join Date</h3>
            <p className="text-gray-900 dark:text-white">{new Date(player.joinDate).toLocaleDateString()}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
