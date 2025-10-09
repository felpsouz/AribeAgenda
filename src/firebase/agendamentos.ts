import { 
  collection, 
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
  excluido?: boolean; // Campo para soft delete
  dataExclusao?: string; // Data em que foi excluído
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
    
    // Cria um ID único para o documento de controle de horário
    const horarioId = `${agendamento.dataRetirada}_${agendamento.horarioRetirada}`;
    const horarioDocRef = doc(db, 'horarios_ocupados', horarioId);
    
    // Usa transação para garantir atomicidade
    const resultado = await runTransaction(db, async (transaction) => {
      // Verifica se o horário já está ocupado usando um documento de controle
      const horarioDoc = await transaction.get(horarioDocRef);
      
      // Se já existe um documento de controle, o horário está ocupado
      if (horarioDoc.exists()) {
        throw new Error('HORARIO_OCUPADO');
      }
      
      // Cria referência para o novo documento de agendamento
      const novoDocRef = doc(agendamentosRef);
      
      // Cria o novo agendamento com timestamp
      const novoAgendamento = {
        ...agendamento,
        dataCadastro: new Date().toISOString(),
        timestamp: Timestamp.now(),
        excluido: false // Inicializa como não excluído
      };
      
      // Adiciona o documento de agendamento usando transaction.set()
      transaction.set(novoDocRef, novoAgendamento);
      
      // Cria documento de controle de horário para evitar duplicatas
      transaction.set(horarioDocRef, {
        agendamentoId: novoDocRef.id,
        dataRetirada: agendamento.dataRetirada,
        horarioRetirada: agendamento.horarioRetirada,
        timestamp: Timestamp.now()
      });
      
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

// Lista apenas agendamentos não excluídos
export const listarAgendamentos = async (): Promise<FirebaseResponse<Agendamento[]>> => {
  try {
    const q = query(
      collection(db, 'agendamentos'),
      where('excluido', '==', false),
      orderBy('dataCadastro', 'desc')
    );
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

// Nova função para listar o histórico (agendamentos excluídos)
export const listarHistorico = async (): Promise<FirebaseResponse<Agendamento[]>> => {
  try {
    const q = query(
      collection(db, 'agendamentos'),
      where('excluido', '==', true),
      orderBy('dataExclusao', 'desc')
    );
    const snapshot = await getDocs(q);

    const historico: Agendamento[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Agendamento, 'id'>),
    }));

    return { success: true, data: historico };
  } catch (error) {
    console.error('Erro ao listar histórico:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
};

// Nova função para listar todos os agendamentos (ativos e excluídos)
export const listarTodosAgendamentos = async (): Promise<FirebaseResponse<Agendamento[]>> => {
  try {
    const q = query(collection(db, 'agendamentos'), orderBy('dataCadastro', 'desc'));
    const snapshot = await getDocs(q);

    const agendamentos: Agendamento[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Agendamento, 'id'>),
    }));

    return { success: true, data: agendamentos };
  } catch (error) {
    console.error('Erro ao listar todos agendamentos:', error);
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

// Soft delete - marca como excluído ao invés de deletar fisicamente
export const excluirAgendamento = async (id: string): Promise<FirebaseResponse<null>> => {
  try {
    const agendamentoDoc = await getDocs(query(collection(db, 'agendamentos'), where('__name__', '==', id)));
    
    if (!agendamentoDoc.empty) {
      const agendamento = agendamentoDoc.docs[0].data() as Agendamento;
      const horarioId = `${agendamento.dataRetirada}_${agendamento.horarioRetirada}`;
      const horarioDocRef = doc(db, 'horarios_ocupados', horarioId);
      
      // Marca como excluído e remove o documento de controle de horário
      await runTransaction(db, async (transaction) => {
        const agendamentoRef = doc(db, 'agendamentos', id);
        
        // Atualiza o agendamento marcando como excluído
        transaction.update(agendamentoRef, {
          excluido: true,
          dataExclusao: new Date().toISOString()
        });
        
        // Remove o documento de controle de horário para liberar o horário
        transaction.delete(horarioDocRef);
      });
    } else {
      // Caso não encontre com query, tenta atualizar diretamente
      const agendamentoRef = doc(db, 'agendamentos', id);
      await updateDoc(agendamentoRef, {
        excluido: true,
        dataExclusao: new Date().toISOString()
      });
    }
    
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

// Nova função para restaurar um agendamento excluído
export const restaurarAgendamento = async (id: string): Promise<FirebaseResponse<null>> => {
  try {
    const agendamentoDoc = await getDocs(query(collection(db, 'agendamentos'), where('__name__', '==', id)));
    
    if (!agendamentoDoc.empty) {
      const agendamento = agendamentoDoc.docs[0].data() as Agendamento;
      const horarioId = `${agendamento.dataRetirada}_${agendamento.horarioRetirada}`;
      const horarioDocRef = doc(db, 'horarios_ocupados', horarioId);
      
      // Verifica se o horário ainda está disponível antes de restaurar
      await runTransaction(db, async (transaction) => {
        const horarioDoc = await transaction.get(horarioDocRef);
        
        if (horarioDoc.exists()) {
          throw new Error('HORARIO_OCUPADO');
        }
        
        const agendamentoRef = doc(db, 'agendamentos', id);
        
        // Remove a marcação de excluído
        transaction.update(agendamentoRef, {
          excluido: false,
          dataExclusao: null
        });
        
        // Recria o documento de controle de horário
        transaction.set(horarioDocRef, {
          agendamentoId: id,
          dataRetirada: agendamento.dataRetirada,
          horarioRetirada: agendamento.horarioRetirada,
          timestamp: Timestamp.now()
        });
      });
    }
    
    return { success: true, data: null };
  } catch (error) {
    console.error('Erro ao restaurar agendamento:', error);
    
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

// Função para excluir permanentemente (use com cuidado!)
export const excluirPermanentemente = async (id: string): Promise<FirebaseResponse<null>> => {
  try {
    const agendamentoDoc = await getDocs(query(collection(db, 'agendamentos'), where('__name__', '==', id)));
    
    if (!agendamentoDoc.empty) {
      const agendamento = agendamentoDoc.docs[0].data() as Agendamento;
      const horarioId = `${agendamento.dataRetirada}_${agendamento.horarioRetirada}`;
      const horarioDocRef = doc(db, 'horarios_ocupados', horarioId);
      
      // Remove tanto o agendamento quanto o documento de controle de horário
      await runTransaction(db, async (transaction) => {
        transaction.delete(doc(db, 'agendamentos', id));
        transaction.delete(horarioDocRef);
      });
    } else {
      await deleteDoc(doc(db, 'agendamentos', id));
    }
    
    return { success: true, data: null };
  } catch (error) {
    console.error('Erro ao excluir permanentemente:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
};