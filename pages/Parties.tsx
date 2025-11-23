import React, { useState } from 'react';
import { useAppStore } from '../context/AppContext';
import { Party, CurrencySymbols } from '../types';
import { Plus, Edit2, Trash2, Search, User, X, Phone, MapPin } from 'lucide-react';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Helper to sanitize numbers
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
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Parties</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage customers and suppliers.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 text-white px-6 py-3 rounded-xl flex items-center shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 font-semibold tracking-wide"
        >
          <Plus size={20} className="mr-2" />
          Add Party
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-premium border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
           <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by name or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-rose-500/20 transition-all"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-gray-50/50 dark:bg-gray-900/50">
          {filteredParties.map(party => (
            <div key={party.id} className="group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 p-3.5 rounded-2xl mr-4 text-gray-600 dark:text-gray-300">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">{party.name}</h3>
                    <span className={`text-xs px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${party.type === 'Customer' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                      {party.type}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openModal(party)} className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"><Edit2 size={18} /></button>
                  <button onClick={() => dispatch({ type: 'DELETE_PARTY', payload: party.id })} className="p-2 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"><Trash2 size={18} /></button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Phone size={14} className="mr-2" />
                    <span>{party.phone}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <MapPin size={14} className="mr-2" />
                    <span className="truncate">{party.address || 'No address provided'}</span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">Current Balance</span>
                <span className={`text-lg font-bold ${party.balance > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                    {symbol} {party.balance.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
          {filteredParties.length === 0 && (
             <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-600">
               <User size={48} className="mb-4 opacity-20" />
               <p>No parties found matching your search.</p>
             </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-800 transform transition-all scale-100">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{editingParty ? 'Edit Party' : 'Add New Party'}</h2>
              <button onClick={closeModal} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500">
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
                  className="block w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl p-3.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none transition-all font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Phone</label>
                    <input 
                    type="text" 
                    required
                    value={formData.phone ?? ''}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="block w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl p-3.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none transition-all font-medium"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Type</label>
                    <select
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as any})}
                    className="block w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl p-3.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none transition-all font-medium"
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
                  className="block w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl p-3.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none resize-none transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Opening Balance</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={formData.balance !== undefined && !Number.isNaN(formData.balance) ? formData.balance : ''}
                  onChange={e => setFormData({...formData, balance: e.target.valueAsNumber})}
                  className="block w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl p-3.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none transition-all font-medium"
                />
              </div>
              <div className="flex justify-end space-x-4 pt-6">
                <button type="button" onClick={closeModal} className="px-6 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-8 py-3 bg-gradient-to-r from-rose-600 to-orange-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transform transition-all font-bold tracking-wide">Save Party</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};