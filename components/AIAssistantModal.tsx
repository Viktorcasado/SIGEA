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
  showMapButton?: boolean;
}

const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<GoogleGenAI | null>(null);

  /**
   * PROMPT PARA GERAÇÃO DA IMAGEM DO MAPA:
   * "Aerial satellite view of the Federal Institute of Alagoas (IFAL) campus in Marechal Deodoro, Alagoas, Brazil. 
   * High-tech Google Maps interface overlay, vibrant green courtyards, academic infrastructure, coastal colonial town aesthetics, 4k."
   */
  const MARECHAL_MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=IFAL+Campus+Marechal+Deodoro&query_place_id=ChIJO6BhUiZTAQcR3JoQyZUqNxY';
  const MARECHAL_ADDRESS = 'R. da Matança (Rua Lourival Alfredo), 176 - Poeira, Marechal Deodoro - AL, 57160-000';
  
  // Imagem de satélite premium simulando o Google Maps para Marechal Deodoro
  const MAP_BANNER_IMAGE = 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1000&auto=format&fit=crop';

  useEffect(() => {
    if (!aiRef.current && process.env.API_KEY) {
      aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'model',
        text: 'Olá! Eu sou a NAYARA, sua assistente virtual do SIGEA IFAL. Como posso te ajudar com seus eventos e certificados hoje? 😊'
      }]);
    }
  }, [isOpen, messages.length]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const abrirMapa = () => {
    window.open(MARECHAL_MAPS_URL, '_blank');
  };
  
  const handleSend = async () => {
    if (!input.trim() || isLoading || !aiRef.current) return;
    
    const userInput = input.trim();
    const userMessage: Message = { role: 'user', text: userInput };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const keywords = ['chegar', 'local', 'onde', 'mapa', 'endereço', 'localização', 'rota', 'marechal', 'onde fica'];
    const hasMapIntent = keywords.some(k => userInput.toLowerCase().includes(k));

    try {
        const systemInstruction = `
            Você é a NAYARA, assistente virtual inteligente do SIGEA (IFAL).
            - Seu campus principal de referência é o CAMPUS MARECHAL DEODORO (Poeira).
            - Se o usuário perguntar sobre "como chegar", "local" ou "endereço", responda EXATAMENTE assim: "Entendido! Traçando rota para o Campus Marechal Deodoro (Poeira). Deseja iniciar?"
            - Informe que o endereço é: ${MARECHAL_ADDRESS}.
            - Nunca direcione para Maceió. O destino é Marechal.
            - Tom: Profissional, amigável e prestativa no estilo assistente iOS.
        `;

        const modelMessage: Message = { role: 'model', text: '', showMapButton: hasMapIntent };
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
        text: 'Desculpe, tive um erro de conexão. Mas se você quer chegar ao Campus Marechal Deodoro, clique no botão abaixo para ver o mapa!',
        showMapButton: true
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
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in font-['-apple-system',_BlinkMacSystemFont,_'Segoe_UI',_Roboto,_Helvetica,_Arial,_sans-serif]">
      <div className="bg-[#F2F2F7] dark:bg-[#1C1C1E] w-full max-w-lg h-[85vh] rounded-[24px] shadow-2xl flex flex-col overflow-hidden animate-scale-up border border-white/20">
        <header className="flex items-center justify-between p-4 bg-white/80 dark:bg-black/40 backdrop-blur-xl border-b border-black/5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-ifal-green rounded-full flex items-center justify-center shadow-sm">
                <Icon name="sparkles" className="w-6 h-6 text-white" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white leading-tight">NAYARA</h2>
                <p className="text-[11px] text-ifal-green font-medium uppercase tracking-widest">Campus Marechal Deodoro</p>
            </div>
          </div>
          <button onClick={onClose} className="bg-gray-200/50 dark:bg-gray-700/50 p-1.5 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
            <Icon name="close" className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-transparent">
          {messages.map((msg, index) => (
            <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] px-4 py-3 rounded-[18px] shadow-sm ${
                msg.role === 'user' 
                ? 'bg-ifal-green text-white rounded-tr-none' 
                : 'bg-white dark:bg-[#2C2C2E] text-gray-800 dark:text-gray-100 rounded-tl-none border border-black/5'
              }`}>
                <p className="text-[15px] font-medium leading-snug" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
              </div>
              
              {msg.showMapButton && (
                  <div className="mt-3 w-full max-w-[300px] bg-white dark:bg-[#2C2C2E] rounded-[24px] overflow-hidden border border-black/10 shadow-xl animate-scale-up">
                      <div className="h-32 bg-gray-200 dark:bg-gray-800 relative group cursor-pointer" onClick={abrirMapa}>
                          <img 
                            src={MAP_BANNER_IMAGE} 
                            alt="Mapa" 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={(e) => (e.currentTarget.src = 'https://i.postimg.cc/d1wz2p28/sigea-logo-green.png')}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          <div className="absolute bottom-3 left-3 flex items-center space-x-2">
                              <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                                <Icon name="location" className="w-4 h-4 text-white fill-white" />
                              </div>
                              <span className="text-[10px] text-white font-bold uppercase tracking-wider">Visualização Marechal</span>
                          </div>
                      </div>
                      <div className="p-4 bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-md">
                          <p className="text-[11px] font-extrabold text-ifal-green uppercase mb-1">Localização de Destino</p>
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-4 leading-tight">
                            {MARECHAL_ADDRESS}
                          </p>
                          <button 
                            onClick={() => abrirMapa()}
                            className="w-full flex items-center justify-center space-x-2 bg-ifal-green text-white py-3.5 rounded-[16px] text-[15px] font-bold shadow-lg active:scale-95 transition-all"
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
              <div className="px-4 py-3 rounded-[18px] bg-white dark:bg-[#2C2C2E] rounded-tl-none shadow-sm">
                <div className="flex items-center space-x-1">
                  <span className="h-1.5 w-1.5 bg-ifal-green rounded-full animate-bounce"></span>
                  <span className="h-1.5 w-1.5 bg-ifal-green rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="h-1.5 w-1.5 bg-ifal-green rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white/50 dark:bg-black/20 backdrop-blur-xl border-t border-black/5">
          <div className="relative flex items-center bg-gray-200/50 dark:bg-gray-800/50 rounded-[20px] px-2 py-1.5 shadow-inner">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Fale com a NAYARA..."
              disabled={isLoading}
              className="flex-1 bg-transparent text-gray-800 dark:text-white py-2 pl-3 focus:outline-none text-[15px] font-medium"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="w-9 h-9 bg-ifal-green rounded-full text-white flex items-center justify-center disabled:opacity-30 shadow-md active:scale-90 transition-transform"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" /></svg>
            </button>
          </div>
          <p className="text-[10px] text-center text-gray-400 mt-2 font-bold tracking-tight uppercase">Sigea Intelligent Assistant • Marechal Deodoro</p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantModal;