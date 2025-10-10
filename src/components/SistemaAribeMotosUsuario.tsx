'use client'
import React, { useState, useEffect } from 'react';
import { useMessage, useAgendamentos, useHorarios, useWhatsApp, useAuth } from '@/hooks';
import { Header, NavigationTabs } from '@/components/layout';
import { AgendamentoForm } from '@/components/forms';
import { AgendamentoList } from '@/components/features';
import { Message } from '@/components/ui';
import { validarFormularioAgendamento } from '@/utils/validators';
import { obterHorarioCorte, ordenarAgendamentos } from '@/utils/formatters';
import { FormCadastro, TabType } from '@/types';

const SistemaAribeMotosUsuario: React.FC = () => {
  // Hooks customizados
  const { mensagem, mostrarMensagem } = useMessage();
  const { 
    agendamentos, 
    loading: loadingAgendamentos, 
    carregarAgendamentos, 
    salvarAgendamento 
  } = useAgendamentos();
  
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

  // Carregar dados iniciais
  useEffect(() => {
    carregarAgendamentos();
  }, [carregarAgendamentos]);

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
      mostrarMensagem('Agendamento criado com sucesso!');
    } else if (resultado.error === 'HORARIO_OCUPADO') {
      mostrarMensagem('Este horário acabou de ser reservado. Selecione outro horário.', 'erro');
    } else {
      mostrarMensagem(resultado.error || 'Erro ao criar agendamento', 'erro');
    }
  };

  // Handlers para ações
  const abrirWhatsAppHandler = (agendamento: any): void => {
    abrirWhatsApp(
      agendamento.telefone,
      agendamento.nomeCompleto,
      agendamento.modeloMoto,
      agendamento.numeroPedido,
      'consulta'
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
  const agendamentosOrdenados = ordenarAgendamentos(agendamentos);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Aribé Motos"
        subtitle="Agendamento de Retirada de Motos"
        onLogout={handleLogoutComMensagem}
        stats={{
          pendentes: agendamentosPendentes,
          concluidos: agendamentosEntregues
        }}
      />

      {mensagem && (
        <Message 
          texto={mensagem.texto} 
          tipo={mensagem.tipo} 
          onClose={() => mostrarMensagem('', 'sucesso')}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 py-4">
        <NavigationTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          agendamentosPendentes={agendamentosPendentes}
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
          <AgendamentoList
            agendamentos={agendamentosOrdenados}
            loading={loadingAgendamentos}
            onStatusChange={() => {}} // Usuário não pode alterar status
            onDelete={() => {}} // Usuário não pode excluir
            onWhatsApp={abrirWhatsAppHandler}
            modoUsuario={true}
          />
        )}
      </div>
    </div>
  );
};

export default SistemaAribeMotosUsuario;