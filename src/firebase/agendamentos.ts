import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from './config';

interface Agendamento {
  id: string;
  nomeCompleto: string;
  telefone: string;
  modeloMoto: string;
  cor: string;
  chassi: string;
  numeroPedido: string;
  dataRetirada: string;
  horarioRetirada: string;
  status: 'pendente' | 'entregue';
  dataCadastro: string;
}

export const criarAgendamento = async (agendamento: any) => {
  try {
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
    const querySnapshot = await getDocs(q);
    const agendamentos: Agendamento[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Agendamento));
    return { success: true, data: agendamentos };
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    return { success: false, error, data: [] };
  }
};

export const atualizarStatus = async (id: string, status: string) => {
  try {
    const docRef = doc(db, 'agendamentos', id);
    await updateDoc(docRef, { status });
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