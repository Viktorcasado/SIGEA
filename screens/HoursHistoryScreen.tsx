import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import Icon from '../components/Icon';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../services/supabaseClient';
import { HoursRecord } from '../types';

interface HoursHistoryScreenProps {
  onBack: () => void;
}

const HoursHistoryScreen: React.FC<HoursHistoryScreenProps> = ({ onBack }) => {
  const { user } = useUser();
  const [history, setHistory] = useState<HoursRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('hours_history')
        .select('id, event_name, hours, category')
        .eq('user_id', user.id)
        .order('date_confirmed', { ascending: false });
      
      if (error) {
        console.error('Error fetching hours history', error);
      } else {
        setHistory(data as HoursRecord[]);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [user]);

  return (
    <div>
      <PageHeader title="Histórico de Horas" onBack={onBack} />
      <main className="p-6">
        {loading ? (
             <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ifal-green"></div>
            </div>
        ) : history.length === 0 ? (
             <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                <Icon name="bar-chart" className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold">Nenhuma hora registrada ainda.</h3>
                <p>Quando você participar de eventos, eles aparecerão aqui.</p>
            </div>
        ) : (
          <div className="space-y-4">
              {history.map(item => (
                  <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl flex justify-between items-center shadow-sm dark:shadow-none">
                      <div>
                          <p className="text-gray-900 dark:text-gray-100 font-semibold">{item.event_name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{item.category}</p>
                      </div>
                      <div className="flex items-center space-x-2 text-ifal-green font-semibold text-lg">
                          <Icon name="clock" className="w-5 h-5" />
                          <span>{item.hours}h</span>
                      </div>
                  </div>
              ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default HoursHistoryScreen;