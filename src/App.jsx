import React, { useState } from 'react';
import { VmsProvider, useVms } from './context/VmsContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ZoneAlertModal from './components/ZoneAlertModal';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import GuardKiosk from './pages/GuardKiosk';
import PreRegistration from './pages/PreRegistration';
import HostApprovals from './pages/HostApprovals';
import VisitorList from './pages/VisitorList';
import ZoneAccess from './pages/ZoneAccess';
import AuditLogs from './pages/AuditLogs';

function MainApp() {
  const [activePage, setActivePage] = useState('landing'); // Default landing page for comprehensive presentation
  const { isAuthenticated } = useVms();

  // Full Screen Standalone Views (Landing & Login)
  if (activePage === 'landing') {
    return <LandingPage setActivePage={setActivePage} />;
  }

  if (activePage === 'login') {
    return <LoginPage setActivePage={setActivePage} />;
  }

  // Application Portal Views
  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard setActivePage={setActivePage} />;
      case 'guard':
        return <GuardKiosk setActivePage={setActivePage} />;
      case 'pre-register':
        return <PreRegistration setActivePage={setActivePage} />;
      case 'host-approvals':
        return <HostApprovals setActivePage={setActivePage} />;
      case 'visitors':
        return <VisitorList setActivePage={setActivePage} />;
      case 'zone-access':
        return <ZoneAccess setActivePage={setActivePage} />;
      case 'audit-logs':
        return <AuditLogs setActivePage={setActivePage} />;
      default:
        return <Dashboard setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activePage={activePage} setActivePage={setActivePage} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderActivePage()}
          </div>
        </main>
      </div>

      {/* Real-time Global Security Alerts */}
      <ZoneAlertModal />
    </div>
  );
}

export default function App() {
  return (
    <VmsProvider>
      <MainApp />
    </VmsProvider>
  );
}
