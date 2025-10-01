import React, { useState, useEffect } from 'react';
import { observarAutenticacao } from '@/firebase/auth';
import { buscarRoleUsuario, UserRole } from '@/firebase/users';
import LoginAribeMotos from '@/components/LoginAribeMotos';
import SistemaAribeMotos from '@/components/SistemaAribeMotos';
import SistemaAribeMotosUsuario from '@/components/SistemaAribeMotosUsuario';
import { Bike } from 'lucide-react';

const ProtectedRoute = () => {
  const [carregando, setCarregando] = useState(true);
  const [autenticado, setAutenticado] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    // Escuta mudanças de login/logout
    const unsubscribe = observarAutenticacao(async (user) => {
      if (user) {
        setAutenticado(true);
        const role = await buscarRoleUsuario(user.uid);
        setUserRole(role);
      } else {
        setAutenticado(false);
        setUserRole(null);
      }
      setCarregando(false);
    });

    return () => unsubscribe(); // limpa listener ao desmontar
  }, []);

  if (carregando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <Bike className="w-16 h-16 text-orange-600 mx-auto mb-4 animate-bounce" />
          <p className="text-orange-800 text-lg font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!autenticado) {
    return <LoginAribeMotos />;
  }

  if (userRole === 0) {
    return <SistemaAribeMotos />;
  }

  return <SistemaAribeMotosUsuario />;
};

export default ProtectedRoute;
