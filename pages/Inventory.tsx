import React, { useState } from 'react';
import { useAppStore } from '../context/AppContext';
import { InventoryItem, CurrencySymbols } from '../types';
import { Plus, Edit2, Trash2, Search, X, Package, Box, Coins, AlertTriangle } from 'lucide-react';

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

  const totalValue = state.inventory.reduce((acc, item) => acc + (item.stock * item.buyPrice), 0);
  const lowStockCount = state.inventory.filter(i => i.stock < 10).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      {/* Header & Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2 font-display">Inventory</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Manage your products and stock levels.</p>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0">
              <div className="px-5 py-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4 min-w-[160px]">
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
                      <Package size={20} />
                  </div>
                  <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Items</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{state.inventory.length}</p>
                  </div>
              </div>
              <div className="px-5 py-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4 min-w-[200px]">
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl">
                      <Coins size={20} />
                  </div>
                  <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Inventory Value</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{symbol} {totalValue.toLocaleString()}</p>
                  </div>
              </div>
              {lowStockCount > 0 && (
                <div className="px-5 py-3 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-100 dark:border-rose-800 shadow-sm flex items-center gap-4 min-w-[160px] animate-pulse">
                    <div className="p-2.5 bg-rose-100 dark:bg-rose-900/40 text-rose-600 rounded-xl">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-rose-500 tracking-wider">Low Stock</p>
                        <p className="text-xl font-bold text-rose-700 dark:text-rose-400">{lowStockCount}</p>
                    </div>
                </div>
              )}
          </div>

          <button 
            onClick={() => openModal()}
            className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-xl flex items-center justify-center shadow-lg shadow-rose-600/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 font-bold tracking-wide text-sm whitespace-nowrap"
          >
            <Plus size={20} className="mr-2" strokeWidth={3} />
            Add Product
          </button>
      </div>

      <div className="glass-panel rounded-3xl shadow-sm border border-white/60 dark:border-gray-800 overflow-hidden flex flex-col min-h-[600px] relative">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md sticky top-0 z-20">
          <div className="relative w-full max-w-md group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-rose-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search inventory..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-950/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm outline-none font-medium"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto flex-1">
          <table className="min-w-full">
            <thead className="sticky top-0 z-10 bg-gray-50/95 dark:bg-gray-800/95 backdrop-blur-sm">
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="px-8 py-4 text-left text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Product</th>
                <th className="px-8 py-4 text-left text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Stock Level</th>
                <th className="px-8 py-4 text-right text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Pricing</th>
                <th className="px-8 py-4 text-right text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Tax</th>
                <th className="px-8 py-4 text-right text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredInventory.map(item => {
                  const stockPercent = Math.min(100, item.stock); 
                  const stockColor = item.stock < 10 ? 'bg-rose-500' : item.stock < 30 ? 'bg-amber-500' : 'bg-emerald-500';
                  const stockBg = item.stock < 10 ? 'bg-rose-100 dark:bg-rose-900/30' : item.stock < 30 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30';
                  const stockText = item.stock < 10 ? 'text-rose-700 dark:text-rose-400' : item.stock < 30 ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400';

                  return (
                <tr key={item.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                          <div className="h-11 w-11 rounded-xl bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 flex items-center justify-center mr-4 shadow-sm border border-gray-100 dark:border-gray-700 group-hover:scale-105 transition-transform">
                              <Box size={20} strokeWidth={1.5} />
                          </div>
                          <div>
                             <span className="block text-sm font-bold text-gray-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">{item.name}</span>
                             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.unit}</span>
                          </div>
                      </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="w-48">
                        <div className="flex justify-between mb-2">
                             <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${stockBg} ${stockText}`}>
                                {item.stock} {item.unit}
                             </span>
                             {item.stock < 10 && <span className="text-[10px] text-rose-500 font-bold uppercase animate-pulse flex items-center">Low Stock</span>}
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                            <div className={`h-full rounded-full ${stockColor} transition-all duration-500`} style={{ width: `${stockPercent}%` }}></div>
                        </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right">
                      <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{symbol} {item.sellPrice.toLocaleString()}</span>
                          <span className="text-xs text-gray-400 font-medium">Cost: {symbol} {item.buyPrice.toLocaleString()}</span>
                      </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400 font-bold">{item.taxPercent}%</td>
                  <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal(item)} className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all" title="Edit">
                            <Edit2 size={16} />
                        </button>
                        <button onClick={() => dispatch({ type: 'DELETE_ITEM', payload: item.id })} className="p-2 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-all" title="Delete">
                            <Trash2 size={16} />
                        </button>
                    </div>
                  </td>
                </tr>
              )})}
              {filteredInventory.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center text-gray-400 dark:text-gray-600">
                    <div className="flex flex-col items-center">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-full mb-4">
                            <Package size={32} className="opacity-40" />
                        </div>
                        <p className="font-bold text-lg">No items found</p>
                        <p className="text-sm mt-1">Adjust your search or add a new product.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Premium Style */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg border border-white/20 dark:border-gray-800 transform transition-all scale-100 overflow-hidden animate-scale-in">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight font-display">{editingItem ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={closeModal} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-600">
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
                  className="block w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all font-bold placeholder-gray-400"
                  placeholder="e.g. Wireless Mouse"
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                   <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Stock Qty</label>
                   <input 
                    type="number" 
                    required
                    value={formData.stock !== undefined && !Number.isNaN(formData.stock) ? formData.stock : ''}
                    onChange={e => setFormData({...formData, stock: e.target.valueAsNumber})}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="block w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none transition-all font-bold"
                  />
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Unit</label>
                   <input 
                    type="text" 
                    value={formData.unit ?? ''}
                    onChange={e => setFormData({...formData, unit: e.target.value})}
                    className="block w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none transition-all font-bold"
                    placeholder="pcs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                   <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Buy Price</label>
                   <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">{symbol}</span>
                        <input 
                            type="number" 
                            required
                            step="0.01"
                            value={formData.buyPrice !== undefined && !Number.isNaN(formData.buyPrice) ? formData.buyPrice : ''}
                            onChange={e => setFormData({...formData, buyPrice: e.target.valueAsNumber})}
                            onWheel={(e) => e.currentTarget.blur()}
                            className="block w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3 pl-10 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none transition-all font-bold"
                        />
                   </div>
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Sell Price</label>
                   <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">{symbol}</span>
                        <input 
                            type="number" 
                            required
                            step="0.01"
                            value={formData.sellPrice !== undefined && !Number.isNaN(formData.sellPrice) ? formData.sellPrice : ''}
                            onChange={e => setFormData({...formData, sellPrice: e.target.valueAsNumber})}
                            onWheel={(e) => e.currentTarget.blur()}
                            className="block w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3 pl-10 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none transition-all font-bold"
                        />
                   </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Tax ({state.settings.taxName} %)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={formData.taxPercent !== undefined && !Number.isNaN(formData.taxPercent) ? formData.taxPercent : ''}
                  onChange={e => setFormData({...formData, taxPercent: e.target.valueAsNumber})}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="block w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none transition-all font-bold"
                />
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