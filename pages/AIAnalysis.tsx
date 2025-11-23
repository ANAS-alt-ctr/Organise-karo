import React, { useState } from 'react';
import { useAppStore } from '../context/AppContext';
import { BrainCircuit, Send, Loader2, Sparkles } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

export const AIAnalysis: React.FC = () => {
  const { state } = useAppStore();
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const apiKey = process.env.API_KEY || ''; 

  const handleAskGemini = async () => {
    if (!prompt.trim()) return;
    if (!apiKey) {
      setResponse("API Key is missing. Please configure process.env.API_KEY.");
      return;
    }

    setIsLoading(true);
    setResponse('');

    try {
      // Prepare context from app state
      const contextData = {
        totalSales: state.invoices.reduce((sum, i) => sum + i.grandTotal, 0),
        lowStockItems: state.inventory.filter(i => i.stock < 10).map(i => i.name),
        topProducts: state.inventory.slice(0, 5).map(i => i.name),
        recentInvoices: state.invoices.slice(0, 5).map(i => ({ date: i.date, total: i.grandTotal }))
      };

      const systemInstruction = `
        You are an intelligent business advisor for a small business ERP called 'Organise karo'.
        You have access to the following business snapshot in JSON format:
        ${JSON.stringify(contextData)}
        
        Answer the user's question based on this data. Keep answers concise, professional, and actionable.
        If the user asks for a draft email or letter, format it nicely.
      `;

      const ai = new GoogleGenAI({ apiKey });
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
        }
      });

      setResponse(result.text || "No response generated.");

    } catch (error) {
      console.error(error);
      setResponse("Error connecting to Gemini API. Please check your connection and API Key.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 h-[calc(100vh-10rem)] flex flex-col">
       <div className="flex items-center space-x-4 mb-2 shrink-0">
          <div className="bg-gradient-to-br from-violet-600 to-indigo-600 p-4 rounded-2xl text-white shadow-lg">
            <BrainCircuit size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Smart Business Assistant</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center">
                Powered by Gemini 2.5 Flash <Sparkles size={14} className="ml-1 text-amber-500" />
            </p>
          </div>
       </div>

       <div className="flex-1 bg-white dark:bg-gray-900 rounded-3xl shadow-premium border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col transition-all">
          {/* Chat Area */}
          <div className="flex-1 p-8 overflow-y-auto bg-gray-50/50 dark:bg-gray-900/50 space-y-6 custom-scrollbar">
             {/* Introduction Bubble */}
             <div className="flex justify-start">
               <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-none p-6 max-w-[85%] shadow-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                 <p className="font-semibold text-lg mb-3 bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Hello!</p>
                 <p className="mb-3">I've analyzed your sales, inventory, and invoices. I can help you with insights like:</p>
                 <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                   <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2"></span>"Which products need restocking?"</li>
                   <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2"></span>"Draft a payment reminder for my customers."</li>
                   <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2"></span>"Analyze my sales trend for this week."</li>
                 </ul>
               </div>
             </div>

             {/* User Prompt (if any) */}
             {prompt && isLoading && (
                <div className="flex justify-end">
                    <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-none p-4 max-w-[80%] shadow-md">
                        {prompt}
                    </div>
                </div>
             )}

             {/* Loader */}
             {isLoading && (
               <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center space-x-3">
                    <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={20} />
                    <span className="text-gray-500 dark:text-gray-300 font-medium">Analyzing data...</span>
                  </div>
               </div>
             )}

             {/* Response Bubble */}
             {response && !isLoading && (
               <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                 <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-none p-6 max-w-[90%] text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-7 shadow-sm">
                   {response}
                 </div>
               </div>
             )}
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
            <div className="relative flex items-center">
              <input 
                type="text" 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskGemini()}
                placeholder="Ask about your business..."
                className="w-full border-none bg-gray-100 dark:bg-gray-800 rounded-2xl pl-6 pr-16 py-4 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all font-medium text-lg"
              />
              <button 
                onClick={handleAskGemini}
                disabled={isLoading || !prompt}
                className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl px-4 disabled:opacity-50 transition-all shadow-md hover:shadow-lg disabled:shadow-none flex items-center justify-center"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
       </div>
    </div>
  );
};