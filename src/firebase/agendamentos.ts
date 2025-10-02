import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from './config';

// Remova 'id' do tipo de entrada
export const criarAgendamento = async (agendamento: Omit<any, 'id' | 'dataCadastro'>) => {
  try {
    // addDoc gera o ID automaticamente
    const docRef = await addDoc(collection(db, 'agendamentos'), {
      ...agendamento,
      dataCadastro: new Date().toISOString()
    });
    
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    return { success: false, error };
  }
};

export const listarAgendamentos = async () => {
  try {
    const q = query(collection(db, 'agendamentos'), orderBy('dataCadastro', 'desc'));
    const snapshot = await getDocs(q);
    
    const agendamentos = snapshot.docs.map(doc => ({
      id: doc.id, // ID gerado pelo Firebase
      ...doc.data()
    }));
    
    return { success: true, data: agendamentos };
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    return { success: false, error };
  }
};

export const atualizarStatus = async (id: string, novoStatus: string) => {
  try {
    const agendamentoRef = doc(db, 'agendamentos', id);
    await updateDoc(agendamentoRef, {
      status: novoStatus,
      updatedAt: new Date().toISOString()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    return { success: false, error };
  }
};

export const excluirAgendamento = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'agendamentos', id));
    return { success: true };
  } catch (error) {
    console.error('Erro ao excluir agendamento:', error);
    return { success: false, error };
  }
};