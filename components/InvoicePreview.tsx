import React from 'react';
import { Invoice, AppSettings, CurrencySymbols } from '../types';
import { ArrowLeft, Printer } from 'lucide-react';

interface InvoicePreviewProps {
  invoice: Invoice;
  settings: AppSettings;
  partyDetails?: {
    phone: string;
    address?: string;
  };
  onBack?: () => void;
  showBackButton?: boolean;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ 
  invoice, 
  settings, 
  partyDetails, 
  onBack,
  showBackButton = true
}) => {
  const symbol = CurrencySymbols[settings.currency];

  return (
    <div className="max-w-4xl mx-auto my-8 animate-in fade-in slide-in-from-bottom-4 duration-500 print:m-0 print:w-full print:max-w-none print:shadow-none">
      {/* Actions Bar */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <div>
           {showBackButton && onBack && (
             <button onClick={onBack} className="flex items-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors font-bold text-sm">
               <ArrowLeft className="mr-2" size={18} /> Back
             </button>
           )}
        </div>
        <button onClick={() => window.print()} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-gray-900/20 dark:shadow-none hover:-translate-y-0.5 transition-all flex items-center text-sm">
          <Printer size={18} className="mr-2" /> Print Invoice
        </button>
      </div>

      {/* Invoice Paper */}
      <div className="bg-white text-gray-900 shadow-2xl shadow-gray-200/50 dark:shadow-black/30 rounded-3xl overflow-hidden print:shadow-none print:rounded-none print:w-full border border-gray-100 print:border-none relative">
        
        {/* Decorative Top Bar */}
        <div className="h-2 w-full bg-gray-900 print:bg-gray-900"></div>

        <div className="p-12 md:p-16 print:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-10">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 uppercase mb-2 leading-none font-display">{settings.businessName}</h1>
                    <p className="text-gray-500 font-medium whitespace-pre-line leading-relaxed max-w-xs text-sm">{settings.businessAddress}</p>
                </div>
                <div className="text-right">
                    <div className="mb-6">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Invoice No.</p>
                        <p className="text-2xl font-black text-gray-900 tracking-tight leading-none">#{invoice.id.split('-')[1]}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date Issued</p>
                        <p className="text-lg font-bold text-gray-900">{new Date(invoice.date).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            {/* Bill To Section */}
            <div className="mb-16 p-6 bg-gray-50 rounded-xl border border-gray-100 print:bg-transparent print:border-none print:p-0">
                <div className="mb-4">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bill To</h3>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2 font-display">{invoice.partyName}</div>
                <div className="text-gray-500 font-medium leading-relaxed text-sm">
                    <p>{partyDetails?.phone}</p>
                    <p className="whitespace-pre-line max-w-xs">{partyDetails?.address}</p>
                </div>
            </div>

            {/* Table */}
            <div className="mb-12">
                <table className="w-full">
                    <thead>
                        <tr className="border-b-2 border-gray-900">
                            <th className="py-4 text-left text-[10px] font-extrabold text-gray-900 uppercase tracking-widest">Description</th>
                            <th className="py-4 text-center text-[10px] font-extrabold text-gray-900 uppercase tracking-widest">Qty</th>
                            <th className="py-4 text-right text-[10px] font-extrabold text-gray-900 uppercase tracking-widest">Price</th>
                            <th className="py-4 text-right text-[10px] font-extrabold text-gray-900 uppercase tracking-widest">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {invoice.items.map((item, idx) => {
                             const lineTotal = (item.sellPrice * item.quantity) - ((item.sellPrice * item.quantity * item.discountPercent) / 100);
                             return (
                            <tr key={idx}>
                                <td className="py-5">
                                    <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                                    {item.discountPercent > 0 && <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full mt-1.5 inline-block print:text-rose-600 print:bg-transparent print:p-0 print:border print:border-rose-200">Discount: {item.discountPercent}%</span>}
                                </td>
                                <td className="py-5 text-center font-bold text-gray-600 text-sm">{item.quantity}</td>
                                <td className="py-5 text-right font-medium text-gray-600 text-sm">{symbol} {item.sellPrice.toLocaleString()}</td>
                                <td className="py-5 text-right font-bold text-gray-900 text-sm">{symbol} {lineTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            </tr>
                        )})}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="flex flex-col md:flex-row justify-between items-start pt-8 border-t border-gray-100">
                <div className="w-full md:w-1/2 mb-10 md:mb-0">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Terms & Conditions</h4>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-sm">
                        Payment is due within 15 days. Please include the invoice number on your check. Thank you for your business!
                    </p>
                </div>
                
                <div className="w-full md:w-5/12 lg:w-4/12">
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-500">Subtotal</span>
                            <span className="font-bold text-gray-900">{symbol} {invoice.subTotal.toFixed(2)}</span>
                        </div>
                        {invoice.totalDiscount > 0 && (
                            <div className="flex justify-between text-sm text-rose-600">
                                <span className="font-medium">Discount</span>
                                <span className="font-bold">- {symbol} {invoice.totalDiscount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-500">Tax ({settings.taxName})</span>
                            <span className="font-bold text-gray-900">+ {symbol} {invoice.totalTax.toFixed(2)}</span>
                        </div>
                        
                        <div className="pt-4 mt-4 border-t-2 border-gray-900">
                            <div className="flex justify-between items-end">
                                <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">Total Due</span>
                                <span className="text-3xl font-black text-gray-900 tracking-tighter leading-none">{symbol} {invoice.grandTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-12 text-right">
                         <div className="inline-block border-t border-gray-300 w-32 pt-2 text-center">
                             <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Authorized Signature</span>
                         </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};