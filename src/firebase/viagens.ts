// src/firebase/viagens.ts
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from './config';

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
  data?: any;
  error?: string;
}

const COLECAO_VIAGENS = 'viagens';

// Criar nova viagem
export const criarViagem = async (
  viagem: Omit<Viagem, 'dataCadastro'>
): Promise<ResultadoOperacao> => {
  try {
    const viagemComData = {
      ...viagem,
      dataCadastro: new Date().toISOString()
    };

    const docRef = await addDoc(
      collection(db, COLECAO_VIAGENS), 
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

// Listar todas as viagens
export const listarViagens = async (): Promise<ResultadoOperacao> => {
  try {
    const q = query(
      collection(db, COLECAO_VIAGENS),
      orderBy('dataCadastro', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const viagens: Viagem[] = [];

    querySnapshot.forEach((doc) => {
      viagens.push({
        id: doc.id,
        ...doc.data()
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

// Atualizar status da viagem
export const atualizarStatusViagem = async (
  id: string, 
  novoStatus: 'pendente' | 'concluida'
): Promise<ResultadoOperacao> => {
  try {
    const viagemRef = doc(db, COLECAO_VIAGENS, id);
    
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

// Excluir viagem
export const excluirViagem = async (id: string): Promise<ResultadoOperacao> => {
  try {
    const viagemRef = doc(db, COLECAO_VIAGENS, id);
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