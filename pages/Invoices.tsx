import React, { useState } from 'react';
import { useAppStore } from '../context/AppContext';
import { CurrencySymbols, Invoice } from '../types';
import { Search, Eye, FileText } from 'lucide-react';
import { InvoicePreview } from '../components/InvoicePreview';

export const Invoices: React.FC = () => {
  const { state } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  
  const symbol = CurrencySymbols[state.settings.currency];

  const filteredInvoices = state.invoices.filter(inv => 
    inv.partyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    inv.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedInvoice) {
    const party = state.parties.find(p => p.id === selectedInvoice.partyId);
    return (
      <InvoicePreview 
        invoice={selectedInvoice} 
        settings={state.settings} 
        partyDetails={party ? { phone: party.phone, address: party.address } : undefined}
        onBack={() => setSelectedInvoice(null)}
        showBackButton={true}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2 font-display">Invoice History</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">View and manage past transactions.</p>
      </div>

      <div className="glass-panel rounded-3xl shadow-sm border border-white/60 dark:border-gray-800 overflow-hidden transition-all duration-300 flex flex-col min-h-[500px]">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40">
          <div className="relative max-w-md w-full group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-rose-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search by customer or invoice #..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm outline-none font-medium"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto flex-1">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-800 backdrop-blur-sm">
                <th className="px-8 py-5 text-left text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Invoice ID</th>
                <th className="px-8 py-5 text-left text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Customer</th>
                <th className="px-8 py-5 text-center text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Date</th>
                <th className="px-8 py-5 text-right text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Amount</th>
                <th className="px-8 py-5 text-right text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filteredInvoices.map(invoice => (
                <tr key={invoice.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                          <div className="h-10 w-10 rounded-xl bg-white dark:bg-gray-800 text-rose-500 flex items-center justify-center mr-4 border border-gray-100 dark:border-gray-700 shadow-sm">
                              <FileText size={18} />
                          </div>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">#{invoice.id.split('-')[1]}</span>
                      </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{invoice.partyName}</span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-center text-xs text-gray-500 dark:text-gray-400 font-bold">
                      {new Date(invoice.date).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-black text-gray-900 dark:text-white">
                      {symbol} {invoice.grandTotal.toLocaleString()}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => setSelectedInvoice(invoice)} 
                      className="px-4 py-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-lg transition-colors inline-flex items-center font-bold text-xs"
                    >
                      <Eye size={14} className="mr-1.5" /> View
                    </button>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center text-gray-400 dark:text-gray-600">
                    <div className="flex flex-col items-center">
                        <FileText size={48} className="mb-4 opacity-20" />
                        <p className="font-medium">No invoices found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};