
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
  "Qual o local do próximo evento?",
  "Como chego no Auditório?",
  "Onde baixo meu QR Code?",
  "Quais eventos este mês?"
];

const AIAssistant: React.FC<AIAssistantProps> = ({ events }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [
      { role: 'bot', text: 'Olá! Sou o guia institucional SIGEA. Posso informar locais exatos de salas, horários de palestras e como gerenciar seus certificados no IFAL. O que deseja saber?' }
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

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    const userMessage: Message = { role: 'user', text: textToSend };
    setInput('');
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const eventContext = events.map(e => ({
        titulo: e.title,
        campus: e.campus,
        data: e.date,
        horario: e.time,
        local_especifico: e.location,
        tipo: e.type,
        horas: e.certificateHours
      }));

      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: { 
          systemInstruction: `Você é o SIGEA-AI v3.1, Concierge Digital de Elite do IFAL.
          DIRETRIZES:
          1. RESPOSTAS LOGÍSTICAS: Se perguntarem sobre locais, datas ou horários, use EXCLUSIVAMENTE estes dados: ${JSON.stringify(eventContext)}.
          2. LOCALIZAÇÃO: Seja específico. Se o local for "Auditório", explique que geralmente fica no Bloco Central próximo à entrada.
          3. QR CODE: Informe que o botão "Baixar QR Code" está disponível em "Meu Ticket" (para alunos) ou "QR Check-in" (para organizadores).
          4. TOM: Profissional, conciso, acadêmico e acolhedor. Use bullet points para listas.
          5. NAVEGAÇÃO: Se o usuário estiver perdido, sugira usar a barra lateral para acessar o "Perfil" ou "Programação".`,
          temperature: 0.8,
        }
      });

      const result = await chat.sendMessage({ message: textToSend });
      setMessages(prev => [...prev, { role: 'bot', text: result.text || 'Desculpe, tive um problema ao acessar o banco de dados institucional.' }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Conexão instável com a central de processamento.' }]);
    } finally { 
      setIsTyping(false); 
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-[calc(env(safe-area-inset-bottom,24px)+96px)] right-6 z-[9000] size-16 rounded-[2rem] bg-primary flex items-center justify-center shadow-[0_15px_45px_rgba(16,185,129,0.4)] active:scale-90 transition-all border-4 border-white dark:border-zinc-950 group"
      >
        <div className="relative">
           <span className="material-symbols-outlined text-white text-[32px] group-hover:rotate-12 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>hub</span>
           <div className="absolute -top-1 -right-1 size-3 bg-white rounded-full animate-ping opacity-75"></div>
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-xl flex items-end justify-center animate-in fade-in p-0 sm:p-6">
          <div className="absolute inset-0" onClick={() => setIsOpen(false)}></div>
          <div className="relative w-full max-w-xl h-[85vh] sm:h-[75vh] bg-white dark:bg-[#09090b] rounded-t-[3.5rem] sm:rounded-apple flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-20 duration-500">
            <header className="px-8 py-8 bg-zinc-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg"><span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span></div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest leading-none">SIGEA-AI Concierge</h4>
                  <p className="text-[9px] font-bold text-primary uppercase mt-1">Guia de Logística Acadêmica</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="size-11 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"><span className="material-symbols-outlined">close</span></button>
            </header>
            
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-slate-50/30 dark:bg-transparent">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-5 rounded-[2rem] text-[13px] font-bold leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-tl-none border border-zinc-200 dark:border-white/5'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-2 px-6 py-4 bg-primary/10 rounded-full w-fit animate-pulse ml-4">
                  <div className="flex gap-1">
                    <div className="size-1.5 bg-primary rounded-full animate-bounce"></div>
                    <div className="size-1.5 bg-primary rounded-full animate-bounce delay-150"></div>
                  </div>
                  <span className="text-[9px] font-black text-primary uppercase">Consultando Mapa...</span>
                </div>
              )}
            </div>

            <div className="px-6 py-4 flex gap-3 overflow-x-auto no-scrollbar bg-slate-100/50 dark:bg-white/5 backdrop-blur-md">
              {SUGGESTIONS.map((s, i) => (
                <button 
                  key={i} 
                  onClick={() => handleSend(s)} 
                  className="shrink-0 px-5 py-2.5 bg-white dark:bg-zinc-800 rounded-full text-[9px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest border border-zinc-200 dark:border-white/5 whitespace-nowrap active:scale-95 transition-all shadow-sm"
                >
                  {s}
                </button>
              ))}
            </div>
            
            <footer className="p-6 border-t border-zinc-100 dark:border-white/5 flex gap-3 pb-[calc(env(safe-area-inset-bottom,24px)+24px)] bg-white dark:bg-[#09090b]">
              <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                className="flex-1 h-14 bg-slate-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl px-6 text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-zinc-400" 
                placeholder="Qual sua dúvida logística?" 
              />
              <button 
                onClick={() => handleSend()} 
                disabled={!input.trim() || isTyping} 
                className="size-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20 active:scale-90 transition-all disabled:opacity-30"
              >
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
