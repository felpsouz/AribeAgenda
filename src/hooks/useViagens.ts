import { useState, useCallback } from 'react';
import { Viagem } from '@/types';
import { criarViagem, listarViagens, atualizarStatusViagem, excluirViagem } from '@/firebase/viagens';

export const useViagens = () => {
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const carregarViagens = useCallback(async () => {
    setLoadingData(true);
    try {
      const resultado = await listarViagens();
      if (resultado.success && resultado.data) {
        setViagens(resultado.data as Viagem[]);
      }
    } catch (error) {
      console.error('Erro ao carregar viagens:', error);
      throw error;
    } finally {
      setLoadingData(false);
    }
  }, []);

  const salvarViagem = useCallback(async (novaViagem: Omit<Viagem, 'id' | 'dataCadastro'>) => {
    setLoading(true);
    try {
      const resultado = await criarViagem(novaViagem);
      if (resultado.success) {
        await carregarViagens();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao salvar viagem:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [carregarViagens]);

  const atualizarStatusViagem = useCallback(async (id: string, novoStatus: 'pendente' | 'concluida') => {
    try {
      const resultado = await atualizarStatusViagem(id, novoStatus);
      if (resultado.success) {
        await carregarViagens();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao atualizar status da viagem:', error);
      return false;
    }
  }, [carregarViagens]);

  const excluirViagem = useCallback(async (id: string) => {
    try {
      const resultado = await excluirViagem(id);
      if (resultado.success) {
        await carregarViagens();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao excluir viagem:', error);
      return false;
    }
  }, [carregarViagens]);

  return {
    viagens,
    loading,
    loadingData,
    carregarViagens,
    salvarViagem,
    atualizarStatusViagem,
    excluirViagem
  };
};