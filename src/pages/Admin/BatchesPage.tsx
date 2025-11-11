import { useEffect, useState } from 'react';
import { Card, CardBody } from '../../components/UI/Card';
import { Modal } from '../../components/UI/Modal';
import { Plus, Edit, Trash2, Users, Calendar } from 'lucide-react';
import { api } from '../../services/api';
import { Batch, User } from '../../types';

export function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [coaches, setCoaches] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [viewingBatch, setViewingBatch] = useState<Batch | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [batchesData, coachesData, usersData] = await Promise.all([
        api.batches.list(),
        api.users.getCoaches(),
        api.users.list(),
      ]);
      setAllUsers(usersData);
      const batchesWithCounts = batchesData.map((b) => ({
        ...b,
        studentCount: usersData.filter((u) => u.batchId === b.id).length,
      }));
      setBatches(batchesWithCounts);
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
                    <button
                      onClick={() => { setViewingBatch(batch); setIsStudentsModalOpen(true); }}
                      className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                      title="View Students"
                    >
                      <Users size={16} />
                    </button>
                    <button onClick={() => { setEditingBatch(batch); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(batch.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Users size={16} className="text-green-500" />
                    <span>{(batch as any).studentCount || 0} Students</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} className="text-yellow-500" />
                    <span>{batch.schedule}</span>
                  </div>
                  <div className="text-gray-900 dark:text-white font-semibold">
                    Coach: {batch.coach || coach?.name || 'Not Assigned'}
                  </div>
                  {batch.description && (
                    <div className="text-gray-600 dark:text-gray-400 text-xs">
                      {batch.description}
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <BatchFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} batch={editingBatch} coaches={coaches} onSuccess={loadData} />

      <BatchStudentsModal
        isOpen={isStudentsModalOpen}
        onClose={() => setIsStudentsModalOpen(false)}
        batch={viewingBatch}
        students={allUsers.filter((u) => u.batchId === viewingBatch?.id)}
      />
    </div>
  );
}

function BatchFormModal({ isOpen, onClose, batch, coaches, onSuccess }: any) {
  const [formData, setFormData] = useState({ name: '', schedule: '', coachId: '', coach: '', status: 'active', description: '' });

  useEffect(() => {
    if (batch) {
      setFormData({
        name: batch.name || '',
        schedule: batch.schedule || '',
        coachId: batch.coachId || '',
        coach: batch.coach || '',
        status: batch.status || 'active',
        description: batch.description || ''
      });
    } else {
      setFormData({ name: '', schedule: '', coachId: '', coach: '', status: 'active', description: '' });
    }
  }, [batch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedCoach = coaches.find((c: User) => c.id === formData.coachId);
      const submitData = {
        ...formData,
        coach: selectedCoach?.name || formData.coach,
        status: formData.status as 'active' | 'inactive'
      };

      if (batch) {
        await api.batches.update({ id: batch.id, ...submitData });
      } else {
        await api.batches.create(submitData);
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Schedule *</label>
            <input type="text" placeholder="e.g., Mon-Fri 6-8 PM" value={formData.schedule} onChange={(e) => setFormData({ ...formData, schedule: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Coach *</label>
            <select value={formData.coachId} onChange={(e) => setFormData({ ...formData, coachId: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500" required>
              <option value="">Select Coach</option>
              {coaches.map((coach: User) => <option key={coach.id} value={coach.id}>{coach.name}</option>)}
            </select>
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
          <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500" placeholder="Brief description of the batch"></textarea>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
          <button type="submit" className="px-6 py-2 bg-gradient-to-r from-green-600 to-yellow-500 text-white rounded-lg hover:from-green-700 hover:to-yellow-600">{batch ? 'Update' : 'Create'} Batch</button>
        </div>
      </form>
    </Modal>
  );
}

interface BatchStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: Batch | null;
  students: User[];
}

function BatchStudentsModal({ isOpen, onClose, batch, students }: BatchStudentsModalProps) {
  if (!batch) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Students in ${batch.name}`} size="lg">
      <div className="space-y-4">
        <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Total Students: <span className="font-semibold text-gray-900 dark:text-white">{students.length}</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Schedule: <span className="font-medium text-gray-900 dark:text-white">{batch.schedule}</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Coach: <span className="font-medium text-gray-900 dark:text-white">{batch.coach}</span>
            </div>
          </div>
          {batch.description && (
            <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
              {batch.description}
            </div>
          )}
        </div>

        {students.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No students enrolled in this batch yet.
          </div>
        ) : (
          <div className="space-y-3">
            {students.map((student) => (
              <div
                key={student.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {student.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{student.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{student.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {student.skillLevel || 'N/A'}
                    </p>
                    {student.coachingType && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{student.coachingType}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
