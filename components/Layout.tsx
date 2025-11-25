import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  FileText, 
  Settings, 
  Menu, 
  X,
  BrainCircuit,
  Moon,
  Sun,
  History
} from 'lucide-react';
import { useAppStore } from '../context/AppContext';
import { CurrencySymbols } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { state, dispatch } = useAppStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'billing', label: 'Billing / POS', icon: FileText },
    { id: 'invoices', label: 'History', icon: History },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'parties', label: 'Parties', icon: Users },
    { id: 'ai-insights', label: 'AI Insights', icon: BrainCircuit },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const currencySymbol = CurrencySymbols[state.settings.currency];
  const isDark = state.settings.theme === 'dark';

  const toggleTheme = () => {
    dispatch({ 
      type: 'UPDATE_SETTINGS', 
      payload: { theme: isDark ? 'light' : 'dark' } 
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden transition-colors duration-300 print:h-auto print:overflow-visible font-sans">
      {/* Sidebar - Solid & Professional */}
      <aside 
        className={`
          print:hidden
          fixed inset-y-0 left-0 z-50 w-72 
          bg-white dark:bg-gray-900
          border-r border-gray-200 dark:border-gray-800 
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0 flex flex-col
        `}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-rose-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                O
             </div>
             <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Organise<span className="text-rose-600">.</span>
             </span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-500 hover:text-gray-900 dark:hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`
                    flex items-center w-full px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-gray-100 dark:bg-gray-800 text-rose-600 dark:text-rose-400' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100'}
                  `}
                >
                  <item.icon 
                    className={`mr-3 h-5 w-5 ${isActive ? 'text-rose-600 dark:text-rose-400' : 'text-gray-400 group-hover:text-gray-500'}`} 
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
             <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold border border-gray-200 dark:border-gray-700">
                    {state.settings.businessName.charAt(0)}
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{state.settings.businessName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Business Account</p>
                </div>
             </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative print:h-auto print:overflow-visible">
        {/* Header - Clean Standard */}
        <header className="print:hidden h-16 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 lg:px-8 shrink-0">
          <div className="flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(true)} 
              className="md:hidden p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 mr-4"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              {menuItems.find(i => i.id === activeTab)?.label}
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <span className="text-xs font-semibold text-gray-500 mr-2 uppercase tracking-wider">Currency</span> 
              <span className="text-sm font-bold text-gray-900 dark:text-white">{state.settings.currency} ({currencySymbol})</span>
            </div>
            
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Toggle Theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-6 lg:p-8 print:p-0 print:bg-white print:overflow-visible scroll-smooth">
          <div className="max-w-7xl mx-auto animate-fade-in print:animate-none">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};