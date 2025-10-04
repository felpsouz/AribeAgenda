import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  where,
  runTransaction,
  Timestamp
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
  dataCadastro: string;
}

interface FirebaseResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  id?: string;
}

export const criarAgendamento = async (
  agendamento: Omit<Agendamento, 'id' | 'dataCadastro'>
): Promise<FirebaseResponse<null>> => {
  try {
    const agendamentosRef = collection(db, 'agendamentos');
    
    // Usa transação para garantir atomicidade
    const resultado = await runTransaction(db, async (transaction) => {
      // Verifica se já existe agendamento para o mesmo horário
      const q = query(
        agendamentosRef,
        where('dataRetirada', '==', agendamento.dataRetirada),
        where('horarioRetirada', '==', agendamento.horarioRetirada)
      );
      
      // IMPORTANTE: Usar transaction.get() dentro da transação
      const snapshot = await transaction.get(q);
      
      // Se já existe um agendamento para esse horário, lança erro específico
      if (!snapshot.empty) {
        throw new Error('HORARIO_OCUPADO');
      }
      
      // Cria referência para o novo documento
      const novoDocRef = doc(agendamentosRef);
      
      // Cria o novo agendamento com timestamp
      const novoAgendamento = {
        ...agendamento,
        dataCadastro: new Date().toISOString(),
        timestamp: Timestamp.now()
      };
      
      // Adiciona o documento usando transaction.set()
      transaction.set(novoDocRef, novoAgendamento);
      
      return novoDocRef;
    });

    return { success: true, data: null, id: resultado.id };
    
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    
    // Tratamento específico para horário ocupado
    if (error instanceof Error && error.message === 'HORARIO_OCUPADO') {
      return {
        success: false,
        data: null,
        error: 'HORARIO_OCUPADO',
      };
    }
    
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
};

export const listarAgendamentos = async (): Promise<FirebaseResponse<Agendamento[]>> => {
  try {
    const q = query(collection(db, 'agendamentos'), orderBy('dataCadastro', 'desc'));
    const snapshot = await getDocs(q);

    const agendamentos: Agendamento[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Agendamento, 'id'>),
    }));

    return { success: true, data: agendamentos };
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
};

export const atualizarStatus = async (
  id: string,
  novoStatus: 'pendente' | 'entregue'
): Promise<FirebaseResponse<null>> => {
  try {
    const agendamentoRef = doc(db, 'agendamentos', id);
    await updateDoc(agendamentoRef, {
      status: novoStatus,
      updatedAt: new Date().toISOString(),
    });

    return { success: true, data: null };
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
};

export const excluirAgendamento = async (id: string): Promise<FirebaseResponse<null>> => {
  try {
    await deleteDoc(doc(db, 'agendamentos', id));
    return { success: true, data: null };
  } catch (error) {
    console.error('Erro ao excluir agendamento:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
};