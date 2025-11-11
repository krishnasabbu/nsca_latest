import { Sun, Moon, Monitor, RefreshCw } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useState } from 'react';
import { api } from '../../services/api';

export function Topbar() {
  const { theme, setTheme } = useThemeStore();
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<number | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await Promise.all([
        api.users.list(true),
        api.batches.list(true),
        api.content.list(true),
        api.attendance.list(true),
        api.yoyoTest.list(true),
        api.fees.list(true),
        api.analytics.getOverview(true),
      ]);
      setLastSync(Date.now());
      alert('Data synced successfully!');
    } catch (error) {
      console.error('Sync failed:', error);
      alert('Sync failed. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const formatLastSync = () => {
    if (!lastSync) return 'Never';
    const seconds = Math.floor((Date.now() - lastSync) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const themes = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
    { value: 'system' as const, icon: Monitor, label: 'System' },
  ];

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-16 lg:px-6 transition-colors z-10">
      <div className="hidden md:block">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Welcome Back!
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Manage your cricket academy efficiently
        </p>
      </div>
      <div className="md:hidden">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">
          Nature Space CA
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-yellow-500 text-white rounded-lg hover:from-green-700 hover:to-yellow-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title="Sync data from Google Sheets"
        >
          <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
          <span className="hidden sm:inline text-sm font-medium">
            {syncing ? 'Syncing...' : 'Sync'}
          </span>
        </button>

        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {themes.map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`p-2 rounded-md transition-colors ${
                theme === value
                  ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-yellow-500 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              title={label}
            >
              <Icon size={18} />
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
