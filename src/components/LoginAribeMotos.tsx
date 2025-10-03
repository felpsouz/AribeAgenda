import React, { useState, useEffect } from 'react';
import { Bike, Lock, User, Eye, EyeOff } from 'lucide-react';
import { fazerLogin, verificarAutenticacao } from '@/firebase/auth';

interface LoginFormData {
  email: string;
  senha: string;
}

interface LoginProps {
  onLoginSuccess?: () => void;
}

const LoginAribeMotos: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    senha: ''
  });
  const [mostrarSenha, setMostrarSenha] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [verificandoAuth, setVerificandoAuth] = useState<boolean>(true);
  const [erro, setErro] = useState<string>('');

  // Verificar se usuário já está autenticado ao carregar a página
  useEffect(() => {
    const verificar = async () => {
      const user = await verificarAutenticacao();
      if (user) {
        // Usuário já está logado, redirecionar
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      }
      setVerificandoAuth(false);
    };
    verificar();
  }, [onLoginSuccess]);

  const handleInputChange = (field: keyof LoginFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    setErro('');
  };

  const handleSubmit = async (): Promise<void> => {
    if (!formData.email.trim()) {
      setErro('Por favor, digite seu e-mail');
      return;
    }
    
    if (!formData.senha.trim()) {
      setErro('Por favor, digite sua senha');
      return;
    }

    setLoading(true);
    setErro('');

    const resultado = await fazerLogin(formData.email, formData.senha);

    if (resultado.success) {
      console.log('Login realizado com sucesso!', resultado.user);
      // Chamar callback de sucesso
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } else {
      setErro(resultado.error || 'Erro ao fazer login');
    }
    
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  // Mostrar loading enquanto verifica autenticação
  if (verificandoAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-4">
            <Bike className="text-red-600 animate-pulse" size={40} />
          </div>
          <p className="text-white text-lg">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card de Login */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Cabeçalho */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-4">
              <Bike className="text-red-600" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Aribé Motos</h1>
            <p className="text-red-100 text-sm">Sistema de Agendamento</p>
          </div>

          {/* Formulário */}
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Acesse sua conta
            </h2>

            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                <p className="text-sm font-medium">{erro}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Campo E-mail */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  E-mail
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="text-gray-400" size={20} />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    placeholder="Digite seu e-mail"
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Campo Senha */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="text-gray-400" size={20} />
                  </div>
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    value={formData.senha}
                    onChange={handleInputChange('senha')}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    placeholder="Digite sua senha"
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={loading}
                  >
                    {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Botão de Login */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 px-6 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Entrando...
                  </span>
                ) : (
                  'Entrar'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="text-center mt-6">
          <p className="text-white text-sm opacity-90">
            © Aribé Motos - Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginAribeMotos;