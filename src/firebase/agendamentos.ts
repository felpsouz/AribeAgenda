// src/firebase/agendamentos.ts

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

const COLLECTION_NAME = 'agendamentos';

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

interface ResultadoOperacao<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Criar novo agendamento
export const criarAgendamento = async (
  agendamento: Omit<Agendamento, 'dataCadastro'>
): Promise<ResultadoOperacao> => {
  try {
    console.log('🔵 Tentando criar agendamento:', agendamento);
    
    const { id, ...agendamentoSemId } = agendamento;
    
    const agendamentoComData = {
      ...agendamentoSemId,
      dataCadastro: new Date().toISOString()
    };

    const docRef = await addDoc(
      collection(db, COLLECTION_NAME), 
      agendamentoComData
    );
    
    console.log('✅ Agendamento criado com ID:', docRef.id);
    
    return {
      success: true,
      data: { id: docRef.id, ...agendamentoComData }
    };
  } catch (error) {
    console.error('❌ Erro ao criar agendamento:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao criar agendamento'
    };
  }
};

// Listar todos os agendamentos
export const listarAgendamentos = async (): Promise<ResultadoOperacao<Agendamento[]>> => {
  try {
    console.log('🔵 Buscando agendamentos...');
    
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('dataCadastro', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const agendamentos: Agendamento[] = [];
    
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      console.log('📄 Documento encontrado - ID:', docSnap.id, 'Status:', data.status);
      
      agendamentos.push({
        id: docSnap.id,
        ...data
      } as Agendamento);
    });
    
    console.log('✅ Total de agendamentos:', agendamentos.length);
    
    return {
      success: true,
      data: agendamentos
    };
  } catch (error) {
    console.error('❌ Erro ao listar agendamentos:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Erro ao listar agendamentos'
    };
  }
};

// Atualizar status do agendamento
export const atualizarStatus = async (
  id: string,
  novoStatus: 'pendente' | 'entregue'
): Promise<ResultadoOperacao> => {
  try {
    console.log('🔵 Tentando atualizar status - ID:', id, 'Novo status:', novoStatus);
    
    if (!id || id === '') {
      throw new Error('ID do documento está vazio');
    }
    
    const docRef = doc(db, COLLECTION_NAME, id);
    console.log('📄 Referência do documento criada:', docRef.path);
    
    await updateDoc(docRef, {
      status: novoStatus
    });
    
    console.log('✅ Status atualizado com sucesso!');
    
    return {
      success: true
    };
  } catch (error) {
    console.error('❌ Erro ao atualizar status:', error);
    console.error('Detalhes - ID:', id, 'Status:', novoStatus);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao atualizar status'
    };
  }
};

// Excluir agendamento
export const excluirAgendamento = async (id: string): Promise<ResultadoOperacao> => {
  try {
    console.log('🔵 Tentando excluir agendamento - ID:', id);
    
    if (!id || id === '') {
      throw new Error('ID do documento está vazio');
    }
    
    const docRef = doc(db, COLLECTION_NAME, id);
    console.log('📄 Referência do documento criada:', docRef.path);
    
    await deleteDoc(docRef);
    
    console.log('✅ Agendamento excluído com sucesso!');
    
    return {
      success: true
    };
  } catch (error) {
    console.error('❌ Erro ao excluir agendamento:', error);
    console.error('Detalhes - ID:', id);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao excluir agendamento'
    };
  }
};