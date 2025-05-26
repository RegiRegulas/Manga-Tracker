// client/src/components/Sidebar.jsx
import React from 'react';

const Sidebar = ({ onTabChange, onLogout }) => {
  return (
    <aside className="w-64 h-screen bg-gray-900 text-white flex flex-col p-4">
      <h2 className="text-xl font-bold mb-6">Manga Tracker</h2>
      <nav className="flex flex-col gap-4 flex-grow">
        <button
          className="text-left hover:text-gray-300"
          onClick={() => onTabChange('library')}
        >
          📚 Library
        </button>
        <button
          className="text-left hover:text-gray-300"
          onClick={() => onTabChange('add')}
        >
          ➕ Add Manga
        </button>
      </nav>
      <button
        onClick={onLogout}
        className="mt-auto bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
      >
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
