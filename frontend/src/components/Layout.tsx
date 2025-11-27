import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { User } from '../types';

interface LayoutProps {
  user: User;
  darkMode: boolean;
  onLogout: () => void;
  onToggleDarkMode: () => void;
}

export default function Layout({ user, darkMode, onLogout, onToggleDarkMode }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Topbar */}
        <Topbar
          user={user}
          darkMode={darkMode}
          onLogout={onLogout}
          onToggleDarkMode={onToggleDarkMode}
        />

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}