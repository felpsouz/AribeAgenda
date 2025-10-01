import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  AuthError
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './config';

interface AuthResult {
  success: boolean;
  user?: User | null;
  role?: number; // ← ADICIONAR role aqui
  error?: string;
}

interface LogoutResult {
  success: boolean;
  error?: string;
}

// Buscar role do usuário no Firestore
export const buscarRoleUsuario = async (uid: string): Promise<number | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data()?.role ?? null;
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar role:', error);
    return null;
  }
};

// Fazer login com email e senha
export const fazerLogin = async (email: string, senha: string): Promise<AuthResult> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    
    // ← BUSCAR O ROLE DO USUÁRIO NO FIRESTORE
    const role = await buscarRoleUsuario(userCredential.user.uid);
    
    if (role === null) {
      return {
        success: false,
        error: 'Usuário sem permissões definidas. Contate o administrador.'
      };
    }
    
    return {
      success: true,
      user: userCredential.user,
      role: role // ← RETORNAR o role
    };
  } catch (error: unknown) {
    let errorMessage = 'Erro ao fazer login';
    
    if (error && typeof error === 'object' && 'code' in error) {
      const authError = error as AuthError;
      
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

// Verificar se usuário está autenticado E retornar role
export const verificarAutenticacao = async (): Promise<{ user: User | null; role: number | null }> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (user) {
        const role = await buscarRoleUsuario(user.uid);
        resolve({ user, role });
      } else {
        resolve({ user: null, role: null });
      }
    });
  });
};

// Observar mudanças no estado de autenticação
export const observarAutenticacao = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};