import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../context/AppContext';
import { CartItem, InventoryItem, Invoice, Party } from '../types';
import { Plus, Trash, Save, Calculator, ShoppingCart, Calendar, Search, X, User, Minus, CreditCard, ScanLine, Tag, ChevronRight, Package, RefreshCw, Grid, UserPlus, Phone } from 'lucide-react';
import { CurrencySymbols } from '../types';
import { InvoicePreview } from '../components/InvoicePreview';

export const Billing: React.FC = () => {
  const { state, dispatch } = useAppStore();
  const symbol = CurrencySymbols[state.settings.currency];
  
  // Invoice State
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Product Search State
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Quick Add Customer State
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');

  // Initialize date
  const [invoiceDate, setInvoiceDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  const selectedParty = state.parties.find(p => p.id === selectedPartyId);

  // Quick Access Items (Top 12 items by default)
  const quickItems = state.inventory.slice(0, 12);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setIsProductDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredInventory = state.inventory.filter(item => 
    item.name.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  const handleSelectProduct = (item: InventoryItem) => {
      if (item.stock <= 0) return;
      addToCart(item);
      setProductSearchTerm('');
      setIsProductDropdownOpen(false);
      searchInputRef.current?.focus();
  };

  const addToCart = (item: InventoryItem) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
        // Check if adding 1 more exceeds stock
        if (existing.quantity + 1 > item.stock) {
            alert(`Cannot add more. Stock limit reached (${item.stock}).`);
            return;
        }
        setCart(cart.map(c => c.id === existing.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
        if (item.stock < 1) {
             alert(`Item is out of stock.`);
             return;
        }
        setCart([...cart, { ...item, quantity: 1, discountPercent: 0 }]);
    }
  };

  const updateCartItem = (id: string, field: 'quantity' | 'discountPercent' | 'sellPrice', value: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        // Validation for quantity against stock
        if (field === 'quantity') {
             const product = state.inventory.find(i => i.id === id);
             if (product && value > product.stock) {
                 return item; // Do not update if exceeds stock
             }
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const adjustQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
         const newQty = Math.max(1, (item.quantity || 0) + delta);
         // Check stock limit
         const product = state.inventory.find(i => i.id === id);
         if (product && newQty > product.stock) return item;
         return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const calculateTotals = () => {
    let subTotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    cart.forEach(item => {
      const qty = Number.isNaN(item.quantity) ? 0 : item.quantity;
      const price = Number.isNaN(item.sellPrice) ? 0 : item.sellPrice;
      const discount = Number.isNaN(item.discountPercent) ? 0 : item.discountPercent;
      const taxRate = item.taxPercent || 0;

      const baseTotal = price * qty;
      const discountAmount = (baseTotal * discount) / 100;
      const taxableAmount = baseTotal - discountAmount;
      const taxAmount = (taxableAmount * taxRate) / 100;

      subTotal += taxableAmount;
      totalTax += taxAmount;
      totalDiscount += discountAmount;
    });

    return { subTotal, totalTax, totalDiscount, grandTotal: subTotal + totalTax };
  };

  const totals = calculateTotals();

  const handleSaveInvoice = () => {
    if (!selectedParty || cart.length === 0) {
      alert("Please select a party and add items.");
      return;
    }

    const sanitizedCart = cart.map(item => ({
        ...item,
        quantity: item.quantity || 1,
        sellPrice: item.sellPrice || 0,
        discountPercent: item.discountPercent || 0
    }));

    const invoiceId = `INV-${Date.now()}`;
    const invoice: Invoice = {
      id: invoiceId,
      date: invoiceDate,
      partyId: selectedParty.id,
      partyName: selectedParty.name,
      items: sanitizedCart,
      ...totals
    };

    dispatch({ type: 'CREATE_INVOICE', payload: invoice });
    setPreviewInvoice(invoice);
    setShowInvoicePreview(true);
  };

  const handleNewInvoice = () => {
    setCart([]);
    setSelectedPartyId('');
    setShowInvoicePreview(false);
    setPreviewInvoice(null);
    setProductSearchTerm('');
  };

  const handleQuickAddCustomer = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newCustomerName) return;
      
      const newParty: Party = {
          id: Date.now().toString(),
          name: newCustomerName,
          phone: newCustomerPhone,
          type: 'Customer',
          balance: 0,
          address: ''
      };
      
      dispatch({ type: 'ADD_PARTY', payload: newParty });
      setSelectedPartyId(newParty.id);
      setIsAddCustomerModalOpen(false);
      setNewCustomerName('');
      setNewCustomerPhone('');
  };

  if (showInvoicePreview && previewInvoice) {
    const party = state.parties.find(p => p.id === previewInvoice.partyId);
    const partyDetails = party ? { phone: party.phone, address: party.address } : undefined;

    return (
      <>
        <div className="flex justify-between items-center mb-6 print:hidden px-4 animate-in fade-in slide-in-from-top-4">
             <button onClick={handleNewInvoice} className="flex items-center text-gray-600 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 font-bold text-sm transition-colors bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                 <ChevronRight className="rotate-180 mr-2" size={18} /> Create New Invoice
             </button>
        </div>
        <InvoicePreview 
          invoice={previewInvoice} 
          settings={state.settings} 
          partyDetails={partyDetails}
          onBack={handleNewInvoice}
          showBackButton={true}
        />
      </>
    );
  }

  // POS INTERFACE
  return (
    <div className="flex flex-col xl:flex-row gap-6 min-h-[600px] print:hidden relative">
      {/* Left: Input & Cart */}
      <div className="xl:w-2/3 flex flex-col gap-6">
        {/* Header Inputs */}
        <div className="glass-panel p-6 shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="relative">
                <label className="flex items-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    <User size={14} className="mr-1.5"/> Customer
                </label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <select 
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none appearance-none transition-all font-medium text-sm"
                        value={selectedPartyId}
                        onChange={e => setSelectedPartyId(e.target.value)}
                        >
                        <option value="">Select Customer...</option>
                        {state.parties.filter(p => p.type === 'Customer').map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                    </div>
                    <button 
                        onClick={() => setIsAddCustomerModalOpen(true)}
                        className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-200 transition-colors"
                        title="Add New Customer"
                    >
                        <UserPlus size={18} />
                    </button>
                </div>
             </div>
             <div>
                <label className="flex items-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    <Calendar size={14} className="mr-1.5"/> Date
                </label>
                <input 
                type="date" 
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all font-medium text-sm"
                value={invoiceDate}
                onChange={e => setInvoiceDate(e.target.value)}
                />
             </div>
          </div>
        </div>

        {/* Product Selection & Quick Grid */}
        <div className="glass-panel flex flex-col overflow-hidden relative min-h-[500px]">
           {/* Search Bar */}
           <div className="p-4 border-b border-gray-100 dark:border-gray-800 shrink-0 z-20 bg-white dark:bg-gray-900">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search size={18} />
                </div>
                <input 
                    ref={searchInputRef}
                    type="text"
                    placeholder="Scan barcode or search products..."
                    className="w-full bg-gray-50 dark:bg-gray-950/50 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-10 pr-10 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all font-medium text-sm"
                    value={productSearchTerm}
                    onChange={e => {
                        setProductSearchTerm(e.target.value);
                        setIsProductDropdownOpen(true);
                    }}
                    onFocus={() => setIsProductDropdownOpen(true)}
                    autoFocus
                />
                 {productSearchTerm && (
                     <button 
                        onClick={() => {
                            setProductSearchTerm('');
                            setIsProductDropdownOpen(false);
                            searchInputRef.current?.focus();
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full"
                    >
                        <X size={14} />
                    </button>
                )}
                {/* Search Dropdown */}
                {isProductDropdownOpen && productSearchTerm && (
                    <div ref={dropdownRef} className="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-80 overflow-y-auto custom-scrollbar z-50">
                        {filteredInventory.length > 0 ? (
                            filteredInventory.map(item => (
                                <div 
                                    key={item.id}
                                    onClick={() => handleSelectProduct(item)}
                                    className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer flex justify-between items-center transition-colors border-b last:border-0 border-gray-100 dark:border-gray-800 ${item.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 bg-gray-100 dark:bg-gray-800`}>
                                            <ScanLine size={16} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-gray-900 dark:text-white">{item.name}</div>
                                            <div className="text-xs text-gray-500 font-medium">
                                                <span className={item.stock < 10 ? 'text-rose-500' : ''}>Stock: {item.stock} {item.unit}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                                        {symbol} {item.sellPrice}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-6 text-center text-gray-500 text-sm font-medium">
                                No products found
                            </div>
                        )}
                    </div>
                )}
              </div>
           </div>

           {/* Content Area: Grid or Cart */}
           <div className="flex-1 bg-gray-50/50 dark:bg-gray-900/30 overflow-hidden flex flex-col">
             {cart.length === 0 && !productSearchTerm ? (
                 <div className="p-6 overflow-y-auto custom-scrollbar h-full">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center">
                            <Grid size={14} className="mr-2" /> Quick Access
                        </h3>
                    </div>
                    {quickItems.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {quickItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => addToCart(item)}
                                    disabled={item.stock <= 0}
                                    className="flex flex-col items-start p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-rose-400 dark:hover:border-rose-600 hover:shadow-md transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2 leading-tight mb-2 h-10">{item.name}</span>
                                    <div className="flex justify-between items-end w-full mt-auto">
                                        <span className={`text-[10px] font-bold uppercase ${item.stock < 5 ? 'text-rose-500' : 'text-gray-400'}`}>{item.stock} left</span>
                                        <span className="text-sm font-black text-rose-600 dark:text-rose-400">{symbol} {item.sellPrice}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                             <Package size={24} className="opacity-20 mb-2" />
                             <p className="text-sm font-medium">Add products to see them here</p>
                        </div>
                    )}
                 </div>
             ) : (
                 <div className="flex-1 overflow-auto custom-scrollbar bg-white dark:bg-gray-900">
                     {cart.length > 0 ? (
                         <table className="w-full text-left border-collapse">
                           <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
                             <tr>
                               <th className="py-3 px-4 text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Item</th>
                               <th className="py-3 px-2 text-center text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest w-24">Qty</th>
                               <th className="py-3 px-2 text-right text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest w-20">Price</th>
                               <th className="py-3 px-2 text-center text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest w-16">Disc%</th>
                               <th className="py-3 px-4 text-right text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest w-24">Total</th>
                               <th className="py-3 px-2 w-10"></th>
                             </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                             {cart.map(item => {
                               const qty = Number.isNaN(item.quantity) ? 0 : item.quantity;
                               const price = Number.isNaN(item.sellPrice) ? 0 : item.sellPrice;
                               const discount = Number.isNaN(item.discountPercent) ? 0 : item.discountPercent;
                               const itemTotal = (price * qty) * (1 - discount / 100);
                               
                               return (
                                 <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                   <td className="p-3 px-4">
                                       <div className="font-bold text-gray-900 dark:text-white text-sm">{item.name}</div>
                                       <div className="text-[10px] text-gray-400 uppercase tracking-wide">{item.unit}</div>
                                   </td>
                                   <td className="p-2">
                                       <div className="flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded-lg p-1 bg-white dark:bg-gray-900">
                                            <button onClick={() => adjustQuantity(item.id, -1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500 transition-colors">
                                                <Minus size={12} />
                                            </button>
                                            <input 
                                                type="number" min="1"
                                                value={Number.isNaN(item.quantity) ? '' : item.quantity}
                                                onChange={(e) => updateCartItem(item.id, 'quantity', e.target.valueAsNumber)}
                                                className="w-8 text-center bg-transparent border-none text-sm font-bold text-gray-900 dark:text-white focus:ring-0 p-0"
                                            />
                                            <button onClick={() => adjustQuantity(item.id, 1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500 transition-colors">
                                                <Plus size={12} />
                                            </button>
                                       </div>
                                   </td>
                                   <td className="p-2 text-right">
                                      <input 
                                        type="number" step="0.01"
                                        value={Number.isNaN(item.sellPrice) ? '' : item.sellPrice}
                                        onChange={(e) => updateCartItem(item.id, 'sellPrice', e.target.valueAsNumber)}
                                        className="w-full bg-transparent text-right text-gray-900 dark:text-white font-bold text-sm focus:ring-0 border-b border-transparent hover:border-gray-300 p-0"
                                      />
                                   </td>
                                   <td className="p-2 text-center">
                                     <input 
                                        type="number" min="0" max="100"
                                        value={Number.isNaN(item.discountPercent) ? '' : item.discountPercent}
                                        onChange={(e) => updateCartItem(item.id, 'discountPercent', e.target.valueAsNumber)}
                                        className="w-full bg-transparent text-center text-gray-900 dark:text-white font-bold text-sm focus:ring-0 border-b border-transparent hover:border-gray-300 p-0"
                                        placeholder="0"
                                      />
                                   </td>
                                   <td className="p-3 px-4 text-right font-bold text-gray-900 dark:text-white text-sm">
                                     {symbol} {itemTotal.toFixed(2)}
                                   </td>
                                   <td className="p-3 text-center">
                                     <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded">
                                        <Trash size={16} />
                                     </button>
                                   </td>
                                 </tr>
                               );
                             })}
                           </tbody>
                         </table>
                     ) : (
                         <div className="flex flex-col items-center justify-center h-full text-center p-8">
                             <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-3">
                                <ShoppingCart size={20} className="text-gray-300 dark:text-gray-600" />
                             </div>
                             <p className="text-gray-400 font-medium text-sm">Cart is empty</p>
                         </div>
                     )}
                 </div>
             )}
           </div>
        </div>
      </div>

      {/* Right: Summary Panel */}
      <div className="xl:w-1/3 flex flex-col min-w-[320px]">
        <div className="glass-panel p-6 flex flex-col relative overflow-hidden sticky top-6 h-fit">
           <div className="flex items-center justify-between mb-6 pb-4 border-b border-dashed border-gray-200 dark:border-gray-700">
               <div className="flex items-center space-x-3">
                   <div className="p-2.5 bg-gray-900 dark:bg-white rounded-xl text-white dark:text-gray-900">
                       <Calculator size={20} strokeWidth={2.5} />
                   </div>
                   <div>
                       <h3 className="text-lg font-bold text-gray-900 dark:text-white">Summary</h3>
                       <p className="text-xs text-gray-500 font-bold uppercase">{cart.length} Items</p>
                   </div>
               </div>
               {cart.length > 0 && (
                   <button onClick={() => setCart([])} className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all" title="Clear Cart">
                       <RefreshCw size={16} />
                   </button>
               )}
           </div>
           
           <div className="space-y-3 mb-6">
             <div className="flex justify-between items-center text-sm">
               <span className="text-gray-500 dark:text-gray-400 font-medium">Subtotal</span>
               <span className="font-bold text-gray-900 dark:text-white">{symbol} {totals.subTotal.toFixed(2)}</span>
             </div>
             
             {totals.totalDiscount > 0 && (
                 <div className="flex justify-between items-center text-sm text-emerald-600 dark:text-emerald-400">
                   <span className="font-bold flex items-center"><Tag size={12} className="mr-1.5"/> Discount</span>
                   <span className="font-bold">- {symbol} {totals.totalDiscount.toFixed(2)}</span>
                 </div>
             )}
             
             <div className="flex justify-between items-center text-sm">
               <span className="text-gray-500 dark:text-gray-400 font-medium">Tax ({state.settings.taxName})</span>
               <span className="font-bold text-gray-900 dark:text-white">+ {symbol} {totals.totalTax.toFixed(2)}</span>
             </div>
           </div>

           <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl mb-6">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Payable</span>
                <div className="flex justify-between items-end mt-1">
                    <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{symbol} {totals.grandTotal.toFixed(2)}</span>
                </div>
           </div>

           <button 
                onClick={handleSaveInvoice}
                disabled={cart.length === 0 || !selectedParty}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 rounded-xl flex justify-center items-center transition-all shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
                <Save className="mr-2" size={18} />
                Complete Order
            </button>
        </div>
      </div>

      {/* Quick Add Customer Modal */}
      {isAddCustomerModalOpen && (
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                 <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">New Customer</h2>
                    <button onClick={() => setIsAddCustomerModalOpen(false)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                        <X size={20} />
                    </button>
                 </div>
                 <form onSubmit={handleQuickAddCustomer} className="p-5 space-y-4">
                     <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Name</label>
                        <input 
                            type="text" 
                            autoFocus
                            required
                            value={newCustomerName}
                            onChange={e => setNewCustomerName(e.target.value)}
                            className="block w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none transition-all font-medium text-sm"
                            placeholder="Customer Name"
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Phone</label>
                        <input 
                            type="text" 
                            required
                            value={newCustomerPhone}
                            onChange={e => setNewCustomerPhone(e.target.value)}
                            className="block w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none transition-all font-medium text-sm"
                            placeholder="Phone Number"
                        />
                     </div>
                     <button type="submit" className="w-full py-2.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 shadow-sm font-bold mt-2">
                         Save Customer
                     </button>
                 </form>
             </div>
          </div>
      )}
    </div>
  );
};