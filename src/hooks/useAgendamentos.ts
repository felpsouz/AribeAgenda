import { useState, useCallback } from 'react';
import { Agendamento } from '@/types';
import { criarAgendamento, listarAgendamentos, atualizarStatus, excluirAgendamento } from '@/firebase/agendamentos';

export const useAgendamentos = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const carregarAgendamentos = useCallback(async () => {
    setLoadingData(true);
    try {
      const resultado = await listarAgendamentos();
      if (resultado.success && resultado.data) {
        setAgendamentos(resultado.data as Agendamento[]);
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      throw error;
    } finally {
      setLoadingData(false);
    }
  }, []);

  const salvarAgendamento = useCallback(async (novoAgendamento: Omit<Agendamento, 'id' | 'dataCadastro'>) => {
    setLoading(true);
    try {
      const resultado = await criarAgendamento(novoAgendamento);
      if (resultado.success) {
        await carregarAgendamentos();
        return { success: true };
      }
      return { success: false, error: resultado.error };
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      return { success: false, error: 'Erro ao criar agendamento' };
    } finally {
      setLoading(false);
    }
  }, [carregarAgendamentos]);

  const atualizarStatusAgendamento = useCallback(async (id: string, novoStatus: 'pendente' | 'entregue') => {
    try {
      const resultado = await atualizarStatus(id, novoStatus);
      if (resultado.success) {
        await carregarAgendamentos();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      return false;
    }
  }, [carregarAgendamentos]);

  const excluirAgendamento = useCallback(async (id: string) => {
    try {
      const resultado = await excluirAgendamento(id);
      if (resultado.success) {
        await carregarAgendamentos();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
      return false;
    }
  }, [carregarAgendamentos]);

  return {
    agendamentos,
    loading,
    loadingData,
    carregarAgendamentos,
    salvarAgendamento,
    atualizarStatusAgendamento,
    excluirAgendamento
  };
};