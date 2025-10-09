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

export interface Viagem {
  id: string;
  origem: string;
  destino: string;
  modeloMoto: string;
  cor: string;
  chassi: string;
  numeroPedido: string;
  dataCadastro: string;
  status: 'pendente' | 'concluida';
  excluido?: boolean; // Campo para soft delete
  dataExclusao?: string; // Data em que foi excluído
}

interface FirebaseResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  id?: string;
}

export const criarViagem = async (
  viagem: Omit<Viagem, 'id' | 'dataCadastro'>
): Promise<FirebaseResponse<null>> => {
  try {
    const viagensRef = collection(db, 'viagens');
    
    // Cria um ID único para verificar duplicatas (opcional - baseado em chassi e numeroPedido)
    const viagemId = `${viagem.chassi}_${viagem.numeroPedido}`;
    const viagemDocRef = doc(db, 'viagens_controle', viagemId);
    
    // Usa transação para garantir atomicidade
    const resultado = await runTransaction(db, async (transaction) => {
      // Verifica se já existe uma viagem com mesmo chassi e número de pedido
      const viagemDoc = await transaction.get(viagemDocRef);
      
      // Se já existe um documento de controle, a viagem já foi cadastrada
      if (viagemDoc.exists()) {
        throw new Error('VIAGEM_DUPLICADA');
      }
      
      // Cria referência para o novo documento de viagem
      const novoDocRef = doc(viagensRef);
      
      // Cria a nova viagem com timestamp
      const novaViagem = {
        ...viagem,
        dataCadastro: new Date().toISOString(),
        timestamp: Timestamp.now(),
        excluido: false // Inicializa como não excluído
      };
      
      // Adiciona o documento de viagem usando transaction.set()
      transaction.set(novoDocRef, novaViagem);
      
      // Cria documento de controle para evitar duplicatas
      transaction.set(viagemDocRef, {
        viagemId: novoDocRef.id,
        chassi: viagem.chassi,
        numeroPedido: viagem.numeroPedido,
        timestamp: Timestamp.now()
      });
      
      return novoDocRef;
    });

    return { success: true, data: null, id: resultado.id };
    
  } catch (error) {
    console.error('Erro ao criar viagem:', error);
    
    // Tratamento específico para viagem duplicada
    if (error instanceof Error && error.message === 'VIAGEM_DUPLICADA') {
      return {
        success: false,
        data: null,
        error: 'VIAGEM_DUPLICADA',
      };
    }
    
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
};

// Lista apenas viagens não excluídas
export const listarViagens = async (): Promise<FirebaseResponse<Viagem[]>> => {
  try {
    const q = query(
      collection(db, 'viagens'),
      where('excluido', '==', false),
      orderBy('dataCadastro', 'desc')
    );
    const snapshot = await getDocs(q);

    const viagens: Viagem[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Viagem, 'id'>),
    }));

    return { success: true, data: viagens };
  } catch (error) {
    console.error('Erro ao listar viagens:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
};

// Nova função para listar o histórico (viagens excluídas)
export const listarHistorico = async (): Promise<FirebaseResponse<Viagem[]>> => {
  try {
    const q = query(
      collection(db, 'viagens'),
      where('excluido', '==', true),
      orderBy('dataExclusao', 'desc')
    );
    const snapshot = await getDocs(q);

    const historico: Viagem[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Viagem, 'id'>),
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

// Nova função para listar todas as viagens (ativas e excluídas)
export const listarTodasViagens = async (): Promise<FirebaseResponse<Viagem[]>> => {
  try {
    const q = query(collection(db, 'viagens'), orderBy('dataCadastro', 'desc'));
    const snapshot = await getDocs(q);

    const viagens: Viagem[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Viagem, 'id'>),
    }));

    return { success: true, data: viagens };
  } catch (error) {
    console.error('Erro ao listar todas viagens:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
};

export const atualizarStatusViagem = async (
  id: string,
  novoStatus: 'pendente' | 'concluida'
): Promise<FirebaseResponse<null>> => {
  try {
    const viagemRef = doc(db, 'viagens', id);
    await updateDoc(viagemRef, {
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
export const excluirViagem = async (id: string): Promise<FirebaseResponse<null>> => {
  try {
    const viagemDoc = await getDocs(query(collection(db, 'viagens'), where('__name__', '==', id)));
    
    if (!viagemDoc.empty) {
      const viagem = viagemDoc.docs[0].data() as Viagem;
      const viagemId = `${viagem.chassi}_${viagem.numeroPedido}`;
      const viagemDocRef = doc(db, 'viagens_controle', viagemId);
      
      // Marca como excluído e remove o documento de controle
      await runTransaction(db, async (transaction) => {
        const viagemRef = doc(db, 'viagens', id);
        
        // Atualiza a viagem marcando como excluído
        transaction.update(viagemRef, {
          excluido: true,
          dataExclusao: new Date().toISOString()
        });
        
        // Remove o documento de controle para liberar chassi/pedido
        transaction.delete(viagemDocRef);
      });
    } else {
      // Caso não encontre com query, tenta atualizar diretamente
      const viagemRef = doc(db, 'viagens', id);
      await updateDoc(viagemRef, {
        excluido: true,
        dataExclusao: new Date().toISOString()
      });
    }
    
    return { success: true, data: null };
  } catch (error) {
    console.error('Erro ao excluir viagem:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
};

// Nova função para restaurar uma viagem excluída
export const restaurarViagem = async (id: string): Promise<FirebaseResponse<null>> => {
  try {
    const viagemDoc = await getDocs(query(collection(db, 'viagens'), where('__name__', '==', id)));
    
    if (!viagemDoc.empty) {
      const viagem = viagemDoc.docs[0].data() as Viagem;
      const viagemId = `${viagem.chassi}_${viagem.numeroPedido}`;
      const viagemDocRef = doc(db, 'viagens_controle', viagemId);
      
      // Verifica se o chassi/pedido ainda está disponível antes de restaurar
      await runTransaction(db, async (transaction) => {
        const viagemControlDoc = await transaction.get(viagemDocRef);
        
        if (viagemControlDoc.exists()) {
          throw new Error('VIAGEM_DUPLICADA');
        }
        
        const viagemRef = doc(db, 'viagens', id);
        
        // Remove a marcação de excluído
        transaction.update(viagemRef, {
          excluido: false,
          dataExclusao: null
        });
        
        // Recria o documento de controle
        transaction.set(viagemDocRef, {
          viagemId: id,
          chassi: viagem.chassi,
          numeroPedido: viagem.numeroPedido,
          timestamp: Timestamp.now()
        });
      });
    }
    
    return { success: true, data: null };
  } catch (error) {
    console.error('Erro ao restaurar viagem:', error);
    
    if (error instanceof Error && error.message === 'VIAGEM_DUPLICADA') {
      return {
        success: false,
        data: null,
        error: 'VIAGEM_DUPLICADA',
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
    const viagemDoc = await getDocs(query(collection(db, 'viagens'), where('__name__', '==', id)));
    
    if (!viagemDoc.empty) {
      const viagem = viagemDoc.docs[0].data() as Viagem;
      const viagemId = `${viagem.chassi}_${viagem.numeroPedido}`;
      const viagemDocRef = doc(db, 'viagens_controle', viagemId);
      
      // Remove tanto a viagem quanto o documento de controle
      await runTransaction(db, async (transaction) => {
        transaction.delete(doc(db, 'viagens', id));
        transaction.delete(viagemDocRef);
      });
    } else {
      await deleteDoc(doc(db, 'viagens', id));
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