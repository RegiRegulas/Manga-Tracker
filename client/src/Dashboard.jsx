// client/src/Dashboard.jsx
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Library from './components/Library';
import AddMangaForm from './components/AddMangaForm';

const Dashboard = ({ onLogout }) => {
  // activeTab controls which component is shown ('library' or 'add')
  const [activeTab, setActiveTab] = useState('library');
  // refreshFlag toggles to trigger Library re-fetch on new additions
  const [refreshFlag, setRefreshFlag] = useState(false);

  // Called when AddMangaForm successfully adds a manga
  const handleAdded = () => {
    setRefreshFlag(flag => !flag);
    setActiveTab('library');
  };

  // Render main content based on activeTab
  const renderContent = () => {
    switch (activeTab) {
      case 'library':
        return <Library refreshFlag={refreshFlag} />;
      case 'add':
        return <AddMangaForm onAdded={handleAdded} />;
      default:
        return <Library refreshFlag={refreshFlag} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar for navigation */}
      <Sidebar onTabChange={setActiveTab} onLogout={onLogout} />

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto p-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
