import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardOverview from './components/DashboardOverview';
import ModuleContent from './components/ModuleContent';

function App() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleMenuSelect = (menuId: string) => {
    setActiveMenu(menuId);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activeMenu={activeMenu} 
        onMenuSelect={handleMenuSelect}
        isCollapsed={sidebarCollapsed}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-auto p-6">
          {activeMenu === 'dashboard' ? (
            <DashboardOverview />
          ) : (
            <ModuleContent moduleId={activeMenu} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;