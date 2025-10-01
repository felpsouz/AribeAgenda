import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from './config';

interface Viagem {
  id: string;
  origem: string;
  origemOutros?: string;
  destino: string;
  destinoOutros?: string;
  modeloMoto: string;
  cor: string;
  chassi: string;
  numeroPedido: string;
  dataCadastro: string;
  status: 'pendente' | 'concluida';
}

type NovaViagem = Omit<Viagem, 'dataCadastro'>;

export const criarViagem = async (viagem: NovaViagem) => {
  try {
    const docRef = await addDoc(collection(db, 'viagens'), {
      ...viagem,
      dataCadastro: new Date().toISOString()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Erro ao criar viagem:', error);
    return { success: false, error };
  }
};

export const listarViagens = async () => {
  try {
    const q = query(collection(db, 'viagens'), orderBy('dataCadastro', 'desc'));
    const querySnapshot = await getDocs(q);
    const viagens: Viagem[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Viagem));
    return { success: true, data: viagens };
  } catch (error) {
    console.error('Erro ao listar viagens:', error);
    return { success: false, error, data: [] };
  }
};

export const atualizarStatusViagem = async (id: string, status: string) => {
  try {
    const docRef = doc(db, 'viagens', id);
    await updateDoc(docRef, { status });
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar status da viagem:', error);
    return { success: false, error };
  }
};

export const excluirViagem = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'viagens', id));
    return { success: true };
  } catch (error) {
    console.error('Erro ao excluir viagem:', error);
    return { success: false, error };
  }
};