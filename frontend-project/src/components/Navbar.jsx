import { useAuth } from '../context/AuthContext';

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-4 sm:px-6 shadow-sm">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 lg:hidden"
        aria-label="Open menu"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Brand / breadcrumb */}
      <div className="flex-1">
        <p className="text-sm text-gray-400">
          <span className="font-medium text-gray-700">SmartPark</span>
          <span className="mx-1.5">·</span>
          Stock Inventory Management System
          <span className="mx-1.5">·</span>
          Rubavu District, Rwanda
        </p>
      </div>

      {/* User pill */}
      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-gray-800">{user?.username}</p>
          <p className="text-xs text-gray-500">Stock Manager</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
          {user?.username?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
