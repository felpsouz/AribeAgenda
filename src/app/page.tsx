'use client'
import React, { useState, useEffect } from 'react';
import LoginAribeMotos from './LoginAribeMotos';
import SistemaAribeMotos from './SistemaAribeMotos';
import SistemaAribeMotosUsuario from './SistemaAribeMotosUsuario';
import { verificarAutenticacao, fazerLogout } from '@/firebase/auth';
import { buscarRoleUsuario } from '@/firebase/users'; // ADICIONE ESTA LINHA
import { LogOut, Bike } from 'lucide-react';

const PageWithAuth: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await verificarAutenticacao(); // Retorna User | null
      
      if (user) {
        setIsAuthenticated(true);
        const role = await buscarRoleUsuario(user.uid); // BUSCAR ROLE
        setUserRole(role);
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const handleLoginSuccess = async () => {
    const user = await verificarAutenticacao();
    
    if (user) {
      setIsAuthenticated(true);
      const role = await buscarRoleUsuario(user.uid); // BUSCAR ROLE
      setUserRole(role);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      const resultado = await fazerLogout();
      if (resultado.success) {
        setIsAuthenticated(false);
        setUserRole(null);
      }
    }
  };

  if (loading) {
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

  if (!isAuthenticated) {
    return <LoginAribeMotos onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="relative">
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white text-red-600 px-4 py-2 rounded-lg shadow-lg hover:bg-red-50 transition-colors font-medium"
      >
        <LogOut size={18} />
        Sair
      </button>
      
      {userRole === 0 ? (
        <SistemaAribeMotos />
      ) : userRole === 1 ? (
        <SistemaAribeMotosUsuario />
      ) : (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-700 text-lg mb-4">
              Usuário sem permissões definidas.
            </p>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
            >
              Fazer logout e tentar novamente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageWithAuth;