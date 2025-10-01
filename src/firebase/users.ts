import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './config';

// 0 = admin, 1 = user
export type UserRole = 0 | 1;

export interface UserData {
  email: string;
  role: UserRole;
  createdAt: Date;
}

// Buscar role do usuário
export const buscarRoleUsuario = async (uid: string): Promise<UserRole> => {
  console.log('🔍 Buscando role para UID:', uid);
  
  try {
    const userDoc = await getDoc(doc(db, 'usuarios', uid));
    
    console.log('📋 Documento existe?', userDoc.exists());
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('📄 Dados do documento:', userData);
      console.log('🎯 Role encontrada:', userData.role);
      console.log('🔢 Tipo da role:', typeof userData.role);
      
      return userData.role as UserRole;
    }
    
    console.log('⚠️ Documento não existe, retornando role padrão: 1');
    // Se não existe, retorna 1 (user) por padrão
    return 1;
  } catch (error) {
    console.error('❌ Erro ao buscar role do usuário:', error);
    return 1; // Por padrão, retorna user
  }
};

// Criar ou atualizar dados do usuário no Firestore
export const criarDadosUsuario = async (
  uid: string, 
  email: string, 
  role: UserRole = 1
): Promise<boolean> => {
  try {
    await setDoc(doc(db, 'usuarios', uid), {
      email,
      role,
      createdAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Erro ao criar dados do usuário:', error);
    return false;
  }
};

// Verificar se usuário é admin (role = 0)
export const verificarSeEhAdmin = async (uid: string): Promise<boolean> => {
  const role = await buscarRoleUsuario(uid);
  return role === 0;
};

// Verificar se usuário é user comum (role = 1)
export const verificarSeEhUser = async (uid: string): Promise<boolean> => {
  const role = await buscarRoleUsuario(uid);
  return role === 1;
};