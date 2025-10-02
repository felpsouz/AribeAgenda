import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from './config';

interface Viagem {
  id: string;
  origem: string;
  destino: string;
  modeloMoto: string;
  cor: string;
  chassi: string;
  numeroPedido: string;
  dataCadastro: string;
  status: 'pendente' | 'concluida';
}

interface FirebaseResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  id?: string;
}

export const criarViagem = async (viagem: Omit<Viagem, 'id' | 'dataCadastro'>): Promise<FirebaseResponse> => {
  try {
    const docRef = await addDoc(collection(db, 'viagens'), {
      ...viagem,
      dataCadastro: new Date().toISOString()
    });
    
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Erro ao criar viagem:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
};

export const listarViagens = async (): Promise<FirebaseResponse> => {
  try {
    const q = query(collection(db, 'viagens'), orderBy('dataCadastro', 'desc'));
    const snapshot = await getDocs(q);
    
    const viagens = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, data: viagens };
  } catch (error) {
    console.error('Erro ao listar viagens:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
};

export const atualizarStatusViagem = async (id: string, novoStatus: string): Promise<FirebaseResponse> => {
  try {
    const viagemRef = doc(db, 'viagens', id);
    await updateDoc(viagemRef, {
      status: novoStatus,
      updatedAt: new Date().toISOString()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar status da viagem:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
};

export const excluirViagem = async (id: string): Promise<FirebaseResponse> => {
  try {
    await deleteDoc(doc(db, 'viagens', id));
    return { success: true };
  } catch (error) {
    console.error('Erro ao excluir viagem:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
};