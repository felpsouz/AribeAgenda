import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { auth } from './config'; // Certifique-se de ter o arquivo de configuração

interface AuthResult {
  success: boolean;
  user?: User | null;
  error?: string;
}

interface LogoutResult {
  success: boolean;
  error?: string;
}

// Fazer login com email e senha
export const fazerLogin = async (email: string, senha: string): Promise<AuthResult> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    return {
      success: true,
      user: userCredential.user
    };
  } catch (error: any) {
    let errorMessage = 'Erro ao fazer login';
    
    // Traduzir erros comuns do Firebase
    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage = 'E-mail inválido';
        break;
      case 'auth/user-disabled':
        errorMessage = 'Usuário desabilitado';
        break;
      case 'auth/user-not-found':
        errorMessage = 'Usuário não encontrado';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Senha incorreta';
        break;
      case 'auth/invalid-credential':
        errorMessage = 'Credenciais inválidas';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Muitas tentativas. Tente novamente mais tarde';
        break;
      default:
        errorMessage = error.message || 'Erro ao fazer login';
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Fazer logout
export const fazerLogout = async (): Promise<LogoutResult> => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erro ao fazer logout'
    };
  }
};

// Verificar se usuário está autenticado
export const verificarAutenticacao = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// Observar mudanças no estado de autenticação
export const observarAutenticacao = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};