"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiHome, 
  FiPackage, 
  FiShoppingBag, 
  FiUsers,
  FiLogOut
} from 'react-icons/fi';
import { adminLogout } from '../_services/api/admin';

const menuItems = [
  { href: '/dashboard', icon: FiHome, label: 'Dashboard' },
  { href: '/products', icon: FiPackage, label: 'Products' },
  { href: '/orders', icon: FiShoppingBag, label: 'Orders' },
  { href: '/users', icon: FiUsers, label: 'Users' },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      adminLogout();
    }
  };

  return (
    <aside className="bg-gray-900 text-white w-64 min-h-screen p-4 flex flex-col">
      <div className="mb-8 px-2">
        <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
        <p className="text-gray-400 text-sm">Manage your store</p>
      </div>

      <nav className="flex-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-800 pt-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition"
        >
          <FiLogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}