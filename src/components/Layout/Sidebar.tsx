import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard,
  Users,
  UserCog,
  Calendar,
  Video,
  Activity,
  ClipboardCheck,
  DollarSign,
  Wallet,
  LogOut,
} from 'lucide-react';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  roles: string[];
}

const adminNavItems: NavItem[] = [
  { to: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard', roles: ['admin'] },
  { to: '/admin/players', icon: <Users size={20} />, label: 'Players', roles: ['admin'] },
  { to: '/admin/staff', icon: <UserCog size={20} />, label: 'Staff', roles: ['admin'] },
  { to: '/admin/batches', icon: <Calendar size={20} />, label: 'Batches', roles: ['admin'] },
  { to: '/admin/media', icon: <Video size={20} />, label: 'Media', roles: ['admin'] },
  { to: '/admin/yoyo-test', icon: <Activity size={20} />, label: 'Yoyo Test', roles: ['admin'] },
  { to: '/admin/attendance', icon: <ClipboardCheck size={20} />, label: 'Attendance', roles: ['admin'] },
  { to: '/admin/fees', icon: <DollarSign size={20} />, label: 'Fee Management', roles: ['admin'] },
  { to: '/admin/salary', icon: <Wallet size={20} />, label: 'Salary', roles: ['admin'] },
];

const coachNavItems: NavItem[] = [
  { to: '/coach', icon: <LayoutDashboard size={20} />, label: 'Dashboard', roles: ['coach'] },
  { to: '/coach/players', icon: <Users size={20} />, label: 'My Players', roles: ['coach'] },
  { to: '/coach/batches', icon: <Calendar size={20} />, label: 'My Batches', roles: ['coach'] },
  { to: '/coach/media', icon: <Video size={20} />, label: 'Media', roles: ['coach'] },
  { to: '/coach/yoyo-test', icon: <Activity size={20} />, label: 'Yoyo Test', roles: ['coach'] },
  { to: '/coach/attendance', icon: <ClipboardCheck size={20} />, label: 'Attendance', roles: ['coach'] },
];

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = user?.role === 'admin' ? adminNavItems : coachNavItems;

  return (
    <>
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <aside className={`fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all z-40 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center">
          <img
            src="/WhatsApp_Image_2025-11-11_at_5.32.58_PM-removebg-preview.png"
            alt="Nature Space Cricket Academy"
            className="w-full h-auto max-w-[200px]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin' || item.to === '/coach'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-green-500 to-yellow-500 text-white shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`
              }
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-yellow-600 rounded-full flex items-center justify-center text-white font-semibold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>

    {isMobileMenuOpen && (
      <div
        className="lg:hidden fixed inset-0 bg-black/50 z-30"
        onClick={() => setIsMobileMenuOpen(false)}
      />
    )}
    </>
  );
}
