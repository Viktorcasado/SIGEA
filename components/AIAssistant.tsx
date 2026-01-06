import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Event } from '../types';

interface AIAssistantProps {
  events: Event[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ events }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Oi! Sou seu assistente SIGEA. Como posso te ajudar hoje? Posso te sugerir eventos do IFAL!' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      // @ts-ignore
      const apiKey = (window.process?.env?.API_KEY) || (typeof process !== 'undefined' ? process.env.API_KEY : '');

      if (!apiKey) {
        setMessages(prev => [...prev, { role: 'bot', text: 'Minha inteligência artificial ainda não foi configurada (falta API_KEY na Vercel). Mas posso te dizer que temos ' + events.length + ' eventos disponíveis!' }]);
        setIsTyping(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const context = `Você é um assistente útil do SIGEA (Sistema de Gestão de Eventos do IFAL). 
      Os eventos disponíveis atualmente são: ${JSON.stringify(events)}. 
      Responda de forma curta e amigável em português do Brasil. Se o usuário perguntar por eventos, sugira baseado no interesse dele.
      Apenas mencione eventos que estão na lista fornecida.`;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: `${context}\n\nUsuário: ${userMsg}`,
      });

      setMessages(prev => [...prev, { role: 'bot', text: response.text || 'Desculpe, não consegui processar isso.' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Ops! Tive um problema técnico. Verifique se a API_KEY na Vercel está correta.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-6 z-50 size-14 rounded-full bg-primary text-white shadow-2xl flex items-center justify-center hover:scale-105 transition-transform"
      >
        <span className="material-symbols-outlined text-3xl">{isOpen ? 'close' : 'smart_toy'}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-end justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-surface-dark rounded-3xl shadow-2xl flex flex-col h-[70vh] animate-in slide-in-from-bottom duration-300">
            <header className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined">auto_awesome</span>
                </div>
                <div>
                  <h4 className="font-black text-sm">Assistente IA</h4>
                  <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Online</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="size-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl flex gap-1">
                    <div className="size-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="size-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="size-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Pergunte sobre eventos..."
                  className="w-full h-12 pl-4 pr-12 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20"
                />
                <button
                  onClick={handleSend}
                  disabled={isTyping}
                  className="absolute right-2 top-1/2 -translate-y-1/2 size-8 bg-primary text-white rounded-xl flex items-center justify-center disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-lg">send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
