import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from './config';

export interface Agendamento {
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
  dataCadastro: any;
}

const COLLECTION_NAME = 'agendamentos';

// Criar agendamento
export const criarAgendamento = async (agendamento: Omit<Agendamento, 'dataCadastro'>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...agendamento,
      dataCadastro: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    return { success: false, error };
  }
};

// Listar todos os agendamentos
export const listarAgendamentos = async () => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('dataCadastro', 'desc'));
    const querySnapshot = await getDocs(q);
    const agendamentos: Agendamento[] = [];
    
    querySnapshot.forEach((doc) => {
      agendamentos.push({
        id: doc.id,
        ...doc.data()
      } as Agendamento);
    });
    
    return { success: true, data: agendamentos };
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    return { success: false, error, data: [] };
  }
};

// Atualizar status do agendamento
export const atualizarStatus = async (id: string, status: 'pendente' | 'entregue') => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { status });
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    return { success: false, error };
  }
};

// Excluir agendamento
export const excluirAgendamento = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    return { success: true };
  } catch (error) {
    console.error('Erro ao excluir agendamento:', error);
    return { success: false, error };
  }
};