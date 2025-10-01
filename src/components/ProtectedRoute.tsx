// @/components/ProtectedRoute.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { verificarAutenticacao } from '@/firebase/auth';
import LoginAribeMotos from '@/app/LoginAribeMotos';
import SistemaAribeMotos from '@/app/SistemaAribeMotos';
import { Bike } from 'lucide-react';

const ProtectedRoute: React.FC = () => {
  const [usuarioAutenticado, setUsuarioAutenticado] = useState<boolean>(false);
  const [verificando, setVerificando] = useState<boolean>(true);

  useEffect(() => {
    verificarAuth();
  }, []);

  const verificarAuth = async () => {
    const user = await verificarAutenticacao();
    setUsuarioAutenticado(!!user);
    setVerificando(false);
  };

  const handleLoginSuccess = () => {
    setUsuarioAutenticado(true);
  };

  // Tela de carregamento
  if (verificando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-4">
            <Bike className="text-red-600 animate-pulse" size={40} />
          </div>
          <p className="text-white text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, mostrar tela de login
  if (!usuarioAutenticado) {
    return <LoginAribeMotos onLoginSuccess={handleLoginSuccess} />;
  }

  // Se estiver autenticado, mostrar o sistema principal
  return <SistemaAribeMotos />;
};

export default ProtectedRoute;