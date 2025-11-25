import React, { useState } from 'react';
import { useAppStore } from '../context/AppContext';
import { Party, CurrencySymbols } from '../types';
import { Plus, Edit2, Trash2, Search, User, X, Phone, MapPin, Wallet, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export const Parties: React.FC = () => {
  const { state, dispatch } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [formData, setFormData] = useState<Partial<Party>>({});
  
  const symbol = CurrencySymbols[state.settings.currency];

  const filteredParties = state.parties.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.phone.includes(searchTerm)
  );

  const totalReceivables = state.parties.reduce((acc, p) => p.type === 'Customer' ? acc + p.balance : acc, 0);
  const totalPayables = state.parties.reduce((acc, p) => p.type === 'Supplier' ? acc + p.balance : acc, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitize = (val: number | undefined) => (val && !Number.isNaN(val) ? val : 0);

    if (editingParty) {
      dispatch({ 
        type: 'UPDATE_PARTY', 
        payload: { 
            ...editingParty, 
            ...formData,
            balance: sanitize(formData.balance)
        } as Party 
      });
    } else {
      const newParty: Party = {
        id: Date.now().toString(),
        name: formData.name || '',
        phone: formData.phone || '',
        type: formData.type || 'Customer',
        balance: sanitize(formData.balance),
        address: formData.address || ''
      };
      dispatch({ type: 'ADD_PARTY', payload: newParty });
    }
    closeModal();
  };

  const openModal = (party?: Party) => {
    if (party) {
      setEditingParty(party);
      setFormData(party);
    } else {
      setEditingParty(null);
      setFormData({ 
        name: '',
        phone: '',
        type: 'Customer', 
        balance: 0, 
        address: '' 
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingParty(null);
    setFormData({});
  };

  return (
    <div className="space-y-8">
       {/* Header & Stats */}
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2 font-display">Parties</h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Manage customers and suppliers.</p>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0">
                <div className="px-5 py-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4 min-w-[200px]">
                    <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl">
                        <ArrowDownLeft size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Receivables</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{symbol} {totalReceivables.toLocaleString()}</p>
                    </div>
                </div>
                <div className="px-5 py-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4 min-w-[200px]">
                    <div className="p-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl">
                        <ArrowUpRight size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Payables</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{symbol} {totalPayables.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <button 
                onClick={() => openModal()}
                className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-xl flex items-center justify-center shadow-lg shadow-rose-600/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 font-bold tracking-wide text-sm whitespace-nowrap"
            >
                <Plus size={20} className="mr-2" strokeWidth={3} />
                Add Party
            </button>
        </div>

      <div className="relative w-full max-w-md group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-rose-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search by name or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm outline-none font-medium"
            />
      </div>
        
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredParties.map(party => (
            <div key={party.id} className="group glass-panel border border-white/60 dark:border-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="flex justify-between items-start mb-5 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 flex items-center justify-center text-gray-500 dark:text-gray-400 shadow-sm border border-gray-200 dark:border-gray-700 group-hover:scale-105 transition-transform">
                    <User size={22} strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight leading-tight mb-1">{party.name}</h3>
                    <span className={`inline-block text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${party.type === 'Customer' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'}`}>
                      {party.type}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 relative z-10 mb-6 bg-gray-50/50 dark:bg-gray-800/30 p-4 rounded-xl">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 font-medium">
                    <Phone size={14} className="mr-3 text-gray-400 shrink-0" />
                    <span>{party.phone}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 font-medium">
                    <MapPin size={14} className="mr-3 text-gray-400 shrink-0" />
                    <span className="truncate">{party.address || 'No address'}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-end relative z-10">
                <div className="flex flex-col">
                     <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">Balance</span>
                     <span className={`text-xl font-black ${party.balance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-gray-900 dark:text-white'}`}>
                        {symbol} {party.balance.toLocaleString()}
                    </span>
                </div>
                
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openModal(party)} className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"><Edit2 size={18} /></button>
                  <button onClick={() => dispatch({ type: 'DELETE_PARTY', payload: party.id })} className="p-2 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"><Trash2 size={18} /></button>
                </div>
              </div>
            </div>
          ))}
          {filteredParties.length === 0 && (
             <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-600 glass-panel rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
               <User size={48} className="mb-4 opacity-20" />
               <p className="font-medium">No parties found.</p>
             </div>
          )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg border border-white/20 dark:border-gray-800 transform transition-all scale-100 overflow-hidden animate-scale-in">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight font-display">{editingParty ? 'Edit Party' : 'Add New Party'}</h2>
              <button onClick={closeModal} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Party Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name ?? ''}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="block w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none transition-all font-bold shadow-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Phone</label>
                    <input 
                    type="text" 
                    required
                    value={formData.phone ?? ''}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="block w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none transition-all font-bold shadow-sm"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Type</label>
                    <select
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as any})}
                    className="block w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none transition-all font-bold cursor-pointer shadow-sm"
                    >
                    <option value="Customer">Customer</option>
                    <option value="Supplier">Supplier</option>
                    </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Address</label>
                <textarea 
                  value={formData.address ?? ''}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  rows={3}
                  className="block w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none resize-none transition-all font-bold shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Opening Balance</label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">{symbol}</span>
                    <input 
                    type="number" 
                    step="0.01"
                    value={formData.balance !== undefined && !Number.isNaN(formData.balance) ? formData.balance : ''}
                    onChange={e => setFormData({...formData, balance: e.target.valueAsNumber})}
                    className="block w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3 pl-10 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none transition-all font-bold shadow-sm"
                    />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                <button type="button" onClick={closeModal} className="px-6 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 font-bold transition-colors">Cancel</button>
                <button type="submit" className="px-8 py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-600/20 transform hover:-translate-y-0.5 transition-all font-bold tracking-wide">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};