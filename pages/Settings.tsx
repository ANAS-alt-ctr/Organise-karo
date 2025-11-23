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
    if (window.confirm("Are you sure you want to reset all data? This cannot be undone and will revert the app to its initial state.")) {
        // Hard Reset: Explicitly clear storage and force reload to ensure a completely clean slate
        // This avoids race conditions between React state updates and localStorage
        try {
            localStorage.removeItem(STORAGE_KEY);
            window.location.reload();
        } catch (e) {
            console.error("Failed to clear local storage", e);
            // Fallback to dispatch if reload fails (rare)
            dispatch({ type: 'RESET_DATA' });
            alert("Application data has been reset.");
        }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Configure your business preferences.</p>
      </div>

      <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-premium border border-gray-100 dark:border-gray-800 transition-all duration-300">
        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
            <span className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mr-3 text-rose-600 dark:text-rose-400">
                <SettingsIcon size={18} />
            </span>
            Business Details
        </h2>
        <div className="space-y-6">
           <div>
             <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Business Name</label>
             <input 
               type="text" 
               value={state.settings.businessName}
               onChange={(e) => dispatch({ type: 'UPDATE_SETTINGS', payload: { businessName: e.target.value } })}
               className="block w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl p-3.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none transition-all font-medium"
             />
           </div>
           <div>
             <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Business Address</label>
             <textarea 
               value={state.settings.businessAddress}
               onChange={(e) => dispatch({ type: 'UPDATE_SETTINGS', payload: { businessAddress: e.target.value } })}
               rows={3}
               className="block w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl p-3.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none resize-none transition-all font-medium"
             />
           </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-premium border border-gray-100 dark:border-gray-800 transition-all duration-300">
        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
             <span className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mr-3 text-emerald-600 dark:text-emerald-400">
                <RefreshCw size={18} />
            </span>
            Localization
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div>
             <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Currency</label>
             <div className="relative">
                <select 
                value={state.settings.currency}
                onChange={(e) => dispatch({ type: 'UPDATE_SETTINGS', payload: { currency: e.target.value as Currency } })}
                className="block w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl p-3.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none appearance-none transition-all font-medium"
                >
                {Object.values(Currency).map(c => (
                    <option key={c} value={c}>{c}</option>
                ))}
                </select>
                <div className="absolute right-4 top-3.5 pointer-events-none text-gray-400">▼</div>
             </div>
           </div>
           <div>
             <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Tax Name</label>
             <input 
               type="text" 
               value={state.settings.taxName}
               onChange={(e) => dispatch({ type: 'UPDATE_SETTINGS', payload: { taxName: e.target.value } })}
               className="block w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl p-3.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none transition-all font-medium"
               placeholder="GST / VAT"
             />
           </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-premium border border-gray-100 dark:border-gray-800 transition-all duration-300">
        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
            <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mr-3 text-indigo-600 dark:text-indigo-400">
                <Save size={18} />
            </span>
            Data Management
        </h2>
        <div className="flex flex-col md:flex-row gap-4">
           <button 
             onClick={handleBackup}
             className="flex-1 flex items-center justify-center px-6 py-4 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all font-semibold hover:-translate-y-0.5"
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
               className="w-full flex items-center justify-center px-6 py-4 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all font-semibold hover:-translate-y-0.5"
             >
               <Upload className="mr-3" size={20}/>
               Restore Data
             </button>
           </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-rose-50 dark:bg-rose-900/10 p-8 rounded-3xl border border-rose-100 dark:border-rose-900/30 transition-all duration-300">
        <h2 className="text-xl font-bold mb-4 text-rose-700 dark:text-rose-400 flex items-center">
            <span className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mr-3">
                <AlertOctagon size={18} />
            </span>
            Danger Zone
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Resetting the application will permanently delete all your inventory, parties, invoices, and settings. This action cannot be undone.
        </p>
        <button 
          onClick={handleReset}
          className="flex items-center justify-center px-6 py-4 bg-white dark:bg-gray-900 text-rose-600 dark:text-rose-400 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-900/20 border border-rose-200 dark:border-rose-800 transition-all font-bold hover:shadow-lg w-full md:w-auto"
        >
          <Trash2 className="mr-3" size={20}/>
          Reset Application to Factory Settings
        </button>
      </div>
    </div>
  );
};