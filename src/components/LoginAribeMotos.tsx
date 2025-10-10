'use client'
import React, { useState, useEffect } from 'react';
import { useMessage, useAgendamentos, useViagens, useHorarios, useWhatsApp, useAuth } from '@/hooks';
import { Header, NavigationTabs, StatsCards } from '@/components/layout';
import { AgendamentoForm, ViagemForm } from '@/components/forms';
import { AgendamentoList, ViagemList } from '@/components/features';
import { Message } from '@/components/ui';
import { validarFormularioAgendamento, validarFormularioViagem } from '@/utils/validators';
import { obterHorarioCorte, ordenarAgendamentos } from '@/utils/formatters';
import { FormCadastro, FormViagem, TabType } from '@/types';

const SistemaAribeMotos: React.FC = () => {
  // Hooks customizados
  const { mensagem, mostrarMensagem } = useMessage();
  const { 
    agendamentos, 
    loading: loadingAgendamentos, 
    carregarAgendamentos, 
    salvarAgendamento, 
    atualizarStatusAgendamento, 
    excluirAgendamento 
  } = useAgendamentos();
  
  const { 
    viagens, 
    loading: loadingViagens, 
    carregarViagens, 
    salvarViagem, 
    atualizarStatusViagem, 
    excluirViagem 
  } = useViagens();
  
  const { horariosDisponiveis, dataSelecionada, setDataSelecionada } = useHorarios(agendamentos);
  const { abrirWhatsApp } = useWhatsApp();
  const { handleLogout } = useAuth();

  // Estado local
  const [activeTab, setActiveTab] = useState<TabType>('cadastro');
  const [formCadastro, setFormCadastro] = useState<FormCadastro>({
    nome: '',
    sobrenome: '',
    telefone: '',
    modeloMoto: '',
    cor: '',
    chassi: '',
    numeroPedido: '',
    dataRetirada: '',
    horarioRetirada: ''
  });

  const [formViagem, setFormViagem] = useState<FormViagem>({
    origem: '',
    origemOutros: '',
    destino: '',
    destinoOutros: '',
    modeloMoto: '',
    cor: '',
    chassi: '',
    numeroPedido: ''
  });

  // Carregar dados iniciais
  useEffect(() => {
    carregarAgendamentos();
    carregarViagens();
  }, [carregarAgendamentos, carregarViagens]);

  // Handlers para formulário de agendamento
  const handleFormCadastroChange = (field: keyof FormCadastro, value: string) => {
    setFormCadastro(prev => ({ ...prev, [field]: value }));
  };

  const handleDataChange = (data: string) => {
    setDataSelecionada(data);
    setFormCadastro(prev => ({ ...prev, dataRetirada: data, horarioRetirada: '' }));
  };

  const cadastrarAgendamento = async (): Promise<void> => {
    const validacao = validarFormularioAgendamento(formCadastro);
    if (!validacao.isValid) {
      validacao.errors.forEach(error => mostrarMensagem(error, 'erro'));
      return;
    }

    const novoAgendamento = {
      nomeCompleto: `${formCadastro.nome} ${formCadastro.sobrenome}`,
      telefone: formCadastro.telefone,
      modeloMoto: formCadastro.modeloMoto,
      cor: formCadastro.cor,
      chassi: formCadastro.chassi,
      numeroPedido: formCadastro.numeroPedido,
      dataRetirada: formCadastro.dataRetirada,
      horarioRetirada: formCadastro.horarioRetirada,
      status: 'pendente' as const
    };

    const resultado = await salvarAgendamento(novoAgendamento);
    
    if (resultado.success) {
      setFormCadastro({
        nome: '',
        sobrenome: '',
        telefone: '',
        modeloMoto: '',
        cor: '',
        chassi: '',
        numeroPedido: '',
        dataRetirada: '',
        horarioRetirada: ''
      });
      setDataSelecionada('');
      mostrarMensagem('Cliente cadastrado e agendamento criado com sucesso!');
    } else if (resultado.error === 'HORARIO_OCUPADO') {
      mostrarMensagem('Este horário acabou de ser reservado. Selecione outro horário.', 'erro');
    } else {
      mostrarMensagem(resultado.error || 'Erro ao cadastrar agendamento', 'erro');
    }
  };

  // Handlers para formulário de viagem
  const handleFormViagemChange = (field: keyof FormViagem, value: string) => {
    setFormViagem(prev => ({ ...prev, [field]: value }));
  };

  const cadastrarViagemHandler = async (): Promise<void> => {
    const validacao = validarFormularioViagem(formViagem);
    if (!validacao.isValid) {
      validacao.errors.forEach(error => mostrarMensagem(error, 'erro'));
      return;
    }

    const novaViagem = {
      origem: formViagem.origem === 'Outros' ? formViagem.origemOutros : formViagem.origem,
      destino: formViagem.destino === 'Outros' ? formViagem.destinoOutros : formViagem.destino,
      modeloMoto: formViagem.modeloMoto,
      cor: formViagem.cor,
      chassi: formViagem.chassi,
      numeroPedido: formViagem.numeroPedido,
      status: 'pendente' as const
    };

    const sucesso = await salvarViagem(novaViagem);
    
    if (sucesso) {
      setFormViagem({
        origem: '',
        origemOutros: '',
        destino: '',
        destinoOutros: '',
        modeloMoto: '',
        cor: '',
        chassi: '',
        numeroPedido: ''
      });
      mostrarMensagem('Viagem cadastrada com sucesso!');
    } else {
      mostrarMensagem('Erro ao cadastrar viagem. Tente novamente.', 'erro');
    }
  };

  // Handlers para ações
  const alterarStatusAgendamento = async (id: string, novoStatus: 'pendente' | 'entregue'): Promise<void> => {
    const sucesso = await atualizarStatusAgendamento(id, novoStatus);
    
    if (sucesso) {
      mostrarMensagem(
        novoStatus === 'entregue' 
          ? 'Entrega marcada como concluída!' 
          : 'Status alterado para pendente'
      );
    } else {
      mostrarMensagem('Erro ao atualizar status. Tente novamente.', 'erro');
    }
  };

  const alterarStatusViagemHandler = async (id: string, novoStatus: 'pendente' | 'concluida'): Promise<void> => {
    const sucesso = await atualizarStatusViagem(id, novoStatus);
    
    if (sucesso) {
      mostrarMensagem(
        novoStatus === 'concluida' 
          ? 'Viagem marcada como concluída!' 
          : 'Status alterado para pendente'
      );
    } else {
      mostrarMensagem('Erro ao atualizar status. Tente novamente.', 'erro');
    }
  };

  const excluirAgendamentoHandler = async (id: string): Promise<void> => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      const sucesso = await excluirAgendamento(id);
      
      if (sucesso) {
        mostrarMensagem('Agendamento excluído com sucesso!');
      } else {
        mostrarMensagem('Erro ao excluir agendamento. Tente novamente.', 'erro');
      }
    }
  };

  const excluirViagemHandler = async (id: string): Promise<void> => {
    if (window.confirm('Tem certeza que deseja excluir esta viagem?')) {
      const sucesso = await excluirViagem(id);
      
      if (sucesso) {
        mostrarMensagem('Viagem excluída com sucesso!');
      } else {
        mostrarMensagem('Erro ao excluir viagem. Tente novamente.', 'erro');
      }
    }
  };

  const abrirWhatsAppHandler = (agendamento: any): void => {
    abrirWhatsApp(
      agendamento.telefone,
      agendamento.nomeCompleto,
      agendamento.modeloMoto,
      agendamento.numeroPedido,
      'agendamento'
    );
  };

  const handleLogoutComMensagem = async (): Promise<void> => {
    const sucesso = await handleLogout();
    if (sucesso) {
      mostrarMensagem('Logout realizado com sucesso!');
    } else {
      mostrarMensagem('Erro ao fazer logout. Tente novamente.', 'erro');
    }
  };

  // Cálculos para estatísticas
  const agendamentosPendentes = agendamentos.filter(a => a.status === 'pendente').length;
  const agendamentosEntregues = agendamentos.filter(a => a.status === 'entregue').length;
  const viagensPendentes = viagens.filter(v => v.status === 'pendente').length;
  const viagensConcluidas = viagens.filter(v => v.status === 'concluida').length;

  const agendamentosOrdenados = ordenarAgendamentos(agendamentos);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Aribé Motos"
        subtitle="Sistema de Gestão Completo"
        onLogout={handleLogoutComMensagem}
      />

      {mensagem && (
        <Message 
          texto={mensagem.texto} 
          tipo={mensagem.tipo} 
          onClose={() => mostrarMensagem('', 'sucesso')}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <NavigationTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          agendamentosPendentes={agendamentosPendentes}
          viagensPendentes={viagensPendentes}
        />

        {activeTab === 'cadastro' && (
          <AgendamentoForm
            formData={formCadastro}
            horariosDisponiveis={horariosDisponiveis}
            dataSelecionada={dataSelecionada}
            loading={loadingAgendamentos}
            onChange={handleFormCadastroChange}
            onDataChange={handleDataChange}
            onSubmit={cadastrarAgendamento}
            onObterHorarioCorte={obterHorarioCorte}
            onObterNomeDiaSemana={(data) => new Date(data).toLocaleDateString('pt-BR', { weekday: 'long' })}
          />
        )}

        {activeTab === 'agendamentos' && (
          <>
            <StatsCards
              agendamentosPendentes={agendamentosPendentes}
              agendamentosEntregues={agendamentosEntregues}
              viagensPendentes={viagensPendentes}
              viagensConcluidas={viagensConcluidas}
              showViagens={false}
            />

            <AgendamentoList
              agendamentos={agendamentosOrdenados}
              loading={loadingAgendamentos}
              onStatusChange={alterarStatusAgendamento}
              onDelete={excluirAgendamentoHandler}
              onWhatsApp={abrirWhatsAppHandler}
            />
          </>
        )}

        {activeTab === 'viagens' && (
          <>
            <ViagemForm
              formData={formViagem}
              loading={loadingViagens}
              onChange={handleFormViagemChange}
              onSubmit={cadastrarViagemHandler}
            />

            <StatsCards
              agendamentosPendentes={agendamentosPendentes}
              agendamentosEntregues={agendamentosEntregues}
              viagensPendentes={viagensPendentes}
              viagensConcluidas={viagensConcluidas}
              showViagens={true}
            />

            <ViagemList
              viagens={viagens}
              loading={loadingViagens}
              onStatusChange={alterarStatusViagemHandler}
              onDelete={excluirViagemHandler}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default SistemaAribeMotos;