import React from 'react';
import PageHeader from '../components/PageHeader';
import Icon from '../components/Icon';

interface SupportScreenProps {
  onBack: () => void;
}

const faqItems = [
    { q: 'Como me inscrevo em um evento?', a: 'Vá para a tela inicial ou de eventos, encontre o evento desejado e clique no botão de inscrição. Siga as instruções para confirmar sua participação.' },
    { q: 'Onde encontro meus certificados?', a: 'Todos os seus certificados de participação estão disponíveis na aba "Certificados", acessível pelo menu inferior.' },
    { q: 'Como validar um certificado?', a: 'Na tela de perfil, clique em "Validar Certificado" para escanear o QR Code ou inserir o código de validação manualmente.' },
    { q: 'Posso cancelar uma inscrição?', a: 'Sim, na tela "Minhas Inscrições", você encontrará a opção de cancelar sua participação em eventos futuros.' },
];

const SupportScreen: React.FC<SupportScreenProps> = ({ onBack }) => {
  return (
    <div className="relative min-h-screen">
      <PageHeader title="Central de Suporte" onBack={onBack} />
      <main className="p-6 pb-24">
        <h2 className="text-sm font-semibold tracking-widest text-gray-500 dark:text-gray-400 mb-4">
            PERGUNTAS FREQUENTES (FAQ)
        </h2>
        <div className="space-y-3">
            {faqItems.map((item, index) => (
                <details key={index} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm dark:shadow-none group">
                    <summary className="font-semibold cursor-pointer flex justify-between items-center">
                        {item.q}
                        <Icon name="chevron-right" className="w-5 h-5 transition-transform duration-300 group-open:rotate-90" />
                    </summary>
                    <p className="mt-3 text-gray-600 dark:text-gray-300 text-sm">
                        {item.a}
                    </p>
                </details>
            ))}
        </div>
      </main>
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-100/80 dark:bg-zinc-900/80 backdrop-blur-sm border-t border-black/5 dark:border-white/5">
        <a href="mailto:suporte.sigea@ifal.edu.br" className="w-full bg-ifal-green text-white font-semibold py-3 rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center space-x-2">
            <span>Falar com a TI / Coordenação</span>
        </a>
      </div>
    </div>
  );
};

export default SupportScreen;