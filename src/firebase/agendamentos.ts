import { 
  collection, 
  query, 
  where, 
  getDocs, 
  runTransaction, 
  doc 
} from 'firebase/firestore';
import { db } from './config';

const COLLECTION_NAME = 'agendamentos';

export const criarAgendamento = async (
  agendamento: Omit<Agendamento, 'dataCadastro'>
): Promise<ResultadoOperacao> => {
  try {
    const { id, ...agendamentoSemId } = agendamento;

    const agendamentoComData = {
      ...agendamentoSemId,
      dataCadastro: new Date().toISOString(),
      status: 'pendente' as const
    };

    // 🔒 Usando transação para evitar concorrência
    await runTransaction(db, async (transaction) => {
      // 1 - Buscar se já existe agendamento para mesmo dia+hora
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

      // 2 - Se não existe, cria dentro da transação
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
