
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
  "Onde ocorrem os eventos?",
  "Quais as datas das palestras?",
  "Como chego no Auditório?",
  "Como baixo meu ticket?"
];

const AIAssistant: React.FC<AIAssistantProps> = ({ events }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [
      { role: 'bot', text: 'Olá! Sou seu guia SIGEA. Posso te informar sobre locais exatos das salas, datas de início e como gerenciar seus certificados no IFAL. O que deseja saber?' }
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
      
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: { 
          systemInstruction: `Você é o SIGEA-AI v3.0, o Concierge Digital do IFAL.
          FOCO PRINCIPAL: LOCALIZAÇÃO E DATAS.
          1. Se perguntarem "onde" ou "quando", consulte detalhadamente estes dados: ${JSON.stringify(events.map(e => ({ title: e.title, data: e.date, horario: e.time, local: e.location, campus: e.campus }))) }.
          2. Explique o caminho: Se o local for "Auditório", diga que fica geralmente no Bloco Central.
          3. Seja visual: Use bullet points para listar datas e horários.
          4. Se perguntarem sobre QR Code ou Ticket: Explique que o botão "Baixar QR Code" agora está disponível no menu "Meu Ticket".
          5. Tom: Executivo, mas acolhedor.`,
          temperature: 0.7,
        }
      });

      const result = await chat.sendMessage({ message: textToSend });
      setMessages(prev => [...prev, { role: 'bot', text: result.text || 'Tive um problema ao consultar o mapa de eventos.' }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Conexão instável com a central de dados.' }]);
    } finally { 
      setIsTyping(false); 
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-[calc(env(safe-area-inset-bottom,24px)+96px)] right-6 z-[9000] size-16 rounded-apple bg-primary flex items-center justify-center shadow-2xl active:scale-90 transition-all border-4 border-white dark:border-zinc-950 group overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <span className="material-symbols-outlined text-white text-[32px] relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>hub</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-xl flex items-end justify-center animate-in fade-in p-0 sm:p-6">
          <div className="absolute inset-0" onClick={() => setIsOpen(false)}></div>
          <div className="relative w-full max-w-xl h-[85vh] sm:h-[75vh] bg-white dark:bg-zinc-950 rounded-t-[3rem] sm:rounded-apple flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10">
            <header className="px-8 py-7 bg-zinc-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-2xl bg-primary flex items-center justify-center"><span className="material-symbols-outlined text-xl">smart_toy</span></div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest">SIGEA Assistant 3.0</h4>
                  <p className="text-[9px] font-bold text-primary uppercase">Especialista em Logística</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="size-10 rounded-xl bg-white/10 flex items-center justify-center"><span className="material-symbols-outlined">close</span></button>
            </header>
            
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-5 rounded-3xl text-[13px] font-bold leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-slate-100 dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 rounded-tl-none border border-slate-200 dark:border-white/5'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin ml-4"></div>}
            </div>

            <div className="px-6 py-4 flex gap-2 overflow-x-auto no-scrollbar bg-slate-50/50 dark:bg-white/5">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => handleSend(s)} className="shrink-0 px-4 py-2 bg-white dark:bg-zinc-800 rounded-full text-[9px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest border border-slate-200 dark:border-white/5 whitespace-nowrap">{s}</button>
              ))}
            </div>
            
            <footer className="p-6 border-t border-slate-100 dark:border-white/5 flex gap-3 pb-10 sm:pb-6">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} className="flex-1 h-14 bg-slate-100 dark:bg-zinc-900 border-none rounded-2xl px-6 text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Pergunte sobre horários ou salas..." />
              <button onClick={() => handleSend()} disabled={!input.trim()} className="size-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl active:scale-95 disabled:opacity-30"><span className="material-symbols-outlined">send</span></button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
