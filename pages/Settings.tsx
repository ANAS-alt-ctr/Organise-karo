import React, { useRef } from 'react';
import { useAppStore, STORAGE_KEY } from '../context/AppContext';
import { Currency, AppState } from '../types';
import { Download, Upload, Settings as SettingsIcon, Save, RefreshCw, Trash2, AlertOctagon } from 'lucide-react';

export const Settings: React.FC = () => {
  const { state, dispatch } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Backup Data
  const handleBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `organise_karo_backup_${new Date().toISOString()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Restore Data
  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files.length > 0) {
      fileReader.readAsText(event.target.files[0], "UTF-8");
      fileReader.onload = (e) => {
        try {
          const parsedData = JSON.parse(e.target?.result as string) as AppState;
          if (parsedData.inventory && parsedData.parties) {
             dispatch({ type: 'RESTORE_DATA', payload: parsedData });
             alert("Data restored successfully!");
          } else {
             alert("Invalid file format.");
          }
        } catch (error) {
          alert("Error parsing JSON file.");
        }
      };
    }
  };

  const handleReset = () => {
    if (window.confirm("CRITICAL WARNING: Are you sure you want to delete ALL data? This cannot be undone.")) {
        dispatch({ type: 'RESET_DATA' });
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            console.error("Storage clear error", e);
        }
        setTimeout(() => {
            window.location.reload();
        }, 100);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2 font-display">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Configure your business preferences.</p>
      </div>

      <div className="glass-panel p-8 rounded-3xl shadow-sm border border-white/60 dark:border-gray-800 transition-all duration-300 hover:shadow-premium-hover">
        <h2 className="text-xl font-bold mb-8 text-gray-900 dark:text-white flex items-center font-display">
            <span className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 shadow-sm">
                <SettingsIcon size={20} strokeWidth={2} />
            </span>
            Business Details
        </h2>
        <div className="space-y-6">
           <div>
             <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5">Business Name</label>
             <input 
               type="text" 
               value={state.settings.businessName}
               onChange={(e) => dispatch({ type: 'UPDATE_SETTINGS', payload: { businessName: e.target.value } })}
               className="block w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all font-bold shadow-sm"
             />
           </div>
           <div>
             <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5">Business Address</label>
             <textarea 
               value={state.settings.businessAddress}
               onChange={(e) => dispatch({ type: 'UPDATE_SETTINGS', payload: { businessAddress: e.target.value } })}
               rows={3}
               className="block w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none resize-none transition-all font-bold shadow-sm"
             />
           </div>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-3xl shadow-sm border border-white/60 dark:border-gray-800 transition-all duration-300 hover:shadow-premium-hover">
        <h2 className="text-xl font-bold mb-8 text-gray-900 dark:text-white flex items-center font-display">
             <span className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 shadow-sm">
                <RefreshCw size={20} strokeWidth={2} />
            </span>
            Localization
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div>
             <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5">Currency</label>
             <div className="relative">
                <select 
                value={state.settings.currency}
                onChange={(e) => dispatch({ type: 'UPDATE_SETTINGS', payload: { currency: e.target.value as Currency } })}
                className="block w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none appearance-none transition-all font-bold cursor-pointer shadow-sm"
                >
                {Object.values(Currency).map(c => (
                    <option key={c} value={c}>{c}</option>
                ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
             </div>
           </div>
           <div>
             <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5">Tax Name</label>
             <input 
               type="text" 
               value={state.settings.taxName}
               onChange={(e) => dispatch({ type: 'UPDATE_SETTINGS', payload: { taxName: e.target.value } })}
               className="block w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all font-bold shadow-sm"
               placeholder="GST / VAT"
             />
           </div>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-3xl shadow-sm border border-white/60 dark:border-gray-800 transition-all duration-300 hover:shadow-premium-hover">
        <h2 className="text-xl font-bold mb-8 text-gray-900 dark:text-white flex items-center font-display">
            <span className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 shadow-sm">
                <Save size={20} strokeWidth={2} />
            </span>
            Data Management
        </h2>
        <div className="flex flex-col md:flex-row gap-5">
           <button 
             onClick={handleBackup}
             className="flex-1 flex items-center justify-center px-6 py-5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all font-bold hover:-translate-y-0.5 shadow-sm"
           >
             <Download className="mr-3" size={20}/>
             Backup Data
           </button>
           
           <div className="flex-1">
             <input 
               type="file" 
               accept=".json" 
               ref={fileInputRef} 
               style={{ display: 'none' }} 
               onChange={handleRestore}
             />
             <button 
               onClick={() => fileInputRef.current?.click()}
               className="w-full flex items-center justify-center px-6 py-5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all font-bold hover:-translate-y-0.5 shadow-sm"
             >
               <Upload className="mr-3" size={20}/>
               Restore Data
             </button>
           </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-rose-50/50 dark:bg-rose-900/10 p-8 rounded-3xl border border-rose-100 dark:border-rose-900/30 transition-all duration-300">
        <h2 className="text-xl font-bold mb-4 text-rose-700 dark:text-rose-400 flex items-center font-display">
            <span className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mr-4 shadow-sm">
                <AlertOctagon size={20} strokeWidth={2} />
            </span>
            Danger Zone
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 font-medium leading-relaxed max-w-2xl">
            Resetting the application will permanently delete all your inventory, parties, invoices, and settings. This action cannot be undone.
        </p>
        <button 
          onClick={handleReset}
          className="flex items-center justify-center px-6 py-4 bg-white dark:bg-gray-900 text-rose-600 dark:text-rose-400 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-900/20 border border-rose-200 dark:border-rose-800 transition-all font-bold hover:shadow-lg w-full md:w-auto shadow-sm hover:border-rose-300"
        >
          <Trash2 className="mr-3" size={20}/>
          Reset Application to Factory Settings
        </button>
      </div>
    </div>
  );
};