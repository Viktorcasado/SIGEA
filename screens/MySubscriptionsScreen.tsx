import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useUser } from '../contexts/UserContext';
import { Registration } from '../types';
import { ClipboardList, CheckCircle2, Clock, XCircle } from 'lucide-react';

const MySubscriptionsScreen: React.FC = () => {
  const { user } = useUser();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRegistrations = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('registrations')
      .select('*, events(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (!error && data) setRegistrations(data as Registration[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchRegistrations();

    // REALTIME: Ouvindo mudanças na tabela registrations
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'registrations', filter: `user_id=eq.${user?.id}` },
        () => {
          console.log('[SIGEA] Mudança detectada em tempo real');
          fetchRegistrations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'canceled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle2 size={14} />;
      case 'pending': return <Clock size={14} />;
      case 'canceled': return <XCircle size={14} />;
      default: return null;
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendente';
      case 'canceled': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-black text-[#1e293b] tracking-tight">Minhas Inscrições</h1>
        <p className="text-gray-500 font-medium">Acompanhe seu status de participação em tempo real</p>
      </header>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse"></div>)}
        </div>
      ) : registrations.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100">
           <ClipboardList size={64} className="mx-auto text-gray-200 mb-4" />
           <p className="text-gray-400 font-bold">Você ainda não se inscreveu em nenhum evento.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {registrations.map((reg) => (
            <div key={reg.id} className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#2e7d32]/10 rounded-xl flex items-center justify-center text-[#2e7d32]">
                  <ClipboardList size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 leading-tight">{reg.events?.title}</h3>
                  <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-wider">
                    Inscrito em: {new Date(reg.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-widest ${getStatusStyle(reg.status)}`}>
                {getStatusIcon(reg.status)}
                <span>{translateStatus(reg.status)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MySubscriptionsScreen;