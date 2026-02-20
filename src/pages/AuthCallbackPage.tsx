"use client";

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/src/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Erro no callback de autenticação:", error);
        navigate('/login?erro=oauth');
        return;
      }

      if (session) {
        navigate('/');
      } else {
        // Pequeno delay para garantir que o Supabase processe o hash da URL
        setTimeout(async () => {
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          if (retrySession) {
            navigate('/');
          } else {
            navigate('/login?erro=oauth');
          }
        }, 1500);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto" />
        <h1 className="text-xl font-bold text-gray-900">Finalizando login...</h1>
        <p className="text-gray-500">Aguarde enquanto preparamos seu acesso.</p>
      </div>
    </div>
  );
}