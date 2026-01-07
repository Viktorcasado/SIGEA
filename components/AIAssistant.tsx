
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

  const quickSuggestions = [
    "Eventos no Maceió",
    "Sugestão de workshop",
    "Horas de certificado",
    "Como fazer check-in?"
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const eventSummary = events.map(e => ({ 
        title: e.title, 
        campus: e.campus, 
        status: e.status, 
        type: e.type 
      }));

      const systemInstruction = `Você é o assistente virtual do SIGEA (IFAL).
      Use um tom amigável e direto.
      Responda em português.
      Contexto de eventos: ${JSON.stringify(eventSummary)}.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: textToSend,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      const botResponse = response.text || 'Não consegui processar agora, tente novamente.';
      setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Erro de conexão com a IA.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* FAB Estilizado (Conforme imagem) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-24 right-6 z-[8000] size-16 rounded-[2rem] bg-primary text-white shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-105 active:scale-90 transition-all border border-white/20 group overflow-hidden ${isOpen ? 'rotate-90' : ''}`}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {isOpen ? (
          <span className="material-symbols-outlined text-3xl font-black">close</span>
        ) : (
          <div className="relative">
             <span className="material-symbols-outlined text-3xl">smart_toy</span>
             <div className="absolute -top-1 -right-1 size-5 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-primary text-[14px] font-black">auto_awesome</span>
             </div>
          </div>
        )}
      </button>

      {/* Chat Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[10000] bg-zinc-950/20 backdrop-blur-md flex items-end justify-center animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-[3rem] shadow-[0_-20px_60px_rgba(0,0,0,0.3)] flex flex-col h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-500 border-t border-white/10">
            
            {/* Header com indicador de puxar */}
            <header className="px-8 pt-4 pb-6 bg-primary text-white relative">
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6"></div>
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <span className="material-symbols-outlined text-3xl animate-pulse">robot_2</span>
                </div>
                <div>
                  <h4 className="font-black text-lg uppercase tracking-tighter leading-none mb-1">Assistente SIGEA</h4>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-green-300 animate-pulse"></span>
                    <p className="text-[10px] font-black uppercase tracking-widest text-green-100/80">Inteligência Ativa</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="ml-auto size-12 rounded-2xl bg-white/10 flex items-center justify-center active:scale-90 transition-all"
                >
                  <span className="material-symbols-outlined">expand_more</span>
                </button>
              </div>
            </header>

            {/* Mensagens */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-slate-50 dark:bg-zinc-950/20">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2`}>
                  <div className={`max-w-[85%] p-5 text-sm font-bold leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white rounded-3xl rounded-tr-none' 
                      : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-3xl rounded-tl-none border border-zinc-100 dark:border-zinc-700'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[9px] font-black text-zinc-400 uppercase mt-2 px-1 tracking-widest">
                    {msg.role === 'user' ? 'Você' : 'SIGEA Bot'}
                  </span>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex flex-col items-start animate-pulse">
                  <div className="bg-white dark:bg-zinc-800 p-5 rounded-3xl rounded-tl-none border border-zinc-100 dark:border-zinc-700 flex gap-1.5">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Pensando...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Sugestões e Input */}
            <footer className="p-6 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 pb-10 lg:pb-6">
              {!isTyping && messages.length < 4 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
                  {quickSuggestions.map((s, i) => (
                    <button 
                      key={i}
                      onClick={() => handleSend(s)}
                      className="shrink-0 px-5 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-primary hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-tight transition-all border border-zinc-200 dark:border-zinc-700"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Como posso ajudar?" 
                  className="flex-1 h-16 px-6 bg-zinc-50 dark:bg-zinc-950 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-zinc-400 dark:text-white"
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={isTyping || !input.trim()}
                  className="size-16 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 active:scale-90 transition-all disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-2xl font-black">send</span>
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
