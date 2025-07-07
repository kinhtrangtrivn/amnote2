import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardOverview from './components/DashboardOverview';
import ModuleContent from './components/ModuleContent';
import LoginPage from './components/LoginPage';
import CostObjectPage from './components/CostObjectPage';

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Get current active menu from URL
  const getActiveMenuFromPath = (pathname: string) => {
    if (pathname === '/') return 'dashboard';
    return pathname.substring(1); // Remove leading slash
  };

  const activeMenu = getActiveMenuFromPath(location.pathname);

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
    navigate('/'); // Navigate to dashboard after login
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate('/login');
  };

  const handleMenuSelect = (menuId: string) => {
    // Navigate to the corresponding route
    if (menuId === 'dashboard') {
      navigate('/');
    } else {
      navigate(`/${menuId}`);
    }
    
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
          <Routes>
            <Route path="/" element={<DashboardOverview />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/cost-center" element={<CostObjectPage />} />
            <Route path="/bank-management" element={<ModuleContent moduleId="bank-management" />} />
            <Route path="/company-management" element={<ModuleContent moduleId="company-management" />} />
            <Route path="/profile" element={<ModuleContent moduleId="profile" />} />
            <Route path="/help-support" element={<ModuleContent moduleId="help-support" />} />
            
            {/* All other routes */}
            <Route path="/basic-data" element={<ModuleContent moduleId="basic-data" />} />
            <Route path="/user-management" element={<ModuleContent moduleId="user-management" />} />
            <Route path="/customer-management" element={<ModuleContent moduleId="customer-management" />} />
            <Route path="/code-registration" element={<ModuleContent moduleId="code-registration" />} />
            <Route path="/account-management" element={<ModuleContent moduleId="account-management" />} />
            <Route path="/warehouse-management" element={<ModuleContent moduleId="warehouse-management" />} />
            <Route path="/warehouse-category" element={<ModuleContent moduleId="warehouse-category" />} />
            <Route path="/inventory-declaration" element={<ModuleContent moduleId="inventory-declaration" />} />
            <Route path="/material-group" element={<ModuleContent moduleId="material-group" />} />
            <Route path="/unit-management" element={<ModuleContent moduleId="unit-management" />} />
            <Route path="/standard-management" element={<ModuleContent moduleId="standard-management" />} />
            <Route path="/note-management" element={<ModuleContent moduleId="note-management" />} />
            <Route path="/contract-management" element={<ModuleContent moduleId="contract-management" />} />
            <Route path="/summary" element={<ModuleContent moduleId="summary" />} />
            <Route path="/journal" element={<ModuleContent moduleId="journal" />} />
            <Route path="/cash" element={<ModuleContent moduleId="cash" />} />
            <Route path="/banking" element={<ModuleContent moduleId="banking" />} />
            <Route path="/purchasing" element={<ModuleContent moduleId="purchasing" />} />
            <Route path="/sales" element={<ModuleContent moduleId="sales" />} />
            <Route path="/costing" element={<ModuleContent moduleId="costing" />} />
            <Route path="/inventory" element={<ModuleContent moduleId="inventory" />} />
            <Route path="/vat" element={<ModuleContent moduleId="vat" />} />
            <Route path="/assets" element={<ModuleContent moduleId="assets" />} />
            <Route path="/invoices" element={<ModuleContent moduleId="invoices" />} />
            <Route path="/reports" element={<ModuleContent moduleId="reports" />} />
            <Route path="/firmbanking" element={<ModuleContent moduleId="firmbanking" />} />
            <Route path="/e-documents" element={<ModuleContent moduleId="e-documents" />} />
            <Route path="/utilities" element={<ModuleContent moduleId="utilities" />} />
            
            {/* Catch all route - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={() => {}} />} />
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </Router>
  );
}

export default App;