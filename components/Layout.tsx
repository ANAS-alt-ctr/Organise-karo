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
  Sun
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
    <div className="flex h-screen h-[100dvh] bg-gray-50 dark:bg-gray-950 overflow-hidden transition-colors duration-300 print:h-auto print:overflow-visible">
      {/* Sidebar - Glassmorphism & Gradient Branding */}
      <aside 
        className={`
          print:hidden
          fixed inset-y-0 left-0 z-[60] w-72 
          bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl
          border-r border-gray-200/50 dark:border-gray-800/50 
          transform transition-all duration-300 ease-in-out 
          shadow-2xl dark:shadow-black/50
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0
        `}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100 dark:border-gray-800">
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-rose-600 to-orange-500 bg-clip-text text-transparent">
            Organise karo
          </span>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-500">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 flex flex-col h-[calc(100%-5rem)] justify-between">
          <nav className="space-y-2">
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
                    relative group flex items-center w-full px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-300 ease-out
                    ${isActive 
                      ? 'bg-gradient-to-r from-rose-50 to-white dark:from-rose-900/20 dark:to-gray-900 text-rose-600 dark:text-rose-400 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'}
                  `}
                >
                  {isActive && (
                    <div className="absolute left-0 w-1 h-8 bg-rose-500 rounded-r-full" />
                  )}
                  <item.icon 
                    className={`mr-3 h-5 w-5 transition-colors duration-300 ${isActive ? 'text-rose-600 dark:text-rose-400' : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'}`} 
                  />
                  {item.label}
                </button>
              );
            })}
          </nav>
          
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
             <div className="px-5 py-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <p className="text-xs text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider mb-1">Current Business</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{state.settings.businessName}</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative print:h-auto print:overflow-visible">
        {/* Header - Glassmorphism */}
        <header className="print:hidden h-20 absolute top-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 flex items-center justify-between px-6 lg:px-8 transition-colors duration-300">
          <div className="flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(true)} 
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 mr-4"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white tracking-tight hidden sm:block">
              {menuItems.find(i => i.id === activeTab)?.label}
            </h2>
          </div>
          
          <div className="flex items-center space-x-5">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100/50 dark:bg-gray-800/50 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
              <span className="text-gray-400 mr-2">Currency:</span> 
              <span className="font-bold text-gray-900 dark:text-white">{state.settings.currency} ({currencySymbol})</span>
            </span>
            
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              title="Toggle Theme"
            >
              {isDark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-indigo-600" />}
            </button>
          </div>
        </header>

        {/* Page Content - with top padding for fixed header and extra bottom padding for scrolling */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-950 p-6 lg:p-8 pt-28 pb-32 print:p-0 print:pt-0 print:pb-0 print:bg-white print:overflow-visible transition-colors duration-300 scroll-smooth">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 print:animate-none">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};