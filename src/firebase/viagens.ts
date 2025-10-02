import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from './config';

// Remova 'id' do tipo de entrada
export const criarViagem = async (viagem: Omit<any, 'id' | 'dataCadastro'>) => {
  try {
    const docRef = await addDoc(collection(db, 'viagens'), {
      ...viagem,
      dataCadastro: new Date().toISOString()
    });
    
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Erro ao criar viagem:', error);
    return { success: false, error };
  }
};

export const listarViagens = async () => {
  try {
    const q = query(collection(db, 'viagens'), orderBy('dataCadastro', 'desc'));
    const snapshot = await getDocs(q);
    
    const viagens = snapshot.docs.map(doc => ({
      id: doc.id, // ID gerado pelo Firebase
      ...doc.data()
    }));
    
    return { success: true, data: viagens };
  } catch (error) {
    console.error('Erro ao listar viagens:', error);
    return { success: false, error };
  }
};

export const atualizarStatusViagem = async (id: string, novoStatus: string) => {
  try {
    const viagemRef = doc(db, 'viagens', id);
    await updateDoc(viagemRef, {
      status: novoStatus,
      updatedAt: new Date().toISOString()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar status da viagem:', error);
    return { success: false, error };
  }
};

export const excluirViagem = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'viagens', id));
    return { success: true };
  } catch (error) {
    console.error('Erro ao excluir viagem:', error);
    return { success: false, error };
  }
};