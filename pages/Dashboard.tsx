import React, { useState } from 'react';
import { useAppStore } from '../context/AppContext';
import { Wallet, AlertTriangle, TrendingUp, DollarSign, PackageCheck, ArrowUpRight, BarChart3, PieChart, Coins, Package, ArrowRight, Plus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { CurrencySymbols, InventoryItem } from '../types';

interface DashboardProps {
    onNavigate?: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { state } = useAppStore();
  const { invoices, inventory, settings } = state;
  const isDark = settings.theme === 'dark';
  const [productMetric, setProductMetric] = useState<'quantity' | 'profit'>('quantity');

  const symbol = CurrencySymbols[settings.currency];

  const totalSales = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  
  // Calculate Profit
  const totalProfit = invoices.reduce((sum, inv) => {
    const invoiceCost = inv.items.reduce((c, item) => c + ((item.buyPrice || 0) * item.quantity), 0);
    return sum + (inv.subTotal - invoiceCost);
  }, 0);

  // Profit Margin
  const totalNetSales = invoices.reduce((sum, inv) => sum + inv.subTotal, 0);
  const profitMargin = totalNetSales > 0 ? ((totalProfit / totalNetSales) * 100).toFixed(1) : '0';
  
  // Receivables
  const totalReceivables = state.parties
    .filter(p => p.type === 'Customer' && p.balance > 0)
    .reduce((sum, p) => sum + p.balance, 0);
  
  const cashInHand = Math.max(0, totalSales - totalReceivables);
  const lowStockItems = inventory.filter(item => item.stock < 10).length;

  const handleRestock = (item: InventoryItem) => {
      if (onNavigate) {
          onNavigate('inventory');
      }
  };

  const chartDataMap = invoices.reduce((acc, inv) => {
    const date = new Date(inv.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    if (!acc[date]) acc[date] = { sales: 0, profit: 0 };
    acc[date].sales += inv.grandTotal;
    const invoiceCost = inv.items.reduce((c, item) => c + ((item.buyPrice || 0) * item.quantity), 0);
    acc[date].profit += (inv.subTotal - invoiceCost);
    return acc;
  }, {} as Record<string, { sales: number, profit: number }>);

  const chartData = Object.keys(chartDataMap).map(date => ({
    name: date,
    sales: chartDataMap[date].sales,
    profit: chartDataMap[date].profit
  })).slice(-7);

  const productStats = invoices.reduce((acc, inv) => {
    inv.items.forEach(item => {
        if (!acc[item.name]) acc[item.name] = { quantity: 0, profit: 0 };
        acc[item.name].quantity += item.quantity;
        const itemTotal = item.sellPrice * item.quantity;
        const discountAmount = (itemTotal * item.discountPercent) / 100;
        const revenue = itemTotal - discountAmount;
        const cost = (item.buyPrice || 0) * item.quantity;
        acc[item.name].profit += (revenue - cost);
    });
    return acc;
  }, {} as Record<string, { quantity: number, profit: number }>);

  const topProductsData = Object.keys(productStats)
    .map(name => ({ 
        name: name.length > 15 ? name.substring(0, 15) + '...' : name, 
        value: productMetric === 'quantity' ? productStats[name].quantity : productStats[name].profit
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const BAR_COLORS = ['#e11d48', '#f97316', '#eab308', '#10b981', '#3b82f6'];
  const axisColor = isDark ? '#64748b' : '#94a3b8';
  const gridColor = isDark ? '#1e293b' : '#f1f5f9';
  const tooltipBg = isDark ? '#0f172a' : '#ffffff';
  const tooltipBorder = isDark ? '#1e293b' : '#e2e8f0';

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
             Dashboard
           </h1>
           <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1">
             Business overview and performance metrics.
           </p>
        </div>
        <div className="flex space-x-3 w-full md:w-auto justify-end">
           <div className="flex items-center gap-2">
              <button onClick={() => onNavigate?.('billing')} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:opacity-90 transition-opacity flex items-center">
                 <Plus size={16} className="mr-1.5" /> New Sale
              </button>
              <button onClick={() => onNavigate?.('inventory')} className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg text-sm font-bold shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center">
                 <Package size={16} className="mr-1.5" /> Product
              </button>
           </div>
        </div>
      </div>

      {/* Stats Cards - Clean Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatsCard 
          title="Total Sales" 
          value={`${symbol} ${totalSales.toLocaleString()}`} 
          icon={TrendingUp} 
          trend="+12% vs last week"
          trendPositive={true}
        />
        <StatsCard 
          title="Net Profit" 
          value={`${symbol} ${totalProfit.toLocaleString()}`} 
          icon={Coins} 
          trend={`${profitMargin}% Margin`}
          trendPositive={true}
        />
        <StatsCard 
          title="Cash in Hand" 
          value={`${symbol} ${cashInHand.toLocaleString()}`} 
          icon={DollarSign} 
          trend="Available"
          trendPositive={true}
        />
        <StatsCard 
          title="Receivables" 
          value={`${symbol} ${totalReceivables.toLocaleString()}`} 
          icon={Wallet} 
          trend="Pending Collection"
          trendPositive={false}
        />
        <StatsCard 
          title="Low Stock" 
          value={lowStockItems.toString()} 
          icon={AlertTriangle} 
          trend={lowStockItems > 0 ? "Action Needed" : "Inventory OK"}
          trendPositive={lowStockItems === 0}
          isAlert={lowStockItems > 0}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Sales Chart */}
          <div className="lg:col-span-2 glass-panel p-6 flex flex-col h-[400px]">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Revenue & Profit</h2>
                    <p className="text-xs text-gray-500 font-medium mt-1">Comparison over the last 7 days</p>
                </div>
                <BarChart3 className="text-gray-400" size={20} />
            </div>
            <div className="flex-1 w-full min-h-0">
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#e11d48" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis 
                        dataKey="name" 
                        stroke={axisColor} 
                        tick={{fill: axisColor, fontSize: 11, fontWeight: 500}} 
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                    />
                    <YAxis 
                        stroke={axisColor} 
                        tick={{fill: axisColor, fontSize: 11, fontWeight: 500}} 
                        tickLine={false}
                        axisLine={false}
                        dx={-10}
                        tickFormatter={(value) => `${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`}
                    />
                    <Tooltip 
                    contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: isDark ? '#fff' : '#000', borderRadius: '8px', padding: '12px', border: '1px solid ' + tooltipBorder }}
                    itemStyle={{ fontWeight: 600, fontSize: '12px' }}
                    labelStyle={{ fontWeight: 700, marginBottom: '4px', color: isDark ? '#94a3b8' : '#64748b' }}
                    cursor={{stroke: '#e11d48', strokeWidth: 1, strokeDasharray: '4 4'}}
                    formatter={(value: number, name: string) => [`${symbol} ${value.toLocaleString()}`, name]}
                    />
                    <Area 
                        name="Sales"
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#e11d48" 
                        strokeWidth={2} 
                        fillOpacity={1} 
                        fill="url(#colorSales)" 
                        activeDot={{ r: 4, fill: '#e11d48', stroke: '#fff', strokeWidth: 2 }}
                    />
                    <Area 
                        name="Profit"
                        type="monotone" 
                        dataKey="profit" 
                        stroke="#10b981" 
                        strokeWidth={2} 
                        fillOpacity={1} 
                        fill="url(#colorProfit)" 
                        activeDot={{ r: 4, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                    />
                </AreaChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 bg-gray-50/50 dark:bg-gray-800/20 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                    <TrendingUp size={32} className="mb-2 opacity-20" />
                    <p className="text-sm font-medium">No sales data available</p>
                </div>
            )}
            </div>
          </div>

          {/* Top Products Chart */}
          <div className="glass-panel p-6 flex flex-col h-[400px]">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Top Products</h2>
                    <p className="text-xs text-gray-500 font-medium mt-1">Best performers</p>
                </div>
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    <button 
                        onClick={() => setProductMetric('quantity')}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${productMetric === 'quantity' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Qty
                    </button>
                    <button 
                        onClick={() => setProductMetric('profit')}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${productMetric === 'profit' ? 'bg-white dark:bg-gray-700 shadow-sm text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        $$
                    </button>
                </div>
            </div>
            <div className="flex-1 w-full min-h-0">
              {topProductsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProductsData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={gridColor} />
                        <XAxis type="number" hide />
                        <YAxis 
                            type="category" 
                            dataKey="name" 
                            tick={{fill: axisColor, fontSize: 11, fontWeight: 500}} 
                            width={100}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip 
                            cursor={{fill: isDark ? '#1e293b' : '#f8fafc', opacity: 0.5}}
                            contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: isDark ? '#fff' : '#000', borderRadius: '8px', padding: '12px', border: '1px solid ' + tooltipBorder }}
                            formatter={(value: number) => [
                                productMetric === 'profit' ? `${symbol} ${value.toLocaleString()}` : value, 
                                productMetric === 'profit' ? 'Profit' : 'Quantity'
                            ]}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                            {topProductsData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={productMetric === 'profit' ? '#10b981' : BAR_COLORS[index % BAR_COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 bg-gray-50/50 dark:bg-gray-800/20 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                    <PieChart size={32} className="mb-2 opacity-20" />
                    <p className="text-sm font-medium">No product data available</p>
                </div>
              )}
            </div>
          </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Invoices Table */}
          <div className="glass-panel p-6 overflow-hidden">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Invoices</h2>
                {onNavigate && (
                    <button onClick={() => onNavigate('invoices')} className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 hover:text-rose-700 transition-colors flex items-center group">
                        View All <ArrowRight size={14} className="ml-1 transition-transform group-hover:translate-x-1" />
                    </button>
                )}
             </div>
             <div className="overflow-x-auto">
                <table className="min-w-full">
                   <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                         <th className="px-1 py-3 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Party</th>
                         <th className="px-1 py-3 text-right text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Amount</th>
                         <th className="px-1 py-3 text-right text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Profit</th>
                         <th className="px-1 py-3 text-right text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Date</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                      {invoices.slice(0, 5).map(inv => {
                         const cost = inv.items.reduce((c, i) => c + ((i.buyPrice || 0) * i.quantity), 0);
                         const profit = inv.subTotal - cost;
                         return (
                             <tr key={inv.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <td className="px-1 py-3 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex items-center justify-center text-xs font-bold mr-3 border border-gray-200 dark:border-gray-700">
                                            {inv.partyName.charAt(0)}
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{inv.partyName}</span>
                                    </div>
                                </td>
                                <td className="px-1 py-3 whitespace-nowrap text-sm text-right font-bold text-gray-900 dark:text-white">{symbol} {inv.grandTotal.toLocaleString()}</td>
                                <td className="px-1 py-3 whitespace-nowrap text-sm text-right font-medium text-emerald-600 dark:text-emerald-400">+{symbol} {profit.toLocaleString()}</td>
                                <td className="px-1 py-3 whitespace-nowrap text-xs text-right text-gray-500 font-medium">{new Date(inv.date).toLocaleDateString()}</td>
                             </tr>
                         );
                      })}
                      {invoices.length === 0 && (
                          <tr><td colSpan={4} className="text-center py-8 text-sm text-gray-400">No invoices generated yet</td></tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>

          {/* Inventory Alerts */}
          <div className="glass-panel p-6">
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Inventory Alert</h2>
                {lowStockItems > 0 && (
                    <span className="px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold border border-rose-100 dark:border-rose-900/30">
                        {lowStockItems} Items Low
                    </span>
                )}
             </div>
             <div className="space-y-3">
                {inventory.filter(i => i.stock < 10).slice(0, 5).map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center space-x-3">
                             <div className="p-2 bg-white dark:bg-gray-800 rounded-lg text-rose-500 shadow-sm border border-gray-100 dark:border-gray-700">
                                <Package size={16} strokeWidth={2} />
                             </div>
                             <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{item.name}</p>
                                <div className="flex items-center mt-1">
                                    <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mr-2">
                                        <div className="h-full bg-rose-500 w-1/4 rounded-full"></div>
                                    </div>
                                    <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider">
                                        {item.stock} left
                                    </p>
                                </div>
                             </div>
                        </div>
                        <button 
                            onClick={() => handleRestock(item)}
                            className="text-xs font-bold bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 hover:text-rose-600 transition-colors shadow-sm"
                        >
                            Restock
                        </button>
                    </div>
                ))}
                {lowStockItems === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center py-8">
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-full mb-3">
                            <PackageCheck size={24} className="text-emerald-500" />
                        </div>
                        <span className="text-gray-900 dark:text-white font-bold text-sm">Inventory Healthy</span>
                        <p className="text-xs text-gray-500 mt-1">All items are well stocked.</p>
                    </div>
                )}
             </div>
          </div>
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, icon: Icon, trend, trendPositive, isAlert }: any) => {
    return (
        <div className={`glass-panel p-5 relative overflow-hidden group ${isAlert ? 'border-rose-200 dark:border-rose-900/50' : ''}`}>
            <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${isAlert ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                    <Icon size={20} />
                </div>
            </div>
            
            <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</p>
                <p className={`text-xs font-medium mt-2 flex items-center ${trendPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {trendPositive && <ArrowUpRight size={12} className="mr-1"/>}
                    {trend}
                </p>
            </div>
        </div>
    );
};