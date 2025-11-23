import React, { useState } from 'react';
import { useAppStore } from '../context/AppContext';
import { CartItem } from '../types';
import { Plus, Trash, Printer, Save, Calculator, FileCheck, ArrowLeft, ShoppingCart, Calendar } from 'lucide-react';
import { CurrencySymbols } from '../types';

export const Billing: React.FC = () => {
  const { state, dispatch } = useAppStore();
  const symbol = CurrencySymbols[state.settings.currency];
  
  // Invoice State
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  
  // Initialize date with local timezone instead of UTC
  const [invoiceDate, setInvoiceDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [lastInvoiceId, setLastInvoiceId] = useState<string>("");

  const selectedParty = state.parties.find(p => p.id === selectedPartyId);
  const selectedInventoryItem = state.inventory.find(i => i.id === selectedItemId);

  const addItemToCart = () => {
    if (!selectedInventoryItem) return;
    
    // Check if already in cart
    const existing = cart.find(c => c.id === selectedInventoryItem.id);
    if (existing) {
      setCart(cart.map(c => c.id === existing.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { ...selectedInventoryItem, quantity: 1, discountPercent: 0 }]);
    }
    setSelectedItemId('');
  };

  const updateCartItem = (id: string, field: 'quantity' | 'discountPercent' | 'sellPrice', value: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // Calculations
  const calculateTotals = () => {
    let subTotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    cart.forEach(item => {
      // Handle NaN for calculations (treat as 0)
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

    // Sanitize cart items before saving (no NaNs)
    const sanitizedCart = cart.map(item => ({
        ...item,
        quantity: item.quantity || 1,
        sellPrice: item.sellPrice || 0,
        discountPercent: item.discountPercent || 0
    }));

    const invoiceId = `INV-${Date.now()}`;
    const invoice = {
      id: invoiceId,
      date: invoiceDate,
      partyId: selectedParty.id,
      partyName: selectedParty.name,
      items: sanitizedCart,
      ...totals // Totals are already calculated safely
    };

    dispatch({ type: 'CREATE_INVOICE', payload: invoice });
    setLastInvoiceId(invoiceId);
    setShowInvoicePreview(true);
  };

  const handleNewInvoice = () => {
    setCart([]);
    setSelectedPartyId('');
    setShowInvoicePreview(false);
    setLastInvoiceId('');
  };

  if (showInvoicePreview) {
    const invoice = state.invoices.find(i => i.id === lastInvoiceId);
    if (!invoice) return <div>Invoice not found</div>;

    return (
      <div className="max-w-4xl mx-auto my-4 relative animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="flex justify-between items-center mb-8 print:hidden">
          <div className="flex items-center space-x-4">
             <button onClick={handleNewInvoice} className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors">
               <ArrowLeft className="mr-2" size={20} /> New Invoice
             </button>
          </div>
          <button onClick={() => window.print()} className="px-6 py-3 bg-gradient-to-r from-rose-600 to-orange-600 text-white rounded-xl hover:shadow-lg flex items-center transition-all font-semibold">
            <Printer size={18} className="mr-2" /> Print PDF
          </button>
        </div>

        {/* Premium SaaS Style Invoice Preview */}
        <div className="bg-white text-gray-900 shadow-2xl rounded-none print:shadow-none print:w-full print:absolute print:top-0 print:left-0 print:text-black">
          {/* Top Border Accent */}
          <div className="h-2 w-full bg-gradient-to-r from-rose-600 to-orange-600"></div>
          
          <div className="p-16">
            {/* Header */}
            <div className="flex justify-between items-start mb-16">
              <div>
                <h1 className="text-3xl font-extrabold text-rose-600 tracking-tight mb-2">{state.settings.businessName}</h1>
                <div className="text-gray-500 text-sm leading-relaxed max-w-xs">
                    {state.settings.businessAddress}
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-5xl font-black text-gray-100 tracking-tighter mb-4">INVOICE</h2>
                <div className="flex flex-col space-y-1">
                    <div className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Invoice Number</div>
                    <div className="text-xl font-bold text-gray-900">#{invoice.id.split('-')[1]}</div>
                </div>
                <div className="flex flex-col space-y-1 mt-4">
                    <div className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Date Issued</div>
                    <div className="text-xl font-bold text-gray-900">{new Date(invoice.date).toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            {/* Bill To Grid */}
            <div className="grid grid-cols-2 gap-12 mb-16">
              <div>
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Bill To</h3>
                 <p className="text-xl font-bold text-gray-900 mb-1">{invoice.partyName}</p>
                 <div className="text-gray-600 text-sm space-y-1">
                    <p>{state.parties.find(p => p.id === invoice.partyId)?.phone}</p>
                    <p>{state.parties.find(p => p.id === invoice.partyId)?.address}</p>
                 </div>
              </div>
              <div className="flex flex-col justify-end items-end">
                {/* Could add Ship To here later */}
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-12">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-900 text-white">
                            <th className="py-4 px-6 text-left text-xs font-bold uppercase tracking-wider rounded-l-lg">Item Description</th>
                            <th className="py-4 px-6 text-right text-xs font-bold uppercase tracking-wider">Qty</th>
                            <th className="py-4 px-6 text-right text-xs font-bold uppercase tracking-wider">Price</th>
                            <th className="py-4 px-6 text-right text-xs font-bold uppercase tracking-wider">Disc.</th>
                            <th className="py-4 px-6 text-right text-xs font-bold uppercase tracking-wider">Tax</th>
                            <th className="py-4 px-6 text-right text-xs font-bold uppercase tracking-wider rounded-r-lg">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700 text-sm">
                        {invoice.items.map((item, idx) => {
                             const baseTotal = item.sellPrice * item.quantity;
                             const disc = (baseTotal * item.discountPercent) / 100;
                             const taxable = baseTotal - disc;
                             const tax = (taxable * item.taxPercent) / 100;
                             const final = taxable + tax;
                            return (
                                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="py-5 px-6 font-medium border-b border-gray-100">{item.name}</td>
                                    <td className="py-5 px-6 text-right border-b border-gray-100">{item.quantity}</td>
                                    <td className="py-5 px-6 text-right border-b border-gray-100">{symbol} {item.sellPrice.toLocaleString()}</td>
                                    <td className="py-5 px-6 text-right border-b border-gray-100 text-rose-600">{item.discountPercent > 0 ? `-${item.discountPercent}%` : '-'}</td>
                                    <td className="py-5 px-6 text-right border-b border-gray-100">{symbol} {tax.toFixed(2)}</td>
                                    <td className="py-5 px-6 text-right font-bold border-b border-gray-100">{symbol} {final.toFixed(2)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-16">
               <div className="w-80">
                  <div className="flex justify-between py-3 border-b border-gray-100">
                     <span className="font-medium text-gray-600">Subtotal</span>
                     <span className="font-bold text-gray-900">{symbol} {invoice.subTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                     <span className="font-medium text-gray-600">Discount</span>
                     <span className="font-bold text-rose-600">({symbol} {invoice.totalDiscount.toFixed(2)})</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                     <span className="font-medium text-gray-600">Total Tax ({state.settings.taxName})</span>
                     <span className="font-bold text-gray-900">{symbol} {invoice.totalTax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-4 mt-2">
                     <span className="text-xl font-bold text-gray-900">Grand Total</span>
                     <span className="text-2xl font-black text-rose-600">{symbol} {invoice.grandTotal.toFixed(2)}</span>
                  </div>
               </div>
            </div>

            {/* Footer / Terms */}
            <div className="flex justify-between items-end border-t-2 border-gray-100 pt-8">
               <div className="max-w-md">
                  <h4 className="font-bold text-gray-900 mb-2 text-sm uppercase">Terms & Conditions</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    Payment is due within 15 days. Please include invoice number on your check. 
                    Thank you for your business.
                  </p>
               </div>
               <div className="text-center">
                  <div className="h-16 w-48 border-b border-gray-300 mb-2"></div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Authorized Signatory</p>
               </div>
            </div>
          </div>
          {/* Bottom Accent */}
           <div className="h-4 w-full bg-gray-900"></div>
        </div>
      </div>
    );
  }

  // POS INTERFACE
  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-8rem)] h-auto">
      {/* Left: Input & Cart */}
      <div className="lg:w-2/3 flex flex-col gap-6 overflow-hidden">
        {/* Header Inputs */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-premium border border-gray-100 dark:border-gray-800 transition-all shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="relative">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Customer</label>
                <select 
                  className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl p-3.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none appearance-none transition-all font-medium"
                  value={selectedPartyId}
                  onChange={e => setSelectedPartyId(e.target.value)}
                >
                  <option value="">Select Customer...</option>
                  {state.parties.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-9 pointer-events-none text-gray-400">▼</div>
             </div>
             <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Date</label>
                <div className="relative">
                    <input 
                    type="date" 
                    className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl p-3.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none transition-all font-medium"
                    value={invoiceDate}
                    onChange={e => setInvoiceDate(e.target.value)}
                    />
                    <Calendar className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" size={20} />
                </div>
             </div>
          </div>
        </div>

        {/* Product Selection & Cart Table */}
        <div className="flex-1 bg-white dark:bg-gray-900 rounded-3xl shadow-premium border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden transition-all min-h-[400px]">
           <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20 shrink-0">
              <div className="flex gap-3">
                  <div className="relative flex-1">
                      <select 
                        className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl p-3.5 pl-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none appearance-none transition-all font-medium shadow-sm"
                        value={selectedItemId}
                        onChange={e => setSelectedItemId(e.target.value)}
                    >
                        <option value="">Select Product to Add...</option>
                        {state.inventory.map(item => (
                        <option key={item.id} value={item.id} disabled={item.stock <= 0}>
                            {item.name} — {symbol} {item.sellPrice} ({item.stock} in stock)
                        </option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-3.5 pointer-events-none text-gray-400">▼</div>
                  </div>
                  <button 
                    onClick={addItemToCart}
                    disabled={!selectedItemId}
                    className="bg-rose-600 text-white px-6 rounded-xl hover:bg-rose-700 disabled:opacity-50 disabled:hover:bg-rose-600 transition-colors shadow-lg hover:shadow-xl font-bold"
                  >
                    <Plus size={24} />
                  </button>
              </div>
           </div>

           <div className="flex-1 overflow-auto p-2">
             <table className="w-full text-left border-collapse">
               <thead className="text-gray-400 dark:text-gray-500 uppercase font-bold text-xs sticky top-0 bg-white dark:bg-gray-900 z-10">
                 <tr>
                   <th className="p-4">Product</th>
                   <th className="p-4 w-24">Qty</th>
                   <th className="p-4 w-32">Price</th>
                   <th className="p-4 w-24">Disc %</th>
                   <th className="p-4 text-right">Total</th>
                   <th className="p-4 w-12"></th>
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
                       <td className="p-4 font-semibold text-gray-900 dark:text-white">{item.name}</td>
                       <td className="p-4">
                         <input 
                          type="number" min="1" max={state.inventory.find(i => i.id === item.id)?.stock}
                          value={Number.isNaN(item.quantity) ? '' : item.quantity}
                          onChange={(e) => updateCartItem(item.id, 'quantity', e.target.valueAsNumber)}
                          onWheel={(e) => e.currentTarget.blur()}
                          className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg p-2 text-center text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none font-bold"
                         />
                       </td>
                       <td className="p-4">
                          <input 
                            type="number" 
                            value={Number.isNaN(item.sellPrice) ? '' : item.sellPrice}
                            onChange={(e) => updateCartItem(item.id, 'sellPrice', e.target.valueAsNumber)}
                            onWheel={(e) => e.currentTarget.blur()}
                            className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg p-2 text-right text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none font-medium"
                          />
                       </td>
                       <td className="p-4">
                         <input 
                            type="number" min="0" max="100"
                            value={Number.isNaN(item.discountPercent) ? '' : item.discountPercent}
                            onChange={(e) => updateCartItem(item.id, 'discountPercent', e.target.valueAsNumber)}
                            onWheel={(e) => e.currentTarget.blur()}
                            className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg p-2 text-center text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none font-medium"
                          />
                       </td>
                       <td className="p-4 text-right font-bold text-gray-900 dark:text-white text-lg">
                         {symbol} {itemTotal.toFixed(2)}
                       </td>
                       <td className="p-4 text-center">
                         <button 
                            className="p-2 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 opacity-0 group-hover:opacity-100" 
                            onClick={() => removeFromCart(item.id)}
                         >
                            <Trash size={18} />
                         </button>
                       </td>
                     </tr>
                   );
                 })}
                 {cart.length === 0 && (
                   <tr>
                     <td colSpan={6} className="text-center py-20 text-gray-400 dark:text-gray-600">
                        <div className="flex flex-col items-center">
                            <ShoppingCart size={48} className="mb-4 opacity-20" />
                            <p>Your cart is currently empty.</p>
                        </div>
                     </td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>
        </div>
      </div>

      {/* Right: Summary Panel */}
      <div className="lg:w-1/3 flex flex-col shrink-0">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-premium border border-gray-100 dark:border-gray-800 p-8 flex flex-col h-full sticky top-6 transition-all">
           <h3 className="text-xl font-bold mb-8 flex items-center text-gray-900 dark:text-white">
               <Calculator className="mr-3 text-rose-500" /> Order Summary
           </h3>
           
           <div className="space-y-4 flex-1">
             <div className="flex justify-between items-center text-gray-600 dark:text-gray-300">
               <span>Subtotal</span>
               <span className="font-bold text-gray-900 dark:text-white">{symbol} {totals.subTotal.toFixed(2)}</span>
             </div>
             <div className="flex justify-between items-center text-rose-600 dark:text-rose-400">
               <span>Discount</span>
               <span className="font-bold">- {symbol} {totals.totalDiscount.toFixed(2)}</span>
             </div>
             <div className="flex justify-between items-center text-gray-600 dark:text-gray-300">
               <span>Tax ({state.settings.taxName})</span>
               <span className="font-bold text-gray-900 dark:text-white">+ {symbol} {totals.totalTax.toFixed(2)}</span>
             </div>

             <div className="my-6 border-t border-dashed border-gray-200 dark:border-gray-700"></div>

             <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl">
                <span className="text-lg font-bold text-gray-500 dark:text-gray-400">Total</span>
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{symbol} {totals.grandTotal.toFixed(2)}</span>
             </div>
           </div>

           <button 
             onClick={handleSaveInvoice}
             disabled={cart.length === 0 || !selectedParty}
             className="mt-8 w-full bg-gradient-to-r from-rose-600 to-orange-600 text-white font-bold py-4 rounded-2xl flex justify-center items-center transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none tracking-wide text-lg"
           >
             <Save className="mr-2" size={24} />
             Generate Invoice
           </button>
        </div>
      </div>
    </div>
  );
};