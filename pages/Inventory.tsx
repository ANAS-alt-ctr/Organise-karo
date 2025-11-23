import React, { useState } from 'react';
import { useAppStore } from '../context/AppContext';
import { InventoryItem, CurrencySymbols } from '../types';
import { Plus, Edit2, Trash2, Search, X, Package } from 'lucide-react';

export const Inventory: React.FC = () => {
  const { state, dispatch } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const [formData, setFormData] = useState<Partial<InventoryItem>>({});
  const symbol = CurrencySymbols[state.settings.currency];

  const filteredInventory = state.inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Helper to sanitize numbers (convert NaN to 0)
    const sanitize = (val: number | undefined) => (val && !Number.isNaN(val) ? val : 0);

    if (editingItem) {
      dispatch({ 
        type: 'UPDATE_ITEM', 
        payload: { 
          ...editingItem, 
          ...formData,
          buyPrice: sanitize(formData.buyPrice),
          sellPrice: sanitize(formData.sellPrice),
          taxPercent: sanitize(formData.taxPercent),
          stock: sanitize(formData.stock)
        } as InventoryItem 
      });
    } else {
      const newItem: InventoryItem = {
        id: Date.now().toString(),
        name: formData.name || '',
        buyPrice: sanitize(formData.buyPrice),
        sellPrice: sanitize(formData.sellPrice),
        taxPercent: sanitize(formData.taxPercent),
        stock: sanitize(formData.stock),
        unit: formData.unit || 'pcs'
      };
      dispatch({ type: 'ADD_ITEM', payload: newItem });
    }
    closeModal();
  };

  const openModal = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({ 
        name: '', 
        buyPrice: 0, 
        sellPrice: 0, 
        stock: 0, 
        taxPercent: 0, 
        unit: 'pcs' 
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({});
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Inventory</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your products and stock levels.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 text-white px-6 py-3 rounded-xl flex items-center shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 font-semibold tracking-wide"
        >
          <Plus size={20} className="mr-2" />
          Add Item
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-premium border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search inventory..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-rose-500/20 transition-all"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50/50 dark:bg-gray-800/50">
              <tr>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Product Info</th>
                <th className="px-8 py-5 text-center text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Stock Level</th>
                <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Pricing</th>
                <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Tax</th>
                <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredInventory.map(item => (
                <tr key={item.id} className="group hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                          <div className="h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center mr-4">
                              <Package size={20} />
                          </div>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.name}</span>
                      </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold ${item.stock < 10 ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                      {item.stock} {item.unit}
                    </span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right">
                      <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{symbol} {item.sellPrice}</span>
                          <span className="text-xs text-gray-400">Buy: {symbol} {item.buyPrice}</span>
                      </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400 font-medium">{item.taxPercent}%</td>
                  <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal(item)} className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors">
                        <Edit2 size={18} />
                        </button>
                        <button onClick={() => dispatch({ type: 'DELETE_ITEM', payload: item.id })} className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors">
                        <Trash2 size={18} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredInventory.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-gray-400 dark:text-gray-600">
                    <div className="flex flex-col items-center">
                        <Package size={48} className="mb-4 opacity-20" />
                        <p>No items found in your inventory.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-800 transform transition-all scale-100">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{editingItem ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={closeModal} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Item Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name ?? ''}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="block w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl p-3.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all font-medium"
                  placeholder="e.g. Wireless Mouse"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                   <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Stock Qty</label>
                   <input 
                    type="number" 
                    required
                    value={formData.stock !== undefined && !Number.isNaN(formData.stock) ? formData.stock : ''}
                    onChange={e => setFormData({...formData, stock: e.target.valueAsNumber})}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="block w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl p-3.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none transition-all font-medium"
                  />
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Unit</label>
                   <input 
                    type="text" 
                    value={formData.unit ?? ''}
                    onChange={e => setFormData({...formData, unit: e.target.value})}
                    className="block w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl p-3.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none transition-all font-medium"
                    placeholder="pcs, kg, box"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                   <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Buy Price</label>
                   <input 
                    type="number" 
                    required
                    value={formData.buyPrice !== undefined && !Number.isNaN(formData.buyPrice) ? formData.buyPrice : ''}
                    onChange={e => setFormData({...formData, buyPrice: e.target.valueAsNumber})}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="block w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl p-3.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none transition-all font-medium"
                  />
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Sell Price</label>
                   <input 
                    type="number" 
                    required
                    value={formData.sellPrice !== undefined && !Number.isNaN(formData.sellPrice) ? formData.sellPrice : ''}
                    onChange={e => setFormData({...formData, sellPrice: e.target.valueAsNumber})}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="block w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl p-3.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none transition-all font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Tax ({state.settings.taxName} %)</label>
                <input 
                  type="number" 
                  value={formData.taxPercent !== undefined && !Number.isNaN(formData.taxPercent) ? formData.taxPercent : ''}
                  onChange={e => setFormData({...formData, taxPercent: e.target.valueAsNumber})}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="block w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl p-3.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none transition-all font-medium"
                />
              </div>
              <div className="flex justify-end space-x-4 pt-6">
                <button type="button" onClick={closeModal} className="px-6 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-8 py-3 bg-gradient-to-r from-rose-600 to-orange-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transform transition-all font-bold tracking-wide">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};