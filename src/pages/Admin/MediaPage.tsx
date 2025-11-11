import { useEffect, useState } from 'react';
import { Card, CardBody } from '../../components/UI/Card';
import { Modal } from '../../components/UI/Modal';
import { Plus, Video, Image as ImageIcon, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { Content } from '../../types';
import { useAuthStore } from '../../store/authStore';

export function MediaPage() {
  const [media, setMedia] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      const data = await api.content.list();
      setMedia(data);
    } catch (error) {
      console.error('Failed to load media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this media?')) return;
    try {
      await api.content.delete(id);
      await loadMedia();
    } catch (error) {
      alert('Failed to delete media');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Media Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Upload and manage training videos and photos</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-yellow-500 text-white rounded-lg hover:from-green-700 hover:to-yellow-600">
          <Plus size={20} />
          <span>Upload Media</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {media.map((item) => (
          <Card key={item.id}>
            <CardBody className="p-0">
              <div className="relative">
                <div className="w-full h-48 bg-gradient-to-br from-green-100 to-yellow-100 dark:from-green-900/30 dark:to-yellow-900/30 flex items-center justify-center">
                  {item.type === 'video' ? <Video size={48} className="text-green-500" /> : <ImageIcon size={48} className="text-yellow-500" />}
                </div>
                <button onClick={() => handleDelete(item.id)} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{item.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                  <span className="capitalize">{item.type}</span>
                  <span>{item.uploadDate}</span>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <MediaFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={loadMedia} userId={user?.id || ''} />
    </div>
  );
}

function MediaFormModal({ isOpen, onClose, onSuccess, userId }: any) {
  const [formData, setFormData] = useState({ title: '', description: '', type: 'video', url: '', batchId: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.content.create({ ...formData, type: formData.type as 'video' | 'photo' | 'document', uploadDate: new Date().toISOString().split('T')[0], uploadedBy: userId });
      onSuccess();
      onClose();
      setFormData({ title: '', description: '', type: 'video', url: '', batchId: '' });
    } catch (error) {
      alert('Failed to upload media');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Media">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title *</label>
          <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type *</label>
          <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500">
            <option value="video">Video</option>
            <option value="photo">Photo</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">URL *</label>
          <input type="url" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
          <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"></textarea>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
          <button type="submit" className="px-6 py-2 bg-gradient-to-r from-green-600 to-yellow-500 text-white rounded-lg hover:from-green-700 hover:to-yellow-600">Upload</button>
        </div>
      </form>
    </Modal>
  );
}
