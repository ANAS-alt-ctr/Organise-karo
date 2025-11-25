import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { Parties } from './pages/Parties';
import { Billing } from './pages/Billing';
import { Invoices } from './pages/Invoices';
import { Settings } from './pages/Settings';
import { AIAnalysis } from './pages/AIAnalysis';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard onNavigate={setActiveTab} />;
      case 'inventory': return <Inventory />;
      case 'parties': return <Parties />;
      case 'billing': return <Billing />;
      case 'invoices': return <Invoices />;
      case 'settings': return <Settings />;
      case 'ai-insights': return <AIAnalysis />;
      default: return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;