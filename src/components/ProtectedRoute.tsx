import React, { useState, useEffect } from 'react';
import { verificarAutenticacao } from '@/firebase/auth';
import { buscarRoleUsuario, UserRole } from '@/firebase/users';
import LoginAribeMotos from '@/app/LoginAribeMotos';
import SistemaAribeMotos from '@/app/SistemaAribeMotos';
import SistemaAribeMotosUsuario from '@/app/SIstemaAribeMotosUsuario';
import { Bike } from 'lucide-react';

const ProtectedRoute = () => {
  const [carregando, setCarregando] = useState(true);
  const [autenticado, setAutenticado] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const verificar = async () => {
      try {
        const usuario = await verificarAutenticacao();
        
        if (usuario) {
  setAutenticado(true);
  
  console.log('=== DEBUG AUTENTICAÇÃO ===');
  console.log('UID do usuário:', usuario.uid);
  console.log('Email do usuário:', usuario.email);
  
  // Buscar a role do usuário no Firestore
  const role = await buscarRoleUsuario(usuario.uid);
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

  // Tela de carregamento
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

  // Se não estiver autenticado, mostrar tela de login
  if (!autenticado) {
    return <LoginAribeMotos />;
  }

  // Se for admin (role = 0), mostrar tela de admin
  if (userRole === 0) {
    return <SistemaAribeMotos />;
  }

  // Se for usuário comum (role = 1), mostrar tela de usuário
  return <SistemaAribeMotosUsuario />;
};

export default ProtectedRoute;