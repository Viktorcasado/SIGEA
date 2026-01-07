
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Event } from '../types';

interface AIAssistantProps {
  events: Event[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ events }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Olá! Sou o assistente inteligente da plataforma. Como posso ajudar você hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickSuggestions = [
    "Quais eventos estão abertos?",
    "Me sugira um workshop",
    "Como funcionam os certificados?",
    "Eventos no Campus Maceió"
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

      const systemInstruction = `Você é o Assistente Virtual do Sistema de Gestão de Eventos Acadêmicos do IFAL.
      Sua missão é ajudar estudantes e organizadores.
      Dados Atuais dos Eventos: ${JSON.stringify(eventSummary)}.
      
      Diretrizes:
      1. Seja cordial, profissional e use português do Brasil.
      2. Se perguntarem sobre eventos, cite nomes específicos da lista e seus campi.
      3. Explique que certificados são gerados após o check-in e processamento da Pró-Reitoria.
      4. Mantenha respostas concisas e úteis.
      5. Se não souber algo, direcione o usuário para a coordenação do seu campus.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: textToSend,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      const botResponse = response.text || 'Desculpe, tive uma oscilação na conexão. Pode repetir?';
      setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'bot', text: 'Ops! Ocorreu um erro ao processar sua solicitação. Verifique sua conexão.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    if (confirm("Deseja limpar o histórico da conversa?")) {
      setMessages([{ role: 'bot', text: 'Histórico limpo. Como posso ajudar agora?' }]);
    }
  };

  return (
    <>
      {/* Botão Flutuante (FAB) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-6 z-[8000] size-14 rounded-full bg-primary text-white shadow-[0_8px_25px_rgba(16,185,129,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all group overflow-hidden border border-white/20"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 group-hover:translate-x-full transition-transform duration-1000 -translate-x-full"></div>
        <span className="material-symbols-outlined text-3xl z-10">{isOpen ? 'close' : 'smart_toy'}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[10000] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 sm:rounded-[2.5rem] rounded-t-[2.5rem] shadow-2xl flex flex-col h-[85vh] sm:h-[70vh] overflow-hidden border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom duration-500">
            
            {/* Cabeçalho */}
            <header className="relative p-6 bg-gradient-to-r from-primary to-primary-dark text-white shrink-0">
              <div className="absolute top-0 right-0 p-2">
                <button onClick={clearChat} className="size-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors" title="Limpar Chat">
                  <span className="material-symbols-outlined text-sm">delete_sweep</span>
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/20">
                  <span className="material-symbols-outlined text-2xl animate-pulse">auto_awesome</span>
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase tracking-widest leading-none mb-1">Assistente Virtual</h4>
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-green-300 animate-pulse"></span>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-green-100 opacity-80">IA Inteligente • Online</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="absolute top-6 right-6 sm:hidden size-10 rounded-full hover:bg-white/10 flex items-center justify-center"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>

            {/* Área de Mensagens */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar bg-slate-50 dark:bg-zinc-950/30">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[88%] p-4 rounded-[1.5rem] text-sm leading-relaxed shadow-sm transition-all ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white rounded-tr-none' 
                      : 'bg-white dark:bg-zinc-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[8px] font-black text-slate-400 uppercase mt-1.5 px-2 tracking-widest">
                    {msg.role === 'user' ? 'Você' : 'Assistente IA'}
                  </span>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex flex-col items-start animate-in fade-in slide-in-from-left-2 duration-300">
                  <div className="bg-white dark:bg-zinc-800 p-4 rounded-[1.5rem] rounded-tl-none border border-slate-100 dark:border-slate-700 flex gap-1.5">
                    <div className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:0s]"></div>
                    <div className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Sugestões Rápidas e Input */}
            <footer className="p-5 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-slate-800">
              {messages.length < 3 && !isTyping && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-1">
                  {quickSuggestions.map((s, i) => (
                    <button 
                      key={i}
                      onClick={() => handleSend(s)}
                      className="shrink-0 px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-primary hover:text-white rounded-full text-[10px] font-black uppercase tracking-tighter transition-all border border-slate-200 dark:border-slate-700"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              
              <div className="relative flex items-center gap-3">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Pergunte sobre eventos..." 
                  className="flex-1 h-14 pl-6 pr-4 bg-slate-50 dark:bg-zinc-950 border-none rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-400 dark:text-white"
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={isTyping || !input.trim()}
                  className="size-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 disabled:opacity-50 disabled:grayscale active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-2xl">send</span>
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
