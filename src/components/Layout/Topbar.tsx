import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

export function Topbar() {
  const { theme, setTheme } = useThemeStore();

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
    </header>
  );
}
