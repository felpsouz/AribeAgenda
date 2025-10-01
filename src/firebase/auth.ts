import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  AuthError
} from 'firebase/auth';
import { auth } from './config';

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
    
    // Nota: Os dados do usuário (role) devem ser criados manualmente no Firestore
    // ou através de um script de admin separado
    
    return {
      success: true,
      user: userCredential.user
    };
  } catch (error: unknown) {
    let errorMessage = 'Erro ao fazer login';
    
    // Type guard para verificar se é um AuthError do Firebase
    if (error && typeof error === 'object' && 'code' in error) {
      const authError = error as AuthError;
      
      // Traduzir erros comuns do Firebase
      switch (authError.code) {
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
          errorMessage = authError.message || 'Erro ao fazer login';
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
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
  } catch (error: unknown) {
    let errorMessage = 'Erro ao fazer logout';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String(error.message);
    }
    
    return {
      success: false,
      error: errorMessage
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