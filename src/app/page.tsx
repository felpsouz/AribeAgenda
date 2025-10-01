'use client'
import React, { useState, useEffect } from 'react';
import LoginAribeMotos from './LoginAribeMotos';
import SistemaAribeMotos from './SistemaAribeMotos';
import SistemaAribeMotosUsuario from './SistemaAribeMotosUsuario'; // ← IMPORTAR versão usuário
import { verificarAutenticacao, fazerLogout } from '@/firebase/auth';
import { LogOut, Bike } from 'lucide-react';

const PageWithAuth: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<number | null>(null); // ← ADICIONAR estado do role
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Verificar se usuário está autenticado ao carregar
    const checkAuth = async () => {
      const { user, role } = await verificarAutenticacao(); // ← Agora retorna user E role
      setIsAuthenticated(!!user);
      setUserRole(role); // ← Salvar o role
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const handleLoginSuccess = async () => {
    // ← Buscar o role após login bem-sucedido
    const { user, role } = await verificarAutenticacao();
    setIsAuthenticated(!!user);
    setUserRole(role);
  };

  const handleLogout = async () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      const resultado = await fazerLogout();
      if (resultado.success) {
        setIsAuthenticated(false);
        setUserRole(null); // ← Limpar o role
      }
    }
  };

  // Tela de carregamento inicial
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

  // Se não autenticado, mostrar login
  if (!isAuthenticated) {
    return <LoginAribeMotos onLoginSuccess={handleLoginSuccess} />;
  }

  // ← DECIDIR QUAL COMPONENTE MOSTRAR BASEADO NO ROLE
  return (
    <div className="relative">
      {/* Botão de Logout fixo */}
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white text-red-600 px-4 py-2 rounded-lg shadow-lg hover:bg-red-50 transition-colors font-medium"
      >
        <LogOut size={18} />
        Sair
      </button>
      
      {/* Sistema principal - ESCOLHER baseado no role */}
      {userRole === 0 ? (
        <SistemaAribeMotos /> // ← Admin
      ) : userRole === 1 ? (
        <SistemaAribeMotosUsuario /> // ← Usuário comum
      ) : (
        // Caso o role seja null ou inválido
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