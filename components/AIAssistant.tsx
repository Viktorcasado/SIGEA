
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Event } from '../types';
import { INSTITUTION_CONTACTS } from '../constants';

interface AIAssistantProps {
  events: Event[];
}

interface Message {
  role: 'user' | 'bot';
  text: string;
}

const STORAGE_KEY = 'sigea_ai_history';

const SUGGESTIONS = [
  "Como chegar ao evento?",
  "Onde baixo meu certificado?",
  "Quais eventos estão abertos?",
  "GPS do Campus"
];

const GeminiIfalLogo = ({ className = "size-6", opacity = "opacity-60" }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} ${opacity}`}>
    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#10b981" />
    <path d="M9 16L9.5 17.5L11 18L9.5 18.5L9 20L8.5 18.5L7 18L8.5 17.5L9 16Z" fill="#059669" fillOpacity="0.8" />
  </svg>
);

const AIAssistant: React.FC<AIAssistantProps> = ({ events }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [
      { role: 'bot', text: 'Olá! Sou o assistente Gemini-IFAL. 🎓 Posso te guiar pelos campi, ajudar com rotas de GPS e tirar dúvidas sobre certificados. Como posso ajudar você agora?' }
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
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API_KEY_MISSING");

      const ai = new GoogleGenAI({ apiKey });
      
      const eventContext = events.map(e => ({
        titulo: e.title,
        campus: e.campus,
        data: e.date,
        local_exato: e.location,
        coordenadas: INSTITUTION_CONTACTS[e.campus]?.coords || ""
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: textToSend,
        config: {
          systemInstruction: `Você é o SIGEA-AI v3, assistente oficial do Instituto Federal de Alagoas (IFAL). 🏛️
          
          REGRAS CRÍTICAS DE LOCALIZAÇÃO (IMPORTANTE):
          1. **NUNCA** dê múltiplos links de GPS de campi diferentes na mesma resposta se o usuário perguntar "Como chegar".
          2. Se o usuário perguntar "Como chegar" mas não disser qual evento ou campus, você deve:
             - Listar os nomes dos eventos disponíveis no contexto abaixo.
             - Perguntar educadamente: "Para qual destes eventos você deseja a rota?" ou "Em qual campus será sua atividade?".
          3. Assim que o usuário confirmar o local, forneça apenas UM link do Google Maps no formato: https://www.google.com/maps/search/?api=1&query={coordenadas}.
          4. Se o campus for Maceió, mencione a Praça da Faculdade. Se for Arapiraca, mencione o Shopping AL-115.

          DADOS DOS EVENTOS: ${JSON.stringify(eventContext)}.

          TOM DE VOZ:
          - Seja solícito, institucional e use português claro.
          - Use listas para instruções de certificados (Ex: 1. Vá em Títulos... 2. Baixe o PDF).
          - Termine respostas de localização com uma dica sobre o Voucher Digital.`,
        }
      });

      setMessages(prev => [...prev, { role: 'bot', text: response.text || 'Desculpe, tive um erro técnico. Pode repetir?' }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Estou com dificuldades de conexão no momento. Por favor, verifique sua internet ou tente novamente em instantes.' }]);
    } finally { 
      setIsTyping(false); 
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-[calc(env(safe-area-inset-bottom,24px)+96px)] right-6 z-[90] size-16 rounded-[2.2rem] bg-white dark:bg-zinc-900 shadow-2xl active:scale-90 transition-all border border-slate-200 dark:border-white/5 group"
      >
        <div className="relative">
           <GeminiIfalLogo className="size-9 group-hover:scale-110 transition-transform" opacity="opacity-90" />
           <div className="absolute -top-1 -right-1 size-3 bg-primary rounded-full ring-2 ring-white dark:ring-zinc-900"></div>
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/30 backdrop-blur-sm flex items-end justify-center animate-in fade-in p-0 sm:p-6">
          <div className="absolute inset-0" onClick={() => setIsOpen(false)}></div>
          <div className="relative w-full max-w-xl h-[85vh] sm:h-[75vh] bg-white dark:bg-[#09090b] rounded-t-[3.5rem] sm:rounded-apple flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-20 duration-500 border border-slate-200 dark:border-white/10">
            
            <header className="px-8 py-8 bg-white dark:bg-zinc-900 backdrop-blur-md flex items-center justify-between border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10">
                  <GeminiIfalLogo className="size-7" opacity="opacity-100" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] leading-none text-slate-900 dark:text-white">Gemini <span className="text-primary">IFAL</span></h4>
                  <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase mt-1.5 tracking-widest">IA Institucional</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="size-11 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 active:scale-90 transition-all shadow-sm"><span className="material-symbols-outlined">close</span></button>
            </header>
            
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-slate-50 dark:bg-[#09090b]">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                  <div className={`max-w-[85%] p-5 rounded-[2.2rem] text-[13px] font-bold leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-none shadow-primary/20' 
                    : 'bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 rounded-tl-none border border-slate-200 dark:border-white/5'
                  }`}>
                    {msg.text.split('\n').map((line, idx) => (
                      <p key={idx} className={line.trim() === '' ? 'h-2' : 'mb-1'}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-3 px-6 py-4 bg-primary/5 rounded-full w-fit animate-pulse ml-4 border border-primary/10 shadow-sm">
                  <GeminiIfalLogo className="size-4 animate-spin-slow" />
                  <span className="text-[9px] font-black text-primary uppercase tracking-widest">Processando resposta...</span>
                </div>
              )}
            </div>

            <div className="px-6 py-4 flex gap-3 overflow-x-auto no-scrollbar bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-white/5">
              {SUGGESTIONS.map((s, i) => (
                <button 
                  key={i} 
                  onClick={() => handleSend(s)} 
                  className="shrink-0 px-5 py-2.5 bg-slate-50 dark:bg-zinc-800 rounded-full text-[9px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest border border-slate-200 dark:border-white/5 whitespace-nowrap active:scale-95 transition-all shadow-sm"
                >
                  {s}
                </button>
              ))}
            </div>
            
            <footer className="p-6 border-t border-slate-100 dark:border-white/5 flex gap-3 pb-[calc(env(safe-area-inset-bottom,24px)+24px)] bg-white dark:bg-[#09090b]">
              <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                className="flex-1 h-14 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-2xl px-6 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-400" 
                placeholder="Qual evento ou campus você procura?" 
              />
              <button 
                onClick={() => handleSend()} 
                disabled={!input.trim() || isTyping} 
                className="size-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 active:scale-90 transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined font-black">near_me</span>
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
