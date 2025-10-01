import React, { useState, useEffect } from 'react';
import { verificarAutenticacao } from '@/firebase/auth';
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
    const verificar = async () => {
      try {
        const resultado = await verificarAutenticacao();
        
        // Agora 'resultado' tem a estrutura { user, role }
        if (resultado && resultado.user) {
          setAutenticado(true);
          
          console.log('=== DEBUG AUTENTICAÇÃO ===');
          console.log('UID do usuário:', resultado.user.uid);
          console.log('Email do usuário:', resultado.user.email);
          
          // Buscar a role do usuário no Firestore
          const role = await buscarRoleUsuario(resultado.user.uid);
          setUserRole(role);
          
          console.log('Role retornada:', role);
          console.log('Tipo da role:', typeof role);
          console.log('Role === 0?', role === 0);
          console.log('Role === 1?', role === 1);
          console.log('=========================');
        } else {
          setAutenticado(false);
          setUserRole(null);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setAutenticado(false);
        setUserRole(null);
      } finally {
        setCarregando(false);
      }
    };

    verificar();
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