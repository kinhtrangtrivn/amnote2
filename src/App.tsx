import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardOverview from './components/DashboardOverview';
import ModuleContent from './components/ModuleContent';
import LoginPage from './components/LoginPage';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if screen is mobile size
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // On mobile, sidebar should be closed by default
      if (mobile) {
        setSidebarOpen(false);
        setSidebarCollapsed(false); // Reset collapsed state on mobile
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveMenu('dashboard'); // Reset to dashboard when logging out
  };

  const handleMenuSelect = (menuId: string) => {
    setActiveMenu(menuId);
    // Close sidebar on mobile after menu selection
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 relative">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobile 
          ? `fixed left-0 top-0 h-full z-50 transform transition-transform duration-300 ease-in-out ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`
          : `relative transition-all duration-300 ease-in-out ${
              sidebarCollapsed ? 'w-16' : 'w-64'
            }`
        }
      `}>
        <Sidebar 
          activeMenu={activeMenu} 
          onMenuSelect={handleMenuSelect}
          isCollapsed={!isMobile && sidebarCollapsed}
          isMobile={isMobile}
        />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onToggleSidebar={toggleSidebar} 
          onLogout={handleLogout}
          onMenuSelect={handleMenuSelect}
        />
        
        <main className="flex-1 overflow-auto p-6">
          {activeMenu === 'dashboard' && <DashboardOverview />}
          {activeMenu !== 'dashboard' && activeMenu !== 'cost-center' && (
            <ModuleContent moduleId={activeMenu} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;