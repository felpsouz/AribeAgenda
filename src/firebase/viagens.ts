import { 
  collection, 
  query, 
  getDocs, 
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
  addDoc
} from 'firebase/firestore';
import { db } from './config';

const COLLECTION_NAME = 'viagens';

interface Viagem {
  id?: string;
  origem: string;
  origemOutros?: string;
  destino: string;
  destinoOutros?: string;
  modeloMoto: string;
  cor: string;
  chassi: string;
  numeroPedido: string;
  dataCadastro?: string;
  status: 'pendente' | 'concluida';
}

interface ResultadoOperacao {
  success: boolean;
  data?: Viagem | Viagem[] | { id: string; status?: string }; // ✅ Tipo específico
  error?: string;
}

export const criarViagem = async (
  viagem: Omit<Viagem, 'dataCadastro'>
): Promise<ResultadoOperacao> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...viagemSemId } = viagem; // ✅ Desabilita warning para 'id'

    const viagemComData = {
      ...viagemSemId,
      dataCadastro: new Date().toISOString(),
      status: 'pendente' as const
    };

    const docRef = await addDoc(
      collection(db, COLLECTION_NAME), 
      viagemComData
    );

    return {
      success: true,
      data: { id: docRef.id, ...viagemComData }
    };
  } catch (error) {
    console.error('Erro ao criar viagem:', error);
    return {
      success: false,
      error: 'Erro ao criar viagem'
    };
  }
};

export const listarViagens = async (): Promise<ResultadoOperacao> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('dataCadastro', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const viagens: Viagem[] = [];

    querySnapshot.forEach((docSnap) => {
      viagens.push({
        id: docSnap.id,
        ...docSnap.data()
      } as Viagem);
    });

    return {
      success: true,
      data: viagens
    };
  } catch (error) {
    console.error('Erro ao listar viagens:', error);
    return {
      success: false,
      error: 'Erro ao listar viagens',
      data: []
    };
  }
};

export const atualizarStatusViagem = async (
  id: string, 
  novoStatus: 'pendente' | 'concluida'
): Promise<ResultadoOperacao> => {
  try {
    const viagemRef = doc(db, COLLECTION_NAME, id);
    
    await updateDoc(viagemRef, {
      status: novoStatus
    });

    return {
      success: true,
      data: { id, status: novoStatus }
    };
  } catch (error) {
    console.error('Erro ao atualizar status da viagem:', error);
    return {
      success: false,
      error: 'Erro ao atualizar status da viagem'
    };
  }
};

export const excluirViagem = async (id: string): Promise<ResultadoOperacao> => {
  try {
    const viagemRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(viagemRef);

    return {
      success: true,
      data: { id }
    };
  } catch (error) {
    console.error('Erro ao excluir viagem:', error);
    return {
      success: false,
      error: 'Erro ao excluir viagem'
    };
  }
};