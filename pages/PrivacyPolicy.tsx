import React from 'react';

const PrivacyPolicy: React.FC<{ navigateTo: (page: string) => void }> = ({ navigateTo }) => {
    return (
        <div className="flex flex-col w-full pb-32 min-h-screen bg-background-light dark:bg-background-dark animate-fade-in">
            <header className="sticky top-0 z-30 bg-white/90 dark:bg-surface-dark/90 backdrop-blur-md border-b border-slate-200 dark:border-gray-800 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <button onClick={() => navigateTo('profile')} className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined font-black">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-black uppercase tracking-widest text-slate-900 dark:text-white">Privacidade</h1>
                    <div className="size-10"></div>
                </div>
            </header>

            <main className="p-6 space-y-6 max-w-3xl mx-auto">
                <div className="bg-white dark:bg-surface-dark rounded-[2rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6 text-slate-600 dark:text-slate-300">

                    <div className="space-y-2">
                        <h2 className="text-sm font-black uppercase text-primary tracking-widest">1. Coleta de Dados</h2>
                        <p className="text-sm leading-relaxed">
                            O SIGEA (Sistema de Gestão de Eventos Acadêmicos) coleta informações essenciais para a gestão de suas atividades acadêmicas e extensão, incluindo:
                        </p>
                        <ul className="list-disc pl-5 text-sm space-y-1 mt-2">
                            <li>Nome completo e E-mail institucional;</li>
                            <li>Dados de vínculo (Aluno, Servidor, Externo);</li>
                            <li>Campus de origem;</li>
                            <li>Registros de participação em eventos e emissão de certificados.</li>
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-sm font-black uppercase text-primary tracking-widest">2. Uso das Informações</h2>
                        <p className="text-sm leading-relaxed">
                            Seus dados são utilizados exclusivamente para:
                        </p>
                        <ul className="list-disc pl-5 text-sm space-y-1 mt-2">
                            <li>Autenticação e controle de acesso;</li>
                            <li>Emissão e validação de certificados oficiais;</li>
                            <li>Comunicação sobre eventos inscritos;</li>
                            <li>Geração de relatórios estatísticos anônimos para a instituição.</li>
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-sm font-black uppercase text-primary tracking-widest">3. Armazenamento e Segurança</h2>
                        <p className="text-sm leading-relaxed">
                            Todas as informações são armazenadas de forma segura em banco de dados com criptografia e controle de acesso rigoroso (RLS). Seus dados não são compartilhados com terceiros para fins comerciais.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-sm font-black uppercase text-primary tracking-widest">4. Seus Direitos</h2>
                        <p className="text-sm leading-relaxed">
                            Você pode solicitar a correção ou exclusão de seus dados pessoais a qualquer momento através dos canais de suporte institucional, salvo dados necessários para manutenção de registros acadêmicos obrigatórios por lei.
                        </p>
                    </div>

                    <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                        <p className="text-[10px] text-center font-bold uppercase text-slate-400">
                            Última atualização: Janeiro de 2026<br />
                            Instituto Federal de Alagoas
                        </p>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default PrivacyPolicy;
