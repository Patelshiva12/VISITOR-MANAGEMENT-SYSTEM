import React, { useState, useEffect } from 'react';
import { VmsProvider, useVms } from './context/VmsContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ZoneAlertModal from './components/ZoneAlertModal';
import ProposalStagesModal from './components/ProposalStagesModal';
import ToastContainer from './components/ToastContainer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import GuardKiosk from './pages/GuardKiosk';
import PreRegistration from './pages/PreRegistration';
import HostApprovals from './pages/HostApprovals';
import VisitorList from './pages/VisitorList';
import DepartmentMaster from './pages/DepartmentMaster';
import ZoneAccess from './pages/ZoneAccess';
import AuditLogs from './pages/AuditLogs';
import Settings from './pages/Settings';
import { Shield, ArrowLeft, Lock } from 'lucide-react';

const VALID_PAGES = [
  'landing', 
  'login', 
  'pre-register', 
  'dashboard', 
  'guard', 
  'departments',
  'host-approvals', 
  'visitors', 
  'zone-access', 
  'audit-logs', 
  'settings'
];

const LANDING_SECTION_HASHES = ['tracker', 'features', 'biometrics', 'workflow', 'top'];

function getInitialPage() {
  // 1. Check URL hash first (e.g. #guard, #departments, #visitors, #dashboard)
  const hash = window.location.hash.replace('#', '').trim();
  if (LANDING_SECTION_HASHES.includes(hash)) {
    return 'landing';
  }
  if (VALID_PAGES.includes(hash)) {
    return hash;
  }

  // 2. Check localStorage persisted page
  const savedPage = localStorage.getItem('vms_active_page');
  if (savedPage && VALID_PAGES.includes(savedPage)) {
    return savedPage;
  }

  // 3. Fallback based on saved auth
  const savedAuth = localStorage.getItem('vms_auth');
  const isAuth = savedAuth !== null ? JSON.parse(savedAuth) : false;
  const savedRole = localStorage.getItem('vms_role') || 'guard';

  if (isAuth) {
    return savedRole === 'guard' ? 'guard' : savedRole === 'host' ? 'host-approvals' : 'dashboard';
  }

  return 'landing';
}

function MainApp() {
  const [activePage, setActivePage] = useState(getInitialPage);
  const [stagesModalOpen, setStagesModalOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isAuthenticated } = useVms();

  // Keep localStorage and URL hash in sync with activePage
  useEffect(() => {
    if (activePage && VALID_PAGES.includes(activePage)) {
      localStorage.setItem('vms_active_page', activePage);
      if (window.location.hash.replace('#', '') !== activePage) {
        window.history.replaceState(null, '', `#${activePage}`);
      }
    }
  }, [activePage]);

  // Listen to browser back/forward and hash changes
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (LANDING_SECTION_HASHES.includes(hash)) {
        setActivePage('landing');
      } else if (VALID_PAGES.includes(hash)) {
        setActivePage(hash);
      }
    };

    window.addEventListener('hashchange', handleHash);
    window.addEventListener('popstate', handleHash);
    return () => {
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('popstate', handleHash);
    };
  }, []);

  // 1. Public Landing Page (Zero Staff Access)
  if (activePage === 'landing') {
    return (
      <>
        <LandingPage setActivePage={setActivePage} />
        <ToastContainer />
      </>
    );
  }

  // 2. Public Visitor Pre-Registration Form (100% STANDALONE)
  if (activePage === 'pre-register') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        {/* Simple Public Header */}
        <header className="bg-slate-900/95 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActivePage('landing')}
              className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/20 ring-1 ring-sky-400/30"
            >
              <Shield className="w-5 h-5 text-white" />
            </button>
            <div>
              <span className="font-extrabold tracking-tight text-white text-base">ILIZIEN VMS</span>
              <span className="text-[10px] ml-2 font-mono font-semibold px-2 py-0.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-full">
                Public Visitor Self-Service
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActivePage('landing')}
              className="px-3.5 py-2 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </button>
            <button
              onClick={() => setActivePage('login')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-800 text-sky-400 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Lock className="w-3.5 h-3.5" /> Staff Login
            </button>
          </div>
        </header>

        {/* Pure Standalone Form */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <PreRegistration setActivePage={setActivePage} isPublicView={true} />
          </div>
        </main>
        <ToastContainer />
      </div>
    );
  }

  // 3. Staff Login Gate
  if (activePage === 'login' || !isAuthenticated) {
    return (
      <>
        <LoginPage setActivePage={setActivePage} />
        <ToastContainer />
      </>
    );
  }

  // 4. Authenticated Staff Portal
  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard setActivePage={setActivePage} />;
      case 'guard':
        return <GuardKiosk setActivePage={setActivePage} />;
      case 'departments':
        return <DepartmentMaster setActivePage={setActivePage} />;
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
    <div className="h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden transition-colors duration-200">
      <Navbar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        onOpenStages={() => setStagesModalOpen(true)}
        onToggleSidebar={() => setMobileSidebarOpen(prev => !prev)}
      />
      
      {/* Container with Independent Scrolling for Sidebar and Main Page */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        <Sidebar 
          activePage={activePage} 
          setActivePage={setActivePage} 
          onOpenStages={() => setStagesModalOpen(true)}
          isMobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
        
        <main className="flex-1 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 min-h-0">
          <div className="max-w-7xl mx-auto pb-12">
            {renderActivePage()}
          </div>
        </main>
      </div>

      {/* 10-Stages Proposal Compliance Directory Modal */}
      <ProposalStagesModal 
        isOpen={stagesModalOpen}
        onClose={() => setStagesModalOpen(false)}
        onNavigate={(route) => {
          setActivePage(route);
          setStagesModalOpen(false);
        }}
      />

      <ZoneAlertModal />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <VmsProvider>
        <MainApp />
      </VmsProvider>
    </ErrorBoundary>
  );
}
