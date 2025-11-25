import React, { useState } from 'react';
import { useAppStore } from '../context/AppContext';
import { BrainCircuit, Send, Loader2, Sparkles, ArrowRight, Bot, User, Stars, AlertTriangle, FileText, TrendingUp, CheckCircle2 } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';

interface Recommendation {
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  action: string;
}

interface BusinessReport {
  healthScore: number;
  summary: string;
  keyTrends: string[];
  recommendations: Recommendation[];
}

export const AIAnalysis: React.FC = () => {
  const { state } = useAppStore();
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [reportData, setReportData] = useState<BusinessReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isReportMode, setIsReportMode] = useState(false);

  const apiKey = process.env.API_KEY || ''; 

  const quickPrompts = [
    "What are my best selling products?",
    "Identify low stock items needing restock",
    "Draft a payment reminder email",
    "Analyze my sales trend for this week",
  ];

  const handleAskGemini = async (textOverride?: string, forceReport = false) => {
    const textToUse = textOverride || prompt;
    if (!textToUse.trim() && !forceReport) return;
    
    setError('');
    
    if (!apiKey) {
      setError("API Key is missing. Please configure VITE_API_KEY in your .env file.");
      return;
    }

    if (textOverride) setPrompt(textOverride);
    setIsLoading(true);
    setResponse('');
    setReportData(null);
    setIsReportMode(forceReport);

    try {
      // Prepare rich context
      const contextData = {
        totalSales: state.invoices.reduce((sum, i) => sum + i.grandTotal, 0),
        invoiceCount: state.invoices.length,
        inventoryCount: state.inventory.reduce((sum, i) => sum + i.stock, 0),
        lowStockItems: state.inventory.filter(i => i.stock < 10).map(i => ({ name: i.name, stock: i.stock })),
        topProducts: state.inventory.slice(0, 10).map(i => ({ name: i.name, price: i.sellPrice, stock: i.stock })),
        recentActivity: state.invoices.slice(0, 5).map(i => ({ date: i.date, total: i.grandTotal, customer: i.partyName }))
      };

      const systemInstruction = `
        You are an expert business analyst for 'Organise karo' ERP.
        Analyze the provided JSON data about sales, inventory, and customers.
        ${forceReport ? 'Generate a comprehensive, structured business health report.' : 'Provide a helpful, concise text response.'}
      `;

      const ai = new GoogleGenAI({ apiKey });
      
      let requestConfig: any = {
        systemInstruction: systemInstruction,
      };

      if (forceReport) {
        requestConfig = {
          ...requestConfig,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              healthScore: { 
                type: Type.NUMBER, 
                description: "A score from 0 to 100 representing overall business health based on sales and inventory." 
              },
              summary: { 
                type: Type.STRING, 
                description: "A professional executive summary of the business status." 
              },
              keyTrends: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "List of 3-5 observed patterns or trends in the data."
              },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                    action: { type: Type.STRING, description: "Specific actionable advice." }
                  }
                }
              }
            }
          }
        };
      }

      const finalPrompt = forceReport 
        ? `Generate a full business health report based on this data: ${JSON.stringify(contextData)}` 
        : `User Question: "${textToUse}". Business Data: ${JSON.stringify(contextData)}`;

      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: finalPrompt,
        config: requestConfig
      });

      if (forceReport) {
        const jsonText = result.text || '{}';
        setReportData(JSON.parse(jsonText));
      } else {
        setResponse(result.text || "No response generated.");
      }

    } catch (error) {
      console.error(error);
      setError("Error connecting to Gemini API. Please check your network connection and API Key.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 h-[calc(100vh-10rem)] flex flex-col">
       <div className="flex items-center justify-between mb-2 shrink-0">
          <div className="flex items-center space-x-5">
            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-4 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
              <BrainCircuit size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight font-display">Smart Assistant</h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center">
                  Powered by Gemini 2.5 Flash <Sparkles size={14} className="ml-1.5 text-amber-500 fill-amber-500" />
              </p>
            </div>
          </div>
          <button 
            onClick={() => handleAskGemini('', true)}
            disabled={isLoading}
            className="hidden md:flex items-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
          >
            <FileText size={18} className="mr-2" />
            Generate Health Report
          </button>
       </div>
       
       {error && (
         <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 p-4 rounded-2xl flex items-center text-rose-600 dark:text-rose-400 animate-in fade-in slide-in-from-top-2">
            <AlertTriangle className="mr-3 shrink-0" size={20} />
            <p className="font-bold text-sm">{error}</p>
         </div>
       )}

       <div className="flex-1 glass-panel rounded-3xl shadow-sm border border-white/60 dark:border-gray-800 overflow-hidden flex flex-col transition-all relative">
          {/* Chat/Report Area */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8 custom-scrollbar relative">
             
             {/* Background Decoration */}
             <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none flex items-center justify-center">
                 <Stars size={400} />
             </div>

             {/* Empty State */}
             {!response && !reportData && !isLoading && !prompt && (
                 <div className="flex flex-col items-center justify-center h-full text-center space-y-10 fade-in relative z-10">
                    <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-gray-800 dark:to-gray-900 p-8 rounded-full shadow-inner border border-indigo-50 dark:border-gray-700">
                        <Sparkles size={64} className="text-indigo-500" />
                    </div>
                    <div className="max-w-md">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 font-display">How can I help you today?</h3>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">I've analyzed your latest sales, inventory, and invoice data. Ask me anything or generate a full report.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
                        <button 
                            onClick={() => handleAskGemini('', true)}
                            className="group flex items-center justify-between p-5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl hover:border-indigo-500 hover:shadow-md transition-all text-left"
                        >
                             <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">Generate Business Health Report</span>
                             <FileText size={18} className="text-indigo-400 group-hover:text-indigo-600" />
                        </button>
                        {quickPrompts.map((p, idx) => (
                            <button 
                                key={idx}
                                onClick={() => handleAskGemini(p)}
                                className="group flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 rounded-2xl hover:border-indigo-500 hover:shadow-md transition-all text-left"
                            >
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{p}</span>
                                <ArrowRight size={18} className="text-gray-300 group-hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0" />
                            </button>
                        ))}
                    </div>
                 </div>
             )}

             {/* User Prompt Bubble */}
             {(prompt || (isReportMode && isLoading)) && !reportData && (
                <div className="flex justify-end animate-in fade-in slide-in-from-bottom-4 duration-300 relative z-10">
                    <div className="flex items-end max-w-[80%] flex-row-reverse gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0 border border-gray-200 dark:border-gray-600">
                            <User size={20} className="text-gray-600 dark:text-gray-300" />
                        </div>
                        <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl rounded-tr-sm px-6 py-4 shadow-xl text-base font-medium leading-relaxed">
                            {isReportMode ? "Generating comprehensive business report..." : prompt}
                        </div>
                    </div>
                </div>
             )}

             {/* Loader */}
             {isLoading && (
               <div className="flex justify-start animate-in fade-in slide-in-from-bottom-4 duration-300 relative z-10">
                  <div className="bg-white dark:bg-gray-800 border border-indigo-100 dark:border-gray-700 rounded-2xl rounded-tl-sm p-4 shadow-sm flex items-center space-x-3">
                      <Loader2 className="animate-spin text-indigo-600" size={20} />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Analyzing data...</span>
                  </div>
               </div>
             )}

             {/* Text Response */}
             {response && !isLoading && (
                 <div className="flex justify-start animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
                     <div className="flex items-end max-w-full md:max-w-[85%] gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-lg text-white">
                            <Bot size={20} />
                        </div>
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-sm p-6 shadow-sm text-gray-800 dark:text-gray-200 text-base leading-relaxed whitespace-pre-wrap">
                            {response}
                        </div>
                     </div>
                 </div>
             )}

             {/* Rich Report Response */}
             {reportData && !isLoading && (
                 <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10 space-y-6">
                    {/* Header Score */}
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-600/20 flex-1 relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-32 bg-white opacity-5 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>
                             <h3 className="text-indigo-100 font-bold uppercase tracking-widest text-xs mb-2">Business Health Score</h3>
                             <div className="flex items-end mb-4">
                                <span className="text-6xl font-black tracking-tighter">{reportData.healthScore}</span>
                                <span className="text-2xl font-bold text-indigo-200 mb-2 ml-2">/100</span>
                             </div>
                             <div className="w-full bg-black/20 rounded-full h-2 mb-4 overflow-hidden">
                                <div className="h-full bg-white rounded-full transition-all duration-1000" style={{width: `${reportData.healthScore}%`}}></div>
                             </div>
                             <p className="text-sm font-medium text-indigo-100 leading-relaxed opacity-90">{reportData.summary}</p>
                        </div>
                        
                        <div className="flex-1 bg-white/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-3xl p-8 shadow-sm backdrop-blur-sm">
                             <div className="flex items-center mb-6">
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 mr-3">
                                    <TrendingUp size={20} />
                                </div>
                                <h3 className="font-bold text-gray-900 dark:text-white font-display">Key Trends</h3>
                             </div>
                             <ul className="space-y-4">
                                {reportData.keyTrends.map((trend, i) => (
                                    <li key={i} className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 mr-3 shrink-0"></div>
                                        {trend}
                                    </li>
                                ))}
                             </ul>
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="bg-white/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-3xl p-8 shadow-sm backdrop-blur-sm">
                         <div className="flex items-center mb-6">
                             <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600 mr-3">
                                 <CheckCircle2 size={20} />
                             </div>
                             <h3 className="font-bold text-gray-900 dark:text-white font-display">Actionable Recommendations</h3>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {reportData.recommendations.map((rec, i) => (
                                 <div key={i} className="p-5 rounded-2xl bg-gray-50/50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors">
                                     <div className="flex justify-between items-start mb-2">
                                         <h4 className="font-bold text-gray-900 dark:text-white text-sm">{rec.title}</h4>
                                         <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${
                                             rec.priority === 'High' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                                             rec.priority === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                             'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                         }`}>
                                             {rec.priority}
                                         </span>
                                     </div>
                                     <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{rec.action}</p>
                                 </div>
                             ))}
                         </div>
                    </div>
                 </div>
             )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 shrink-0 z-20">
             <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-2 shadow-lg shadow-gray-200/20 dark:shadow-none focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                 <input 
                    type="text" 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAskGemini()}
                    placeholder="Ask about your business data..."
                    disabled={isLoading}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 font-medium px-4 py-2"
                 />
                 <button 
                    onClick={() => handleAskGemini()}
                    disabled={!prompt.trim() || isLoading}
                    className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-md shadow-indigo-600/20"
                 >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                 </button>
             </div>
          </div>
       </div>
    </div>
  );
};