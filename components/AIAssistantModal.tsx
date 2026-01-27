import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import Icon from './Icon';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'model';
  text: string;
  detectedCampus?: string;
  showMapButton?: boolean;
}

const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const IFAL_CAMPUS_LIST = [
    "Arapiraca", "Batalha", "Coruripe", "Maceió", "Maragogi", "Marechal Deodoro", 
    "Murici", "Palmeira dos Índios", "Penedo", "Piranhas", "Rio Largo", 
    "Santana do Ipanema", "São Miguel dos Campos", "Satuba", "Viçosa"
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'model',
        text: 'Olá! Sou a NAYARA, sua assistente do SIGEA. Posso te ajudar a encontrar eventos, localizar campi do IFAL ou tirar dúvidas sobre seus certificados. Como posso ajudar hoje? 🎓'
      }]);
    }
  }, [isOpen, messages.length]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userInput = input.trim();
    const userMessage: Message = { role: 'user', text: userInput };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const mapKeywords = ['onde', 'como chegar', 'localização', 'endereço', 'mapa', 'fica', 'unidade', 'campus'];
    const hasMapIntent = mapKeywords.some(k => userInput.toLowerCase().includes(k));
    let campusFound = IFAL_CAMPUS_LIST.find(c => userInput.toLowerCase().includes(c.toLowerCase()));
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const systemInstruction = `
            Você é a NAYARA, assistente virtual oficial do SIGEA (Sistema Integrado de Gestão de Eventos Acadêmicos) do IFAL.
            - Seja prestativa, profissional e use emojis acadêmicos.
            - Certificados ficam na aba "Certificados".
            - Inscrições ficam na aba "Eventos".
            - Responda de forma concisa e útil em Português Brasileiro.
        `;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{ parts: [{ text: userInput }] }],
            config: { systemInstruction },
        });

        // Correção crítica: extraindo texto conforme diretrizes da API
        const fullText = response.text || "Desculpe, não consegui processar sua pergunta agora.";
        
        setMessages(prev => [...prev, { 
            role: 'model', 
            text: fullText,
            showMapButton: hasMapIntent,
            detectedCampus: campusFound || "Maceió"
        }]);

    } catch (error) {
      console.error("Erro na NAYARA AI:", error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: 'Ops! Tive um problema de conexão com meus servidores. Pode tentar perguntar novamente?',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-0 sm:p-4 animate-fade-in font-sans">
      <div className="bg-[#F2F2F7] dark:bg-[#1C1C1E] w-full sm:max-w-lg h-full sm:h-[85vh] sm:rounded-[32px] shadow-2xl flex flex-col overflow-hidden border-none sm:border sm:border-white/20">
        
        <header className="flex items-center justify-between p-5 bg-white/80 dark:bg-black/60 backdrop-blur-xl border-b border-black/5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-ifal-green rounded-xl flex items-center justify-center shadow-lg">
                <Icon name="sparkles" className="w-6 h-6 text-white" />
            </div>
            <div>
                <h2 className="text-lg font-black text-gray-900 dark:text-white leading-tight uppercase tracking-tighter">NAYARA AI</h2>
                <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-[9px] text-green-500 font-black uppercase tracking-widest">Ativa agora</p>
                </div>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-gray-200/50 dark:bg-gray-700/50 rounded-full flex items-center justify-center text-gray-500 transition-transform active:scale-90">
            <Icon name="close" className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 p-5 space-y-6 overflow-y-auto bg-transparent">
          {messages.map((msg, index) => (
            <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-slide-up`}>
              <div className={`max-w-[85%] px-5 py-3.5 rounded-[22px] shadow-sm ${
                msg.role === 'user' 
                ? 'bg-ifal-green text-white rounded-tr-none' 
                : 'bg-white dark:bg-[#2C2C2E] text-gray-800 dark:text-gray-100 rounded-tl-none border border-black/5'
              }`}>
                <p className="text-[15px] font-medium leading-relaxed">{msg.text}</p>
              </div>
              
              {msg.showMapButton && (
                  <div className="mt-4 w-full max-w-[280px] bg-white dark:bg-[#2C2C2E] rounded-[24px] overflow-hidden border border-black/10 shadow-xl animate-scale-up">
                      <div className="h-28 bg-gray-200 dark:bg-gray-800 relative">
                          <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=500" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-2 left-3 flex items-center space-x-1.5">
                              <Icon name="location" className="w-3 h-3 text-white" />
                              <span className="text-[9px] text-white font-black uppercase tracking-widest">Campus {msg.detectedCampus}</span>
                          </div>
                      </div>
                      <div className="p-4">
                          <button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=IFAL+Campus+${msg.detectedCampus}`, '_blank')} className="w-full bg-ifal-green text-white py-3 rounded-[14px] text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-transform">
                            Ver no Google Maps
                          </button>
                      </div>
                  </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="px-5 py-3.5 rounded-[22px] bg-white dark:bg-[#2C2C2E] rounded-tl-none border border-black/5 shadow-sm">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 bg-ifal-green/40 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-ifal-green/70 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-ifal-green rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white/80 dark:bg-black/40 backdrop-blur-2xl border-t border-black/5">
          <div className="relative flex items-center bg-gray-200/60 dark:bg-gray-800/80 rounded-[24px] px-2 py-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Pergunte sobre eventos ou certificados..."
              disabled={isLoading}
              className="flex-1 bg-transparent text-gray-900 dark:text-white py-2 pl-4 focus:outline-none text-[15px] font-semibold"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="w-11 h-11 bg-ifal-green rounded-full text-white flex items-center justify-center disabled:opacity-30 active:scale-90 transition-all shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" /></svg>
            </button>
          </div>
          <p className="text-[9px] text-gray-400 font-bold uppercase text-center mt-3 tracking-widest opacity-60">IA Experimental • SIGEA Institucional</p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantModal;