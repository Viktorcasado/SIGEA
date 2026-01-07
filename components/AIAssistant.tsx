
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
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      Use um tom amigável, prestativo e direto.
      Responda em português brasileiro.
      Contexto dos eventos atuais: ${JSON.stringify(eventSummary)}.
      Se o usuário perguntar sobre check-in, explique que ele deve usar o scanner de QR Code no menu inferior.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: textToSend,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      const botResponse = response.text || 'Desculpe, tive um problema ao processar sua solicitação. Pode repetir?';
      setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Estou com dificuldades técnicas para me conectar agora. Verifique sua rede.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* FAB Mobile (Conforme Imagem - Estilo Liquid Glass) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-28 right-6 z-[8000] size-16 rounded-[2.2rem] flex items-center justify-center hover:scale-105 active:scale-90 transition-all group overflow-hidden ${
          isOpen ? 'bg-zinc-900 text-white rotate-90' : 'bg-primary text-white shadow-[0_12px_40px_rgba(16,185,129,0.4)] ring-4 ring-white/20'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-black/10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
        {isOpen ? (
          <span className="material-symbols-outlined text-3xl font-black relative z-10">close</span>
        ) : (
          <div className="relative z-10">
             <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
             <div className="absolute -top-1 -right-1 size-6 bg-white rounded-xl flex items-center justify-center shadow-lg ring-1 ring-black/5 animate-bounce">
                <span className="material-symbols-outlined text-primary text-[16px] font-black" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
             </div>
          </div>
        )}
      </button>

      {/* Interface de Chat (Bottom Sheet no Mobile) */}
      {isOpen && (
        <div className="fixed inset-0 z-[10000] bg-zinc-950/40 backdrop-blur-md flex items-end justify-center animate-in fade-in duration-300">
          <div 
            className={`w-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-3xl shadow-[0_-20px_60px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-500 border-t border-white/20 dark:border-white/5 
              ${isDesktop ? 'max-w-md h-[70vh] rounded-[3rem] mb-24' : 'max-w-lg h-[85vh] rounded-t-[3.5rem]'}`}
          >
            
            {/* Header com estilo Liquid App-Native */}
            <header className="px-8 pt-4 pb-8 bg-gradient-to-b from-primary to-secondary text-white relative shrink-0">
              <div className="w-14 h-1.5 bg-white/30 rounded-full mx-auto mb-6"></div>
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-[1.8rem] bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30 shadow-inner">
                  <span className="material-symbols-outlined text-4xl animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>robot_2</span>
                </div>
                <div>
                  <h4 className="font-black text-xl uppercase tracking-tighter leading-none mb-1">IA Assistente</h4>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_#4ade80]"></span>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/80">Gemini 3 Flash Ativo</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="ml-auto size-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center active:scale-90 transition-all border border-white/10"
                >
                  <span className="material-symbols-outlined text-2xl font-black">keyboard_arrow_down</span>
                </button>
              </div>
            </header>

            {/* Container de Mensagens */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-slate-50/30 dark:bg-black/20">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2`}>
                  <div className={`max-w-[85%] p-5 text-sm font-bold leading-relaxed shadow-xl backdrop-blur-md ${
                    msg.role === 'user' 
                      ? 'bg-primary/90 text-white rounded-[2.2rem] rounded-tr-none border border-white/20' 
                      : 'bg-white/80 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-100 rounded-[2.2rem] rounded-tl-none border border-white/20 dark:border-white/5'
                  }`}>
                    {msg.text}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 px-1">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                      {msg.role === 'user' ? 'Participante' : 'SIGEA BOT'}
                    </span>
                    {msg.role === 'bot' && <span className="material-symbols-outlined text-[10px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex flex-col items-start">
                  <div className="bg-white/80 dark:bg-zinc-800/80 p-5 rounded-[2.2rem] rounded-tl-none border border-white/20 dark:border-white/5 flex gap-2">
                    <div className="size-2 bg-primary/40 rounded-full animate-bounce"></div>
                    <div className="size-2 bg-primary/60 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="size-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Rodapé: Sugestões e Input Liquid */}
            <footer className="p-6 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-2xl border-t border-white/10 pb-[calc(1.5rem+var(--safe-bottom))]">
              {!isTyping && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 px-1">
                  {quickSuggestions.map((s, i) => (
                    <button 
                      key={i}
                      onClick={() => handleSend(s)}
                      className="shrink-0 px-5 py-3 bg-white/80 dark:bg-zinc-800/80 hover:bg-primary hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-tight transition-all border border-zinc-200 dark:border-zinc-700 shadow-sm"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <div className="flex-1 relative group">
                   <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Sua dúvida acadêmica..." 
                    className="w-full h-16 px-6 bg-white/80 dark:bg-black/30 border border-zinc-200 dark:border-white/10 rounded-[2rem] text-sm font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-zinc-400 dark:text-white shadow-inner"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                     <span className="material-symbols-outlined text-zinc-300 dark:text-zinc-600">mic</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleSend()}
                  disabled={isTyping || !input.trim()}
                  className="size-16 bg-primary text-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-primary/30 active:scale-90 transition-all disabled:opacity-50 shrink-0 border border-white/20"
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
