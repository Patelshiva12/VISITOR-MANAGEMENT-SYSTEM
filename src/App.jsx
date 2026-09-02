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
import Settings from './pages/Settings';

function MainApp() {
  const [activePage, setActivePage] = useState('landing');
  const { isAuthenticated } = useVms();

  if (activePage === 'landing') {
    return <LandingPage setActivePage={setActivePage} />;
  }

  if (activePage === 'login') {
    return <LoginPage setActivePage={setActivePage} />;
  }

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
      case 'settings':
        return <Settings setActivePage={setActivePage} />;
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
