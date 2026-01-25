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
  const aiRef = useRef<GoogleGenAI | null>(null);

  const IFAL_CAMPUS_LIST = [
    "Arapiraca", "Batalha", "Coruripe", "Maceió", "Maragogi", "Marechal Deodoro", 
    "Murici", "Palmeira dos Índios", "Penedo", "Piranhas", "Rio Largo", 
    "Santana do Ipanema", "São Miguel dos Campos", "Satuba", "Viçosa"
  ];

  useEffect(() => {
    // Inicialização segura da API Gemini
    if (!aiRef.current && process.env.API_KEY) {
      aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
  }, []);

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
    if (!input.trim() || isLoading || !aiRef.current) return;
    
    const userInput = input.trim();
    const userMessage: Message = { role: 'user', text: userInput };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Detecção de intenção de mapa/localização de forma dinâmica
    const mapKeywords = ['onde', 'como chegar', 'localização', 'endereço', 'mapa', 'fica', 'unidade', 'campus'];
    const hasMapIntent = mapKeywords.some(k => userInput.toLowerCase().includes(k));
    
    // Tenta identificar qual campus o usuário está falando
    let campusFound = IFAL_CAMPUS_LIST.find(c => userInput.toLowerCase().includes(c.toLowerCase()));
    
    try {
        const systemInstruction = `
            Você é a NAYARA, assistente virtual oficial do SIGEA (Sistema Integrado de Gestão de Eventos Acadêmicos) do IFAL (Instituto Federal de Alagoas).
            - Atenda alunos, servidores e comunidade externa de TODOS os campi: ${IFAL_CAMPUS_LIST.join(', ')}.
            - Seja prestativa, profissional e use um tom levemente institucional mas moderno.
            - Se perguntarem sobre certificados: explique que ficam na aba "Certificados".
            - Se perguntarem sobre inscrições: explique que estão em "Eventos" ou "Minhas Inscrições".
            - Se o usuário quiser saber o local de um campus específico, confirme o campus e responda de forma que incentive o uso do link de mapa que será gerado.
            - Responda em Português Brasileiro (pt-BR).
        `;

        const modelMessage: Message = { 
            role: 'model', 
            text: '', 
            showMapButton: hasMapIntent,
            detectedCampus: campusFound || "Maceió" // Fallback para Maceió se não detectar mas houver intenção de mapa
        };
        
        setMessages(prev => [...prev, modelMessage]);

        const stream = await aiRef.current.models.generateContentStream({
            model: 'gemini-3-flash-preview',
            contents: [{ role: 'user', parts: [{ text: userInput }] }],
            config: { systemInstruction },
        });

        let fullText = "";
        for await (const chunk of stream) {
            const c = chunk as GenerateContentResponse;
            const chunkText = c.text;
            if (chunkText) {
                fullText += chunkText;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { 
                        ...newMessages[newMessages.length - 1], 
                        text: fullText 
                    };
                    return newMessages;
                });
            }
        }

    } catch (error) {
      console.error("Erro na API Gemini:", error);
      const fallbackMessage: Message = { 
        role: 'model', 
        text: 'Desculpe, tive uma instabilidade na conexão. Posso te ajudar com alguma informação sobre localização ou certificados do IFAL?',
      };
      
      setMessages(prev => {
        const newMessages = [...prev];
        if (newMessages[newMessages.length - 1].role === 'model' && newMessages[newMessages.length - 1].text === '') {
            newMessages[newMessages.length - 1] = fallbackMessage;
        } else {
            newMessages.push(fallbackMessage);
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMapLink = (campus?: string) => {
    return `https://www.google.com/maps/search/?api=1&query=IFAL+Campus+${encodeURIComponent(campus || 'Alagoas')}`;
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="bg-[#F2F2F7] dark:bg-[#1C1C1E] w-full max-w-lg h-[85vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-scale-up border border-white/20">
        
        <header className="flex items-center justify-between p-5 bg-white/80 dark:bg-black/60 backdrop-blur-xl border-b border-black/5">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-ifal-green rounded-2xl flex items-center justify-center shadow-lg shadow-ifal-green/20">
                <Icon name="sparkles" className="w-7 h-7 text-white" />
            </div>
            <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white leading-tight">NAYARA</h2>
                <p className="text-[10px] text-ifal-green font-black uppercase tracking-widest">Inteligência Institucional</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-gray-200/50 dark:bg-gray-700/50 rounded-full flex items-center justify-center text-gray-500 active:scale-90 transition-transform">
            <Icon name="close" className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 p-6 space-y-6 overflow-y-auto scrollbar-hide">
          {messages.map((msg, index) => (
            <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[88%] px-5 py-4 rounded-[24px] shadow-sm ${
                msg.role === 'user' 
                ? 'bg-ifal-green text-white rounded-tr-none' 
                : 'bg-white dark:bg-[#2C2C2E] text-gray-800 dark:text-gray-100 rounded-tl-none border border-black/5'
              }`}>
                <p className="text-[15px] font-bold leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
              </div>
              
              {msg.showMapButton && (
                  <div className="mt-4 w-full max-w-[300px] bg-white dark:bg-[#2C2C2E] rounded-[28px] overflow-hidden border border-black/10 shadow-xl animate-scale-up">
                      <div className="h-32 bg-gray-200 dark:bg-gray-800 relative">
                          <img 
                            src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1000&auto=format&fit=crop" 
                            alt="Mapa" 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-3 left-4 flex items-center space-x-2">
                              <Icon name="location" className="w-4 h-4 text-white" />
                              <span className="text-[10px] text-white font-black uppercase tracking-widest">Campus {msg.detectedCampus}</span>
                          </div>
                      </div>
                      <div className="p-5">
                          <button 
                            onClick={() => window.open(getMapLink(msg.detectedCampus), '_blank')}
                            className="w-full bg-ifal-green text-white py-4 rounded-[18px] text-sm font-black uppercase tracking-widest shadow-lg shadow-ifal-green/30 active:scale-95 transition-all flex items-center justify-center space-x-2"
                          >
                            <Icon name="map_fill" className="w-5 h-5" />
                            <span>Abrir Navegação</span>
                          </button>
                      </div>
                  </div>
              )}
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.text === '' && (
            <div className="flex justify-start">
              <div className="px-6 py-4 rounded-[24px] bg-white dark:bg-[#2C2C2E] rounded-tl-none border border-black/5">
                <div className="flex items-center space-x-1.5">
                  <span className="h-2 w-2 bg-ifal-green rounded-full animate-bounce"></span>
                  <span className="h-2 w-2 bg-ifal-green rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="h-2 w-2 bg-ifal-green rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-5 bg-white/50 dark:bg-black/20 backdrop-blur-xl border-t border-black/5">
          <div className="relative flex items-center bg-gray-200/50 dark:bg-gray-800/60 rounded-[22px] px-3 py-2 shadow-inner">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Pergunte qualquer coisa..."
              disabled={isLoading}
              className="flex-1 bg-transparent text-gray-800 dark:text-white py-2 pl-3 focus:outline-none text-[15px] font-bold placeholder-gray-500"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="w-10 h-10 bg-ifal-green rounded-full text-white flex items-center justify-center disabled:opacity-30 shadow-md active:scale-90 transition-transform"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" /></svg>
            </button>
          </div>
          <p className="text-[9px] text-center text-gray-400 dark:text-gray-500 mt-3 font-black tracking-[0.2em] uppercase">SIGEA Artificial Intelligence • IFAL Multicampi</p>
        </div>
      </div>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        .animate-scale-up { animation: scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default AIAssistantModal;