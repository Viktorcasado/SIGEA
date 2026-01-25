import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import Icon from '../components/Icon';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../services/supabaseClient';
import { Subscription } from '../types';

interface MySubscriptionsScreenProps {
  onBack: () => void;
}

const MySubscriptionsScreen: React.FC<MySubscriptionsScreenProps> = ({ onBack }) => {
  const { user } = useUser();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('event_registrations')
        .select(`
          id,
          status,
          events (
            title,
            date
          )
        `)
        .eq('user_id', user.id);
      
      if (dbError) throw dbError;

      const mappedSubscriptions = data
        .filter(sub => sub.events) // Ensure the related event exists
        .map((sub: any): Subscription => {
          let formattedDate = 'Data a confirmar';
          try {
             if (sub.events.date) {
                const dateObj = new Date(sub.events.date);
                if (!isNaN(dateObj.getTime())) {
                  formattedDate = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(dateObj);
                }
             }
          } catch(e) {
            console.error("Could not parse subscription date", sub.events.date);
          }
          
          return {
            id: sub.id,
            event_title: sub.events.title,
            event_date: formattedDate,
            // Assuming any existing registration is 'Confirmado'. 
            // A 'Pendente' state would require a different DB schema.
            status: 'Confirmado',
          };
      });

      setSubscriptions(mappedSubscriptions);
    } catch (e: any) {
        console.error('Error fetching subscriptions', e);
        setError("Não foi possível buscar suas inscrições.");
    } finally {
        setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const renderContent = () => {
    if (loading) {
       return (
           <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ifal-green"></div>
            </div>
       );
    }

    if (error) {
        return (
             <div className="text-center py-16 px-4">
                <Icon name="life-buoy" className="w-16 h-16 mx-auto mb-4 text-red-500" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{error}</h3>
                <button onClick={fetchSubscriptions} className="mt-6 bg-ifal-green text-white font-semibold py-2 px-6 rounded-xl">
                    Tentar Novamente
                </button>
            </div>
        );
    }

    if (subscriptions.length === 0) {
        return (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                <Icon name="ticket" className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold">Nenhuma Inscrição</h3>
                <p>Você ainda não se inscreveu em nenhum evento.</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-4">
            {subscriptions.map(sub => (
                <div key={sub.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm dark:shadow-none flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                            <Icon name="ticket" className="w-6 h-6 text-ifal-green" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{sub.event_title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{sub.event_date}</p>
                        </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${sub.status === 'Confirmado' ? 'bg-ifal-green/10 text-ifal-green' : 'bg-yellow-500/10 text-yellow-500'}`}>
                        {sub.status.toUpperCase()}
                    </span>
                </div>
            ))}
        </div>
    );
  }

  return (
    <div>
      <PageHeader title="Minhas Inscrições" onBack={onBack} />
      <main className="p-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default MySubscriptionsScreen;