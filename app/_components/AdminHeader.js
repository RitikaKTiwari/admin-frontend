"use client";

import { useState, useEffect } from 'react';
import { FiBell, FiUser, FiChevronDown } from 'react-icons/fi';
import { getCurrentAdmin, adminLogout } from '../_services/api/admin';
import { usePopup } from '../_context/PopupContext';

export default function AdminHeader() {
  const [admin, setAdmin] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { showConfirm } = usePopup();

  useEffect(() => {
    setAdmin(getCurrentAdmin());
  }, []);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    const confirmed = await showConfirm('Are you sure you want to logout?', { type: 'warning' });
    if (confirmed) {
      adminLogout();
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Welcome back, {admin?.name || 'Admin'}!
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {"Here's what's happening with your store today"}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <FiBell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                <FiUser className="w-4 h-4" />
              </div>
              <FiChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 py-1 z-10">
                <div className="px-4 py-2 border-b dark:border-gray-700">
                  <p className="font-medium text-gray-900 dark:text-white">{admin?.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{admin?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}