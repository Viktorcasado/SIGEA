
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

const AIAssistant: React.FC<AIAssistantProps> = ({ events }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [
      { role: 'bot', text: 'Olá! Sou o assistente inteligente do SIGEA. Posso te ajudar a encontrar eventos ou tirar dúvidas sobre certificados.' }
    ];
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  // Salva no LocalStorage sempre que as mensagens mudarem
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const clearHistory = () => {
    if (confirm("Deseja apagar todo o histórico de conversas com a IA?")) {
      const initialMessage: Message[] = [{ role: 'bot', text: 'Histórico limpo. Como posso ajudar agora?' }];
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
      
      // Criamos um chat com o histórico atual para dar contexto à IA
      // Mapeamos o histórico para o formato que o Gemini espera (user/model)
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model' as any,
        parts: [{ text: m.text }]
      }));

      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: { 
          systemInstruction: `Você é o SIGEA-AI, assistente oficial do Sistema de Gestão de Eventos Acadêmicos do IFAL. 
          Seu objetivo é ajudar alunos e organizadores. 
          Aqui está a lista de eventos atuais no sistema para sua referência: ${JSON.stringify(events)}.
          Responda de forma curta, profissional e amigável.`,
          temperature: 0.7,
        },
        // Omitimos o último 'bot' message se for a inicial para evitar conflitos de turno se necessário,
        // mas o formatador acima já cuida da estrutura básica.
      });

      const result = await chat.sendMessage({ message: textToSend });
      const botText = result.text;

      setMessages(prev => [...prev, { role: 'bot', text: botText || 'Não consegui processar sua solicitação.' }]);
    } catch (e: any) {
      console.error("Erro na Sigea-AI:", e);
      setMessages(prev => [...prev, { role: 'bot', text: 'Desculpe, estou com dificuldades técnicas para acessar meus servidores agora. Verifique sua conexão ou tente novamente em instantes.' }]);
    } finally { 
      setIsTyping(false); 
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-[calc(env(safe-area-inset-bottom,24px)+96px)] right-6 z-[9000] size-14 rounded-full bg-primary flex items-center justify-center shadow-[0_8px_32px_rgba(16,185,129,0.4)] active:scale-90 transition-all border-4 border-white dark:border-zinc-900 group"
      >
        <div className="relative flex items-center justify-center">
           <span className="material-symbols-outlined text-white text-[28px] group-hover:rotate-12 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
           <div className="absolute -top-3 -right-3 size-6 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-lg ring-1 ring-black/5">
              <span className="material-symbols-outlined text-primary text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
           </div>
        </div>
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl -z-10 animate-pulse"></div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setIsOpen(false)}></div>
          <div className="relative w-full max-w-lg h-[85vh] bg-white dark:bg-[#09090b] rounded-t-[3rem] flex flex-col overflow-hidden border-t border-slate-200 dark:border-white/10 shadow-2xl animate-in slide-in-from-bottom duration-500">
            <header className="p-8 bg-primary text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl">robot_2</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-black uppercase tracking-widest text-xs">Sigea AI</span>
                  <span className="text-[10px] opacity-70 font-bold uppercase tracking-widest">Memória Ativada</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={clearHistory}
                  className="size-11 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center active:scale-90 transition-all"
                  title="Limpar Histórico"
                >
                  <span className="material-symbols-outlined text-xl">delete_sweep</span>
                </button>
                <button onClick={() => setIsOpen(false)} className="size-11 rounded-2xl bg-white/20 flex items-center justify-center active:scale-90 transition-all">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </header>
            
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar scroll-smooth">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`max-w-[85%] p-5 rounded-[2rem] text-[13px] font-bold leading-relaxed ${
                    msg.role === 'user' 
                    ? 'bg-primary text-white shadow-xl shadow-primary/10 rounded-tr-none' 
                    : 'bg-slate-100 dark:bg-zinc-900 text-slate-900 dark:text-white border border-slate-200 dark:border-white/5 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-2 p-4 text-[10px] font-black text-primary uppercase tracking-[0.2em] animate-pulse">
                  <span className="material-symbols-outlined text-sm">settings_slow_motion</span>
                  Sigea está analisando...
                </div>
              )}
            </div>
            
            <footer className="p-6 bg-slate-50 dark:bg-zinc-900/50 border-t border-slate-200 dark:border-white/5 flex gap-3 pb-[calc(env(safe-area-inset-bottom,24px)+24px)]">
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="w-full h-16 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/5 rounded-2xl px-6 text-slate-900 dark:text-white text-sm font-bold outline-none shadow-sm focus:ring-4 focus:ring-primary/10 transition-all"
                  placeholder="Dúvidas sobre o evento?"
                />
              </div>
              <button 
                onClick={() => handleSend()} 
                disabled={!input.trim() || isTyping}
                className="size-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20 active:scale-90 transition-all disabled:opacity-30"
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
