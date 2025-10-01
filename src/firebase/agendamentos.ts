import { 
  collection, 
  query, 
  where, 
  getDocs, 
  runTransaction, 
  doc,
  updateDoc,
  deleteDoc,
  orderBy
} from 'firebase/firestore';
import { db } from './config';

const COLLECTION_NAME = 'agendamentos';

interface Agendamento {
  id?: string;
  nomeCompleto: string;
  telefone: string;
  modeloMoto: string;
  cor: string;
  chassi: string;
  numeroPedido: string;
  dataRetirada: string;
  horarioRetirada: string;
  status: 'pendente' | 'entregue';
  dataCadastro?: string;
}

interface ResultadoOperacao {
  success: boolean;
  data?: Agendamento | Agendamento[] | { id: string; status?: string }; // ✅ Tipo específico
  error?: string;
}

export const criarAgendamento = async (
  agendamento: Omit<Agendamento, 'dataCadastro'>
): Promise<ResultadoOperacao> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...agendamentoSemId } = agendamento; // ✅ Desabilita warning para 'id'

    const agendamentoComData = {
      ...agendamentoSemId,
      dataCadastro: new Date().toISOString(),
      status: 'pendente' as const
    };

    await runTransaction(db, async (transaction) => {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('dataRetirada', '==', agendamentoComData.dataRetirada),
        where('horarioRetirada', '==', agendamentoComData.horarioRetirada),
        where('status', '==', 'pendente')
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        throw new Error('Esse horário já foi agendado. Escolha outro.');
      }

      const newDocRef = doc(collection(db, COLLECTION_NAME));
      transaction.set(newDocRef, agendamentoComData);
    });

    return {
      success: true,
      data: agendamentoComData
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao criar agendamento'
    };
  }
};

export const listarAgendamentos = async (): Promise<ResultadoOperacao> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('dataCadastro', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const agendamentos: Agendamento[] = [];

    querySnapshot.forEach((docSnap) => {
      agendamentos.push({
        id: docSnap.id,
        ...docSnap.data()
      } as Agendamento);
    });

    return {
      success: true,
      data: agendamentos
    };
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    return {
      success: false,
      error: 'Erro ao listar agendamentos',
      data: []
    };
  }
};

export const atualizarStatus = async (
  id: string, 
  novoStatus: 'pendente' | 'entregue'
): Promise<ResultadoOperacao> => {
  try {
    const agendamentoRef = doc(db, COLLECTION_NAME, id);
    
    await updateDoc(agendamentoRef, {
      status: novoStatus
    });

    return {
      success: true,
      data: { id, status: novoStatus }
    };
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    return {
      success: false,
      error: 'Erro ao atualizar status'
    };
  }
};

export const excluirAgendamento = async (id: string): Promise<ResultadoOperacao> => {
  try {
    const agendamentoRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(agendamentoRef);

    return {
      success: true,
      data: { id }
    };
  } catch (error) {
    console.error('Erro ao excluir agendamento:', error);
    return {
      success: false,
      error: 'Erro ao excluir agendamento'
    };
  }
};