import React from 'react';
import { useAppStore } from '../context/AppContext';
import { Wallet, AlertTriangle, TrendingUp, DollarSign, PackageCheck, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CurrencySymbols } from '../types';

export const Dashboard: React.FC = () => {
  const { state } = useAppStore();
  const { invoices, inventory, settings } = state;
  const isDark = settings.theme === 'dark';

  const symbol = CurrencySymbols[settings.currency];

  const totalSales = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  
  // Receivables: Money customers owe us (Positive balances)
  const totalReceivables = state.parties
    .filter(p => p.type === 'Customer' && p.balance > 0)
    .reduce((sum, p) => sum + p.balance, 0);
  
  const cashInHand = Math.max(0, totalSales - totalReceivables);
  const lowStockItems = inventory.filter(item => item.stock < 10).length;

  // Prepare chart data (Sales by Date)
  const salesByDate = invoices.reduce((acc, inv) => {
    const date = new Date(inv.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    acc[date] = (acc[date] || 0) + inv.grandTotal;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(salesByDate).map(date => ({
    name: date,
    sales: salesByDate[date]
  })).slice(-7);

  // Colors for dark/light mode charts
  const axisColor = isDark ? '#64748b' : '#94a3b8';
  const gridColor = isDark ? '#1e293b' : '#f1f5f9';
  const tooltipBg = isDark ? '#0f172a' : '#ffffff';
  const tooltipBorder = isDark ? '#1e293b' : '#e2e8f0';
  const tooltipText = isDark ? '#f8fafc' : '#0f172a';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">Dashboard Overview</h1>
        <p className="text-gray-500 dark:text-gray-400">Welcome back, here is what's happening with your business today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Sales" 
          value={`${symbol} ${totalSales.toLocaleString()}`} 
          icon={TrendingUp} 
          gradient="from-emerald-500 to-teal-500"
          trend="+12% this week"
        />
        <StatsCard 
          title="Cash-in-Hand" 
          value={`${symbol} ${cashInHand.toLocaleString()}`} 
          icon={DollarSign} 
          gradient="from-blue-500 to-indigo-500"
          trend="Healthy"
        />
        <StatsCard 
          title="Receivables" 
          value={`${symbol} ${totalReceivables.toLocaleString()}`} 
          icon={Wallet} 
          gradient="from-purple-500 to-fuchsia-500"
          trend="Pending"
        />
        <StatsCard 
          title="Low Stock Items" 
          value={lowStockItems.toString()} 
          icon={AlertTriangle} 
          gradient="from-rose-500 to-red-500"
          trend="Action needed"
          isAlert
        />
      </div>

      <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-premium hover:shadow-premium-hover transition-all duration-300 border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sales Analytics</h2>
            <select className="bg-gray-50 dark:bg-gray-800 border-none text-sm text-gray-500 dark:text-gray-400 rounded-lg px-3 py-1.5 focus:ring-0">
                <option>Last 7 Days</option>
                <option>Last Month</option>
            </select>
        </div>
        <div className="h-80 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis 
                    dataKey="name" 
                    stroke={axisColor} 
                    tick={{fill: axisColor, fontSize: 12}} 
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                />
                <YAxis 
                    stroke={axisColor} 
                    tick={{fill: axisColor, fontSize: 12}} 
                    tickLine={false}
                    axisLine={false}
                    dx={-10}
                    tickFormatter={(value) => `${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipText, borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: tooltipText, fontWeight: 600 }}
                  cursor={{stroke: '#e11d48', strokeWidth: 1}}
                />
                <Area type="monotone" dataKey="sales" stroke="#e11d48" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
              <TrendingUp size={48} className="mb-4 opacity-20" />
              <p>No sales data to visualize yet</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-premium border border-gray-100 dark:border-gray-800 transition-all duration-300">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Invoices</h2>
                <button className="text-sm text-rose-600 dark:text-rose-400 font-semibold hover:text-rose-700 dark:hover:text-rose-300 transition-colors flex items-center">
                    View All <ArrowUpRight size={16} className="ml-1" />
                </button>
             </div>
             <div className="overflow-hidden">
                <table className="min-w-full">
                   <thead>
                      <tr>
                         <th className="px-1 py-3 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Party</th>
                         <th className="px-1 py-3 text-right text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Amount</th>
                         <th className="px-1 py-3 text-right text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Date</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {invoices.slice(0, 5).map(inv => (
                         <tr key={inv.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <td className="px-1 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="h-8 w-8 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xs font-bold mr-3">
                                        {inv.partyName.charAt(0)}
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{inv.partyName}</span>
                                </div>
                            </td>
                            <td className="px-1 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900 dark:text-white">{symbol} {inv.grandTotal.toLocaleString()}</td>
                            <td className="px-1 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">{new Date(inv.date).toLocaleDateString()}</td>
                         </tr>
                      ))}
                      {invoices.length === 0 && (
                          <tr><td colSpan={3} className="text-center py-10 text-gray-400 dark:text-gray-500">No invoices generated yet</td></tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-premium border border-gray-100 dark:border-gray-800 transition-all duration-300">
             <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Inventory Alerts</h2>
             <div className="space-y-4">
                {inventory.filter(i => i.stock < 10).slice(0, 5).map(item => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/20 hover:scale-[1.02] transition-transform duration-200">
                        <div className="flex items-center space-x-4">
                             <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                <AlertTriangle size={20} className="text-rose-500" />
                             </div>
                             <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{item.name}</p>
                                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">Only {item.stock} {item.unit} remaining</p>
                             </div>
                        </div>
                        <button className="text-xs font-semibold bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                            Restock
                        </button>
                    </div>
                ))}
                {lowStockItems === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center py-10">
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-full mb-3">
                            <PackageCheck size={32} className="text-emerald-500 dark:text-emerald-400"/>
                        </div>
                        <span className="text-gray-900 dark:text-white font-medium">Inventory Health 100%</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">No low stock items found.</p>
                    </div>
                )}
             </div>
          </div>
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, icon: Icon, gradient, trend, isAlert }: any) => (
  <div className="relative overflow-hidden bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-premium border border-gray-100 dark:border-gray-800 group hover:-translate-y-1 transition-all duration-300">
    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon size={80} />
    </div>
    <div className="flex items-center space-x-4 mb-4">
        <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
            <Icon size={24} />
        </div>
        <div className={`text-xs font-bold px-2 py-1 rounded-lg ${isAlert ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
            {trend}
        </div>
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</p>
    </div>
  </div>
);