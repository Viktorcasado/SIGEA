import React from 'react';

const ContactsSupport: React.FC<{ navigateTo: (page: string) => void }> = ({ navigateTo }) => {
    return (
        <div className="flex flex-col w-full pb-32 min-h-screen bg-background-light dark:bg-background-dark animate-fade-in">
            <header className="sticky top-0 z-30 bg-white/90 dark:bg-surface-dark/90 backdrop-blur-md border-b border-slate-200 dark:border-gray-800 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <button onClick={() => navigateTo('home')} className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined font-black">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-black uppercase tracking-widest text-slate-900 dark:text-white">Contatos e Suporte</h1>
                    <div className="size-10"></div>
                </div>
            </header>

            <main className="p-6 space-y-8">
                {/* Seção Geral */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-primary">apartment</span>
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Contatos Gerais Institucionais</h2>
                    </div>

                    <div className="bg-white dark:bg-surface-dark rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
                        <div>
                            <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white mb-2">E-mail Central para Aluno</h3>
                            <p className="text-xs text-slate-500 mb-1">Dúvidas de acesso SIGAA / Institucional</p>
                            <a href="mailto:email@aluno.ifal.edu.br" className="flex items-center gap-2 text-primary font-bold text-sm hover:underline">
                                <span className="material-symbols-outlined text-sm">mail</span>
                                email@aluno.ifal.edu.br
                            </a>
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                            <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white mb-2">Departamento de Seleção e Ingresso (Reitoria)</h3>
                            <p className="text-xs text-slate-500 mb-1">Contato de seleção/ingresso</p>
                            <a href="mailto:dsi.copes@ifal.edu.br" className="flex items-center gap-2 text-primary font-bold text-sm hover:underline">
                                <span className="material-symbols-outlined text-sm">mail</span>
                                dsi.copes@ifal.edu.br
                            </a>
                        </div>
                    </div>
                </section>

                {/* Campus EAD */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-primary">computer</span>
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Campus EAD</h2>
                    </div>

                    <div className="bg-white dark:bg-surface-dark rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                        <a href="tel:+558221266262" className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                            <span className="material-symbols-outlined text-primary">call</span>
                            <div>
                                <p className="text-[10px] font-bold uppercase text-slate-400">Telefone Geral</p>
                                <p className="text-sm font-black text-slate-900 dark:text-white">(82) 2126-6262</p>
                            </div>
                        </a>

                        <div className="space-y-3 pt-2">
                            <ContactItem email="diread@ifal.edu.br" label="Diretoria EAD" />
                            <ContactItem email="ensino.ead@ifal.edu.br" label="Coord. de Ensino" />
                            <ContactItem email="ra.diread@ifal.edu.br" label="Registro Acadêmico" />
                            <ContactItem email="tic.diread@ifal.edu.br" label="TIC/Informática" />
                            <ContactItem email="pedagogico.diread@ifal.edu.br" label="Pedagógico" />
                            <ContactItem email="coordgeral.diread@ifal.edu.br" label="Coord. Geral UAB" />
                        </div>
                    </div>
                </section>

                {/* Campus Maceió */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-primary">location_city</span>
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Campus Maceió</h2>
                    </div>

                    <div className="bg-white dark:bg-surface-dark rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-3">
                        <div className="grid grid-cols-1 gap-3">
                            <ContactItem email="dg.maceio@ifal.edu.br" label="Direção-Geral" />
                            <ContactItem email="gabinete.maceio@ifal.edu.br" label="Gabinete Direção" />
                            <ContactItem email="comunicacao.maceio@ifal.edu.br" label="Comunicação" />
                            <ContactItem email="cgp.campusmaceio@ifal.edu.br" label="Gestão de Pessoas" />
                            <ContactItem email="de.maceio@ifal.edu.br" label="Direção Ensino" />
                            <ContactItem email="coord.licenciaturas.ifal@gmail.com" label="Licenciaturas" />
                        </div>
                    </div>
                </section>

                {/* Outros Campi */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-primary">map</span>
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Outros Campi</h2>
                    </div>

                    <div className="space-y-4">
                        {/* Piranhas */}
                        <div className="bg-white dark:bg-surface-dark rounded-[2rem] p-5 border border-slate-100 dark:border-slate-800">
                            <h3 className="font-black text-slate-900 dark:text-white uppercase mb-3 flex items-center gap-2">
                                <span className="size-2 rounded-full bg-primary"></span>
                                Campus Piranhas
                            </h3>
                            <a href="tel:+558221266430" className="text-xs text-slate-600 dark:text-slate-300 font-bold block mb-2 hover:text-primary">
                                📞 (82) 2126-6430
                            </a>
                            <p className="text-[10px] text-slate-400">Ramais: 6430 (Recepção), 6431 (DG), 6432 (Portaria)</p>
                        </div>

                        {/* Marechal Deodoro */}
                        <div className="bg-white dark:bg-surface-dark rounded-[2rem] p-5 border border-slate-100 dark:border-slate-800">
                            <h3 className="font-black text-slate-900 dark:text-white uppercase mb-3 flex items-center gap-2">
                                <span className="size-2 rounded-full bg-primary"></span>
                                Campus Marechal Deodoro
                            </h3>
                            <a href="tel:+558221266300" className="text-xs text-slate-600 dark:text-slate-300 font-bold block mb-2 hover:text-primary">
                                📞 (82) 2126-6300
                            </a>
                            <p className="text-[10px] text-slate-400">Ramais: 6300 (Secretaria), 6301 (Gabinete), 6307 (Ascom)</p>
                        </div>

                        {/* Satuba */}
                        <div className="bg-white dark:bg-surface-dark rounded-[2rem] p-5 border border-slate-100 dark:border-slate-800">
                            <h3 className="font-black text-slate-900 dark:text-white uppercase mb-3 flex items-center gap-2">
                                <span className="size-2 rounded-full bg-primary"></span>
                                Campus Satuba
                            </h3>
                            <a href="tel:+558221266500" className="text-xs text-slate-600 dark:text-slate-300 font-bold block mb-3 hover:text-primary">
                                📞 (82) 2126-6500
                            </a>
                            <div className="grid grid-cols-1 gap-2">
                                <ContactItem email="gabinete.satuba@ifal.edu.br" label="Direção / Protocolo" small />
                                <ContactItem email="cra.satuba@ifal.edu.br" label="Registro Acadêmico" small />
                            </div>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
};

const ContactItem = ({ email, label, small }: { email: string, label: string, small?: boolean }) => (
    <div className={`flex flex-col ${small ? 'mb-1' : 'mb-2'}`}>
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{label}</span>
        <a href={`mailto:${email}`} className={`${small ? 'text-xs' : 'text-sm'} font-bold text-slate-700 dark:text-slate-200 hover:text-primary transition-colors truncate`}>
            {email}
        </a>
    </div>
);

export default ContactsSupport;
