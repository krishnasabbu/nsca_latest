import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Sidebar />
      <Topbar />
      <main className="ml-0 lg:ml-64 mt-16 p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}
