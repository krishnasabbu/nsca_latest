import { useEffect, useState } from 'react';
import { Card, CardBody } from '../../components/UI/Card';
import { Modal } from '../../components/UI/Modal';
import { Plus, Edit, Trash2, Users, Calendar } from 'lucide-react';
import { api } from '../../services/api';
import { Batch, User } from '../../types';

export function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [coaches, setCoaches] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [batchesData, coachesData] = await Promise.all([
        api.batches.list(),
        api.users.getCoaches(),
      ]);
      setBatches(batchesData);
      setCoaches(coachesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this batch?')) return;
    try {
      await api.batches.delete(id);
      await loadData();
    } catch (error) {
      alert('Failed to delete batch');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Batch Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Create and manage training batches</p>
        </div>
        <button onClick={() => { setEditingBatch(null); setIsModalOpen(true); }} className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-yellow-500 text-white rounded-lg hover:from-green-700 hover:to-yellow-600">
          <Plus size={20} />
          <span>Create Batch</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {batches.map((batch) => {
          const coach = coaches.find((c) => c.id === batch.coachId);
          return (
            <Card key={batch.id}>
              <CardBody>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{batch.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${batch.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'}`}>{batch.status}</span>
                  </div>
                  <div className="flex space-x-1">
                    <button onClick={() => { setEditingBatch(batch); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(batch.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Users size={16} className="text-green-500" />
                    <span>{batch.students} Students</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} className="text-yellow-500" />
                    <span>{batch.schedule}</span>
                  </div>
                  <div className="text-gray-900 dark:text-white font-semibold">
                    Coach: {coach?.name || 'Not Assigned'}
                  </div>
                  <div className="text-gray-900 dark:text-white font-semibold">
                    Fee: ₹{batch.fees}
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <BatchFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} batch={editingBatch} coaches={coaches} onSuccess={loadData} />
    </div>
  );
}

function BatchFormModal({ isOpen, onClose, batch, coaches, onSuccess }: any) {
  const [formData, setFormData] = useState({ name: '', schedule: '', coachId: '', students: 0, fees: 0, startDate: '', status: 'active', description: '' });

  useEffect(() => {
    if (batch) {
      setFormData({ name: batch.name || '', schedule: batch.schedule || '', coachId: batch.coachId || '', students: batch.students || 0, fees: batch.fees || 0, startDate: batch.startDate || '', status: batch.status || 'active', description: batch.description || '' });
    } else {
      setFormData({ name: '', schedule: '', coachId: '', students: 0, fees: 0, startDate: '', status: 'active', description: '' });
    }
  }, [batch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (batch) {
        await api.batches.update({ id: batch.id, ...formData, status: formData.status as 'active' | 'inactive' });
      } else {
        await api.batches.create({ ...formData, status: formData.status as 'active' | 'inactive' });
      }
      onSuccess();
      onClose();
    } catch (error) {
      alert('Failed to save batch');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={batch ? 'Edit Batch' : 'Create Batch'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Batch Name *</label>
          <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Schedule</label>
            <input type="text" placeholder="e.g., Mon-Fri 6-8 PM" value={formData.schedule} onChange={(e) => setFormData({ ...formData, schedule: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Coach</label>
            <select value={formData.coachId} onChange={(e) => setFormData({ ...formData, coachId: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500">
              <option value="">Select Coach</option>
              {coaches.map((coach: User) => <option key={coach.id} value={coach.id}>{coach.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Students</label>
            <input type="number" value={formData.students} onChange={(e) => setFormData({ ...formData, students: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Monthly Fee (₹)</label>
            <input type="number" value={formData.fees} onChange={(e) => setFormData({ ...formData, fees: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
            <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
          <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"></textarea>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
          <button type="submit" className="px-6 py-2 bg-gradient-to-r from-green-600 to-yellow-500 text-white rounded-lg hover:from-green-700 hover:to-yellow-600">{batch ? 'Update' : 'Create'} Batch</button>
        </div>
      </form>
    </Modal>
  );
}
