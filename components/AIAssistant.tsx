
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Event } from '../types';

interface AIAssistantProps {
  events: Event[];
}

interface Message {
  role: 'user' | 'bot';
  text: string;
}

const STORAGE_KEY = 'sigea_ai_history';

const SUGGESTIONS = [
  "Quais os próximos eventos?",
  "Como emitir certificado?",
  "Onde vejo meu ticket?",
  "Como criar um evento?"
];

const AIAssistant: React.FC<AIAssistantProps> = ({ events }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [
      { role: 'bot', text: 'Olá! Sou o SIGEA-AI. Estou aqui para ajudar você com informações sobre eventos, certificados e navegação no portal do IFAL. Como posso ser útil hoje?' }
    ];
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const clearHistory = () => {
    if (confirm("Deseja apagar o histórico com a IA?")) {
      const initialMessage: Message[] = [{ role: 'bot', text: 'Histórico limpo. Em que posso ajudar?' }];
      setMessages(initialMessage);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMessage));
    }
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    const userMessage: Message = { role: 'user', text: textToSend };
    setInput('');
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: { 
          systemInstruction: `Você é o SIGEA-AI, assistente virtual de elite do Sistema de Gestão de Eventos Acadêmicos do IFAL (Instituto Federal de Alagoas). 
          CONDIÇÕES:
          1. Use um tom profissional, prestativo e acadêmico.
          2. Liste os eventos disponíveis se perguntarem sobre datas ou o que está acontecendo: ${JSON.stringify(events)}.
          3. Para certificados: Explique que eles ficam na aba "Títulos" após a conclusão do evento.
          4. Para inscrições: Explique que basta clicar no evento e em "Solicitar Inscrição".
          5. Mantenha as respostas concisas (máximo 3 parágrafos). Use emojis institucionais moderadamente.`,
          temperature: 0.7,
        }
      });

      const result = await chat.sendMessage({ message: textToSend });
      const botText = result.text;

      setMessages(prev => [...prev, { role: 'bot', text: botText || 'Desculpe, não consegui processar sua dúvida agora.' }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Estou com uma instabilidade técnica. Verifique sua conexão ou tente novamente mais tarde.' }]);
    } finally { 
      setIsTyping(false); 
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-[calc(env(safe-area-inset-bottom,24px)+96px)] right-6 z-[9000] size-16 rounded-[2rem] bg-primary flex items-center justify-center shadow-[0_12px_40px_rgba(16,185,129,0.5)] active:scale-90 transition-all border-4 border-white dark:border-zinc-950 group"
      >
        <div className="relative flex items-center justify-center">
           <span className="material-symbols-outlined text-white text-[32px] group-hover:rotate-12 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
           <div className="absolute -top-4 -right-4 size-7 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center shadow-lg ring-1 ring-black/5 animate-bounce">
              <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
           </div>
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-md flex items-end justify-center animate-in fade-in duration-300 p-0 sm:p-6">
          <div className="absolute inset-0" onClick={() => setIsOpen(false)}></div>
          <div className="relative w-full max-w-xl h-[90vh] sm:h-[80vh] bg-white dark:bg-zinc-950 rounded-t-[3rem] sm:rounded-[3rem] flex flex-col overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl animate-in slide-in-from-bottom duration-500">
            <header className="px-8 py-6 bg-primary text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                  <span className="material-symbols-outlined text-3xl">robot_2</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-black uppercase tracking-widest text-[11px]">SIGEA-AI ASSISTENTE</span>
                  <div className="flex items-center gap-1.5">
                    <div className="size-1.5 bg-emerald-300 rounded-full animate-pulse"></div>
                    <span className="text-[9px] font-bold text-white/70 uppercase tracking-widest">Sincronizado com IFAL</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={clearHistory} className="size-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"><span className="material-symbols-outlined text-xl">delete_sweep</span></button>
                <button onClick={() => setIsOpen(false)} className="size-10 rounded-xl bg-white/20 flex items-center justify-center active:scale-90 transition-all"><span className="material-symbols-outlined">close</span></button>
              </div>
            </header>
            
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar scroll-smooth bg-slate-50/50 dark:bg-transparent">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4`}>
                  <div className={`max-w-[85%] p-5 rounded-[2rem] text-[13px] font-bold leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white border border-slate-200 dark:border-white/5 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-[2rem] w-fit animate-pulse">
                  <div className="flex gap-1">
                    <div className="size-1.5 bg-primary rounded-full animate-bounce"></div>
                    <div className="size-1.5 bg-primary rounded-full animate-bounce delay-100"></div>
                    <div className="size-1.5 bg-primary rounded-full animate-bounce delay-200"></div>
                  </div>
                  <span className="text-[9px] font-black text-primary uppercase tracking-widest">Analisando dados do IFAL...</span>
                </div>
              )}
            </div>

            <div className="px-6 py-4 flex gap-2 overflow-x-auto no-scrollbar shrink-0 bg-white/50 dark:bg-black/20 backdrop-blur-md">
              {SUGGESTIONS.map((s, i) => (
                <button 
                  key={i} 
                  onClick={() => handleSend(s)}
                  className="shrink-0 px-4 py-2 bg-slate-100 dark:bg-zinc-800 rounded-full text-[10px] font-black text-slate-600 dark:text-zinc-400 uppercase tracking-widest border border-slate-200 dark:border-white/5 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
            
            <footer className="p-6 bg-white dark:bg-zinc-950 border-t border-slate-100 dark:border-white/5 flex gap-3 pb-[calc(env(safe-area-inset-bottom,24px)+24px)] shrink-0">
              <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 h-14 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-2xl px-6 text-slate-900 dark:text-white text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-400"
                placeholder="Como posso ajudar?"
              />
              <button 
                onClick={() => handleSend()} 
                disabled={!input.trim() || isTyping}
                className="size-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20 active:scale-90 transition-all disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-2xl">send</span>
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
