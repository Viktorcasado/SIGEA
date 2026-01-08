
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Event } from '../types';

interface AIAssistantProps {
  events: Event[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ events }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Olá! Sou o assistente inteligente do SIGEA. Posso te ajudar a encontrar eventos ou tirar dúvidas sobre certificados.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setIsTyping(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: textToSend,
        config: { systemInstruction: "Você é o assistente virtual do SIGEA (IFAL). Use tom amigável e prestativo." }
      });
      setMessages(prev => [...prev, { role: 'bot', text: response.text || '' }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Estou com dificuldades técnicas.' }]);
    } finally { setIsTyping(false); }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-10 right-8 z-[9000] size-16 rounded-full bg-[#10b981] flex items-center justify-center shadow-[0_12px_40px_rgba(16,185,129,0.5)] active:scale-90 transition-all border-4 border-white dark:border-white/20"
      >
        <div className="relative flex items-center justify-center">
           <span className="material-symbols-outlined text-white text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
           <div className="absolute -top-3 -right-3 size-6 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <span className="material-symbols-outlined text-[#10b981] text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
           </div>
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-300">
          <div className="w-full max-w-lg h-[80vh] bg-white dark:bg-[#121214] rounded-t-[3rem] flex flex-col overflow-hidden border-t border-slate-200 dark:border-white/10">
            <header className="p-8 bg-primary text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-4xl">robot_2</span>
                <span className="font-black uppercase tracking-widest text-sm">Sigea Assistant</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="size-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-3xl text-sm font-bold ${msg.role === 'user' ? 'bg-primary text-white shadow-sm' : 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white border border-slate-200 dark:border-white/5'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && <div className="text-[10px] font-black text-primary uppercase tracking-widest animate-pulse px-2">Assistant está pensando...</div>}
            </div>
            <footer className="p-6 bg-slate-50 dark:bg-zinc-900 border-t border-slate-200 dark:border-white/5 flex gap-3">
              <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 h-14 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/5 rounded-2xl px-6 text-slate-900 dark:text-white text-sm font-bold outline-none shadow-sm"
                placeholder="Pergunte algo..."
              />
              <button onClick={() => handleSend()} className="size-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-90 transition-all">
                <span className="material-symbols-outlined">send</span>
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
