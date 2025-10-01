'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { User, Calendar, Phone, Bike, Palette, Hash, Clock, Check, X, Plus, MapPin, MessageCircle, FileText, LogOut, Truck } from 'lucide-react';
import { criarAgendamento, listarAgendamentos, atualizarStatus, excluirAgendamento } from '@/firebase/agendamentos';
import { criarViagem, listarViagens, atualizarStatusViagem as atualizarStatusViagemFirebase, excluirViagem as excluirViagemFirebase } from '@/firebase/viagens';
import { auth } from '@/firebase/config';

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

interface FormCadastro {
  nome: string;
  sobrenome: string;
  telefone: string;
  modeloMoto: string;
  cor: string;
  chassi: string;
  numeroPedido: string;
  dataRetirada: string;
  horarioRetirada: string;
}

interface FormViagem {
  origem: string;
  origemOutros: string;
  destino: string;
  destinoOutros: string;
  modeloMoto: string;
  cor: string;
  chassi: string;
  numeroPedido: string;
}

interface Mensagem {
  texto: string;
  tipo: 'sucesso' | 'erro';
}

interface StatusConfig {
  style: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

type TabType = 'cadastro' | 'agendamentos' | 'viagens';
type StatusType = 'pendente' | 'entregue';
type StatusViagemType = 'pendente' | 'concluida';

const SistemaAribeMotos: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('cadastro');
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [mensagem, setMensagem] = useState<Mensagem | null>(null);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [dataSelecionada, setDataSelecionada] = useState<string>('');

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

  const locaisDisponiveis = ['Aracaju', 'Socorro', 'Itabaiana', 'Outros'];

  const mostrarMensagem = useCallback((texto: string, tipo: 'sucesso' | 'erro' = 'sucesso'): void => {
    setMensagem({ texto, tipo });
    setTimeout(() => setMensagem(null), 4000);
  }, []);

  const carregarAgendamentos = useCallback(async () => {
    setLoadingData(true);
    try {
      const resultado = await listarAgendamentos();
      if (resultado.success && resultado.data) {
        setAgendamentos(resultado.data as Agendamento[]);
      } else {
        mostrarMensagem('Erro ao carregar agendamentos', 'erro');
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      mostrarMensagem('Erro ao carregar agendamentos', 'erro');
    } finally {
      setLoadingData(false);
    }
  }, [mostrarMensagem]);

  const carregarViagens = useCallback(async () => {
    try {
      const resultado = await listarViagens();
      if (resultado.success && resultado.data) {
        setViagens(resultado.data as Viagem[]);
      }
    } catch (error) {
      console.error('Erro ao carregar viagens:', error);
    }
  }, []);

  useEffect(() => {
    carregarAgendamentos();
    carregarViagens();
  }, [carregarAgendamentos, carregarViagens]);

  const salvarAgendamento = async (novoAgendamento: Omit<Agendamento, 'dataCadastro'>) => {
    try {
      const resultado = await criarAgendamento(novoAgendamento);
      if (resultado.success) {
        await carregarAgendamentos();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      return false;
    }
  };

  const atualizarStatusAgendamento = async (id: string, novoStatus: StatusType) => {
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
  };

  const deletarAgendamento = async (id: string) => {
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
  };

  const salvarViagem = async (novaViagem: Omit<Viagem, 'dataCadastro'>) => {
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
    }
  };

  const atualizarStatusViagem = async (id: string, novoStatus: StatusViagemType) => {
    try {
      const resultado = await atualizarStatusViagemFirebase(id, novoStatus);
      if (resultado.success) {
        await carregarViagens();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao atualizar status da viagem:', error);
      return false;
    }
  };

  const deletarViagem = async (id: string) => {
    try {
      const resultado = await excluirViagemFirebase(id);
      if (resultado.success) {
        await carregarViagens();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao excluir viagem:', error);
      return false;
    }
  };

  const verificarHorarioValido = (data: string, horario: string): boolean => {
    const agora = new Date();
    const [ano, mes, dia] = data.split('-').map(Number);
    const [hora, minuto] = horario.split(':').map(Number);
    const dataHorarioAgendamento = new Date(ano, mes - 1, dia, hora, minuto, 0);
    const diferencaHoras = (dataHorarioAgendamento.getTime() - agora.getTime()) / (1000 * 60 * 60);
    return diferencaHoras >= 6;
  };

  const gerarHorariosDisponiveis = useCallback((data: string): string[] => {
    const [ano, mes, dia] = data.split('-').map(Number);
    const dataObj = new Date(ano, mes - 1, dia);
    const diaSemana = dataObj.getDay();
    const horarios: string[] = [];

    if (diaSemana >= 1 && diaSemana <= 5) {
      for (let hora = 8; hora <= 12; hora++) {
        horarios.push(`${hora.toString().padStart(2, '0')}:00`);
        if (hora < 12) {
          horarios.push(`${hora.toString().padStart(2, '0')}:30`);
        }
      }
      horarios.push('13:00');
      
      for (let hora = 15; hora <= 16; hora++) {
        horarios.push(`${hora.toString().padStart(2, '0')}:00`);
        horarios.push(`${hora.toString().padStart(2, '0')}:30`);
      }
      horarios.push('17:00');
    } else if (diaSemana === 6) {
      for (let hora = 8; hora <= 10; hora++) {
        horarios.push(`${hora.toString().padStart(2, '0')}:00`);
        horarios.push(`${hora.toString().padStart(2, '0')}:30`);
      }
      horarios.push('11:00');
    }

    return horarios.filter(horario => verificarHorarioValido(data, horario));
  }, []);

  const obterHorariosOcupados = useCallback((data: string): string[] => {
    return agendamentos
      .filter(agendamento => agendamento.dataRetirada === data)
      .map(agendamento => agendamento.horarioRetirada);
  }, [agendamentos]);

  useEffect(() => {
    if (dataSelecionada) {
      const todosHorarios = gerarHorariosDisponiveis(dataSelecionada);
      const horariosOcupados = obterHorariosOcupados(dataSelecionada);
      const horariosLivres = todosHorarios.filter(horario => !horariosOcupados.includes(horario));
      setHorariosDisponiveis(horariosLivres);
      
      if (formCadastro.horarioRetirada && !horariosLivres.includes(formCadastro.horarioRetirada)) {
        setFormCadastro(prev => ({ ...prev, horarioRetirada: '' }));
      }
    } else {
      setHorariosDisponiveis([]);
    }
  }, [dataSelecionada, formCadastro.horarioRetirada, gerarHorariosDisponiveis, obterHorariosOcupados]);

  const validarFormulario = (): boolean => {
    const { nome, sobrenome, telefone, modeloMoto, cor, chassi, numeroPedido, dataRetirada, horarioRetirada } = formCadastro;
    
    if (!nome.trim()) {
      mostrarMensagem('Nome é obrigatório', 'erro');
      return false;
    }
    if (!sobrenome.trim()) {
      mostrarMensagem('Sobrenome é obrigatório', 'erro');
      return false;
    }
    if (!telefone.trim()) {
      mostrarMensagem('Telefone é obrigatório', 'erro');
      return false;
    }
    if (!modeloMoto.trim()) {
      mostrarMensagem('Modelo da moto é obrigatório', 'erro');
      return false;
    }
    if (!cor.trim()) {
      mostrarMensagem('Cor é obrigatória', 'erro');
      return false;
    }
    if (!chassi.trim()) {
      mostrarMensagem('Chassi é obrigatório', 'erro');
      return false;
    }
    if (!numeroPedido.trim()) {
      mostrarMensagem('Número do pedido é obrigatório', 'erro');
      return false;
    }
    if (!dataRetirada) {
      mostrarMensagem('Data de retirada é obrigatória', 'erro');
      return false;
    }
    if (!horarioRetirada) {
      mostrarMensagem('Horário de retirada é obrigatório', 'erro');
      return false;
    }

    const [ano, mes, dia] = dataRetirada.split('-').map(Number);
    const dataAgendamento = new Date(ano, mes - 1, dia);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    dataAgendamento.setHours(0, 0, 0, 0);
    
    if (dataAgendamento < hoje) {
      mostrarMensagem('A data de retirada deve ser hoje ou no futuro', 'erro');
      return false;
    }

    const diaSemana = dataAgendamento.getDay();
    if (diaSemana === 0) {
      mostrarMensagem('Não trabalhamos aos domingos. Selecione outro dia.', 'erro');
      return false;
    }

    if (!verificarHorarioValido(dataRetirada, horarioRetirada)) {
      mostrarMensagem('O agendamento deve ser feito com pelo menos 6 horas de antecedência', 'erro');
      return false;
    }

    return true;
  };

  const validarFormularioViagem = (): boolean => {
    const { origem, origemOutros, destino, destinoOutros, modeloMoto, cor, chassi, numeroPedido } = formViagem;
    
    if (!origem) {
      mostrarMensagem('Origem é obrigatória', 'erro');
      return false;
    }
    if (origem === 'Outros' && !origemOutros.trim()) {
      mostrarMensagem('Especifique a origem', 'erro');
      return false;
    }
    if (!destino) {
      mostrarMensagem('Destino é obrigatório', 'erro');
      return false;
    }
    if (destino === 'Outros' && !destinoOutros.trim()) {
      mostrarMensagem('Especifique o destino', 'erro');
      return false;
    }
    if (!modeloMoto.trim()) {
      mostrarMensagem('Modelo da moto é obrigatório', 'erro');
      return false;
    }
    if (!cor.trim()) {
      mostrarMensagem('Cor é obrigatória', 'erro');
      return false;
    }
    if (!chassi.trim()) {
      mostrarMensagem('Chassi é obrigatório', 'erro');
      return false;
    }
    if (!numeroPedido.trim()) {
      mostrarMensagem('Número do pedido é obrigatório', 'erro');
      return false;
    }

    return true;
  };

  const cadastrarCliente = async (): Promise<void> => {
    if (!validarFormulario()) return;
    
    setLoading(true);

    const novoAgendamento: Omit<Agendamento, 'dataCadastro'> = {
      id: Date.now().toString(),
      nomeCompleto: `${formCadastro.nome} ${formCadastro.sobrenome}`,
      telefone: formCadastro.telefone,
      modeloMoto: formCadastro.modeloMoto,
      cor: formCadastro.cor,
      chassi: formCadastro.chassi,
      numeroPedido: formCadastro.numeroPedido,
      dataRetirada: formCadastro.dataRetirada,
      horarioRetirada: formCadastro.horarioRetirada,
      status: 'pendente'
    };

    const sucesso = await salvarAgendamento(novoAgendamento);
    
    if (sucesso) {
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
    } else {
      mostrarMensagem('Erro ao cadastrar cliente. Tente novamente.', 'erro');
    }
    
    setLoading(false);
  };

  const cadastrarViagem = async (): Promise<void> => {
    if (!validarFormularioViagem()) return;
    
    setLoading(true);

    const novaViagem: Omit<Viagem, 'dataCadastro'> = {
      id: Date.now().toString(),
      origem: formViagem.origem === 'Outros' ? formViagem.origemOutros : formViagem.origem,
      destino: formViagem.destino === 'Outros' ? formViagem.destinoOutros : formViagem.destino,
      modeloMoto: formViagem.modeloMoto,
      cor: formViagem.cor,
      chassi: formViagem.chassi,
      numeroPedido: formViagem.numeroPedido,
      status: 'pendente'
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
    
    setLoading(false);
  };

  const alterarStatus = async (id: string, novoStatus: StatusType): Promise<void> => {
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

  const alterarStatusViagem = async (id: string, novoStatus: StatusViagemType): Promise<void> => {
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

  const abrirWhatsApp = (telefone: string, nomeCompleto: string, modeloMoto: string, numeroPedido: string): void => {
    const telefoneLimpo = telefone.replace(/\D/g, '');
    let numeroFormatado = telefoneLimpo;
    
    if (!numeroFormatado.startsWith('55')) {
      numeroFormatado = '55' + numeroFormatado;
    }

    const mensagem = `Olá ${nomeCompleto}! Sua moto ${modeloMoto} (Pedido: ${numeroPedido}) está pronta para retirada. Entre em contato para combinarmos o melhor horário. Obrigado por escolher a Aribé Motos!`;
    const mensagemCodificada = encodeURIComponent(mensagem);
    const linkWhatsApp = `https://wa.me/${numeroFormatado}?text=${mensagemCodificada}`;
    
    window.open(linkWhatsApp, '_blank');
  };

  const excluirAgendamentoHandler = async (id: string): Promise<void> => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      const sucesso = await deletarAgendamento(id);
      
      if (sucesso) {
        mostrarMensagem('Agendamento excluído com sucesso!');
      } else {
        mostrarMensagem('Erro ao excluir agendamento. Tente novamente.', 'erro');
      }
    }
  };

  const excluirViagemHandler = async (id: string): Promise<void> => {
    if (window.confirm('Tem certeza que deseja excluir esta viagem?')) {
      const sucesso = await deletarViagem(id);
      
      if (sucesso) {
        mostrarMensagem('Viagem excluída com sucesso!');
      } else {
        mostrarMensagem('Erro ao excluir viagem. Tente novamente.', 'erro');
      }
    }
  };

  const formatarTelefone = (telefone: string): string => {
    const cleaned = telefone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return telefone;
  };

  const formatarData = (data: string): string => {
    const [ano, mes, dia] = data.split('-').map(Number);
    const dataObj = new Date(ano, mes - 1, dia);
    return dataObj.toLocaleDateString('pt-BR');
  };

  const obterNomeDiaSemana = (data: string): string => {
    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const [ano, mes, dia] = data.split('-').map(Number);
    const dataObj = new Date(ano, mes - 1, dia);
    return dias[dataObj.getDay()];
  };

  const getStatusBadge = (status: StatusType): React.ReactElement => {
    const config: Record<StatusType, StatusConfig> = {
      pendente: {
        style: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
        label: 'Pendente',
        icon: Clock
      },
      entregue: {
        style: 'bg-green-100 text-green-800 border border-green-200',
        label: 'Entregue',
        icon: Check
      }
    };

    const statusValido = (status === 'pendente' || status === 'entregue') ? status : 'pendente';
    const { style, label, icon: Icon } = config[statusValido];

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${style}`}>
        <Icon size={12} />
        {label}
      </span>
    );
  };

  const getStatusBadgeViagem = (status: StatusViagemType): React.ReactElement => {
    const config = {
      pendente: {
        style: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
        label: 'Pendente',
        icon: Clock
      },
      concluida: {
        style: 'bg-green-100 text-green-800 border border-green-200',
        label: 'Concluída',
        icon: Check
      }
    };

    const { style, label, icon: Icon } = config[status];

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${style}`}>
        <Icon size={12} />
        {label}
      </span>
    );
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await auth.signOut();
      mostrarMensagem('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      mostrarMensagem('Erro ao fazer logout. Tente novamente.', 'erro');
    }
  };

  const agendamentosOrdenados = [...agendamentos].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === 'pendente' ? -1 : 1;
    }
    
    const [anoA, mesA, diaA] = a.dataRetirada.split('-').map(Number);
    const [horaA, minutoA] = a.horarioRetirada.split(':').map(Number);
    const dataA = new Date(anoA, mesA - 1, diaA, horaA, minutoA);
    
    const [anoB, mesB, diaB] = b.dataRetirada.split('-').map(Number);
    const [horaB, minutoB] = b.horarioRetirada.split(':').map(Number);
    const dataB = new Date(anoB, mesB - 1, diaB, horaB, minutoB);
    
    return dataA.getTime() - dataB.getTime();
  });

  const viagensOrdenadas = [...viagens].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === 'pendente' ? -1 : 1;
    }
    return new Date(b.dataCadastro).getTime() - new Date(a.dataCadastro).getTime();
  });

  const agendamentosPendentes = agendamentos.filter(a => a.status === 'pendente').length;
  const agendamentosEntregues = agendamentos.filter(a => a.status === 'entregue').length;
  const viagensPendentes = viagens.filter(v => v.status === 'pendente').length;
  const viagensConcluidas = viagens.filter(v => v.status === 'concluida').length;

  const dataMinima = new Date().toISOString().split('T')[0];

  const obterHorarioCorte = (): string => {
    const agora = new Date();
    const corte = new Date(agora.getTime() + 6 * 60 * 60 * 1000);
    return corte.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleInputChange = (field: keyof FormCadastro) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    setFormCadastro(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleViagemInputChange = (field: keyof FormViagem) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    setFormViagem(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleDataChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setDataSelecionada(e.target.value);
    setFormCadastro(prev => ({ ...prev, dataRetirada: e.target.value, horarioRetirada: '' }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-red-600 to-red-700 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <Bike className="text-red-600" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Aribé Motos</h1>
                <p className="text-red-100 text-sm">Sistema de Gestão Completo</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right text-white">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={16} />
                  <span className="text-sm">Aracaju, SE</span>
                </div>
                <div className="text-xs opacity-90">
                  {agendamentosPendentes} agendamentos | {viagensPendentes} viagens
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors backdrop-blur-sm border border-white/20"
                title="Sair do sistema"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {mensagem && (
        <div className="max-w-6xl mx-auto px-4 mt-4">
          <div
            className={`p-4 rounded-lg shadow-md flex items-center gap-3 ${
              mensagem.tipo === 'sucesso'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {mensagem.tipo === 'sucesso' ? (
              <Check size={20} className="flex-shrink-0" />
            ) : (
              <X size={20} className="flex-shrink-0" />
            )}
            <span className="font-medium">{mensagem.texto}</span>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('cadastro')}
              className={`flex-1 px-6 py-4 font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'cadastro'
                  ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Plus size={18} />
              Novo Agendamento
            </button>
            <button
              onClick={() => setActiveTab('agendamentos')}
              className={`flex-1 px-6 py-4 font-medium text-sm flex items-center justify-center gap-2 transition-colors relative ${
                activeTab === 'agendamentos'
                  ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileText size={18} />
              Agendamentos
              {agendamentosPendentes > 0 && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {agendamentosPendentes}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('viagens')}
              className={`flex-1 px-6 py-4 font-medium text-sm flex items-center justify-center gap-2 transition-colors relative ${
                activeTab === 'viagens'
                  ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Truck size={18} />
              Viagens
              {viagensPendentes > 0 && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {viagensPendentes}
                </span>
              )}
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'cadastro' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                  <Clock className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Importante: Agendamento Antecipado</p>
                    <p>Os agendamentos devem ser feitos com pelo menos 6 horas de antecedência.</p>
                    <p className="mt-1 text-xs">Horário de corte atual: {obterHorarioCorte()}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <User size={16} />
                      Nome
                    </label>
                    <input
                      type="text"
                      value={formCadastro.nome}
                      onChange={handleInputChange('nome')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Digite o nome"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <User size={16} />
                      Sobrenome
                    </label>
                    <input
                      type="text"
                      value={formCadastro.sobrenome}
                      onChange={handleInputChange('sobrenome')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Digite o sobrenome"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Phone size={16} />
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={formCadastro.telefone}
                      onChange={handleInputChange('telefone')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Bike size={16} />
                      Modelo da Moto
                    </label>
                    <input
                      type="text"
                      value={formCadastro.modeloMoto}
                      onChange={handleInputChange('modeloMoto')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Ex: Honda CG 160"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Palette size={16} />
                      Cor
                    </label>
                    <input
                      type="text"
                      value={formCadastro.cor}
                      onChange={handleInputChange('cor')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Ex: Vermelha"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Hash size={16} />
                      Chassi
                    </label>
                    <input
                      type="text"
                      value={formCadastro.chassi}
                      onChange={handleInputChange('chassi')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Digite o chassi"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <FileText size={16} />
                      Número do Pedido
                    </label>
                    <input
                      type="text"
                      value={formCadastro.numeroPedido}
                      onChange={handleInputChange('numeroPedido')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Digite o número do pedido"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Calendar size={16} />
                      Data de Retirada
                    </label>
                    <input
                      type="date"
                      value={dataSelecionada}
                      onChange={handleDataChange}
                      min={dataMinima}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                    {dataSelecionada && (
                      <p className="text-xs text-gray-600 mt-1">
                        {obterNomeDiaSemana(dataSelecionada)} - {formatarData(dataSelecionada)}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Clock size={16} />
                      Horário de Retirada
                    </label>
                    <select
                      value={formCadastro.horarioRetirada}
                      onChange={handleInputChange('horarioRetirada')}
                      disabled={!dataSelecionada || horariosDisponiveis.length === 0}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {!dataSelecionada
                          ? 'Selecione uma data primeiro'
                          : horariosDisponiveis.length === 0
                          ? 'Nenhum horário disponível'
                          : 'Selecione um horário'}
                      </option>
                      {horariosDisponiveis.map((horario) => (
                        <option key={horario} value={horario}>
                          {horario}
                        </option>
                      ))}
                    </select>
                    {dataSelecionada && horariosDisponiveis.length === 0 && (
                      <p className="text-xs text-red-600 mt-1">
                        Todos os horários estão ocupados ou fora do prazo mínimo
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={cadastrarCliente}
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processando...
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      Cadastrar Agendamento
                    </>
                  )}
                </button>
              </div>
            )}

            {activeTab === 'agendamentos' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    Agendamentos ({agendamentos.length})
                  </h2>
                  <div className="flex gap-2 text-sm">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                      {agendamentosPendentes} Pendentes
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                      {agendamentosEntregues} Entregues
                    </span>
                  </div>
                </div>

                {loadingData ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                  </div>
                ) : agendamentos.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FileText size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Nenhum agendamento cadastrado</p>
                    <p className="text-sm">Cadastre o primeiro agendamento na aba Novo Agendamento</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {agendamentosOrdenados.map((agendamento) => (
                      <div
                        key={agendamento.id}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 text-lg mb-1">
                              {agendamento.nomeCompleto}
                            </h3>
                            <p className="text-sm text-gray-600">{formatarTelefone(agendamento.telefone)}</p>
                          </div>
                          {getStatusBadge(agendamento.status)}
                        </div>

                        <div className="grid md:grid-cols-2 gap-3 mb-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Bike size={16} className="text-red-600" />
                            <span>
                              <strong>Moto:</strong> {agendamento.modeloMoto} - {agendamento.cor}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <Hash size={16} className="text-red-600" />
                            <span>
                              <strong>Chassi:</strong> {agendamento.chassi}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <FileText size={16} className="text-red-600" />
                            <span>
                              <strong>Pedido:</strong> {agendamento.numeroPedido}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <Calendar size={16} className="text-red-600" />
                            <span>
                              <strong>Retirada:</strong> {formatarData(agendamento.dataRetirada)} às{' '}
                              {agendamento.horarioRetirada}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() =>
                              alterarStatus(
                                agendamento.id,
                                agendamento.status === 'pendente' ? 'entregue' : 'pendente'
                              )
                            }
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              agendamento.status === 'pendente'
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                            }`}
                          >
                            {agendamento.status === 'pendente' ? (
                              <>
                                <Check size={16} />
                                Marcar como Entregue
                              </>
                            ) : (
                              <>
                                <Clock size={16} />
                                Marcar como Pendente
                              </>
                            )}
                          </button>

                          <button
                            onClick={() =>
                              abrirWhatsApp(
                                agendamento.telefone,
                                agendamento.nomeCompleto,
                                agendamento.modeloMoto,
                                agendamento.numeroPedido
                              )
                            }
                            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            <MessageCircle size={16} />
                            WhatsApp
                          </button>

                          <button
                            onClick={() => excluirAgendamentoHandler(agendamento.id)}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            <X size={16} />
                            Excluir
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'viagens' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Nova Viagem</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <MapPin size={16} />
                        Origem
                      </label>
                      <select
                        value={formViagem.origem}
                        onChange={handleViagemInputChange('origem')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="">Selecione a origem</option>
                        {locaisDisponiveis.map((local) => (
                          <option key={local} value={local}>
                            {local}
                          </option>
                        ))}
                      </select>
                    </div>

                    {formViagem.origem === 'Outros' && (
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <MapPin size={16} />
                          Especifique a Origem
                        </label>
                        <input
                          type="text"
                          value={formViagem.origemOutros}
                          onChange={handleViagemInputChange('origemOutros')}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Digite a origem"
                        />
                      </div>
                    )}

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <MapPin size={16} />
                        Destino
                      </label>
                      <select
                        value={formViagem.destino}
                        onChange={handleViagemInputChange('destino')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="">Selecione o destino</option>
                        {locaisDisponiveis.map((local) => (
                          <option key={local} value={local}>
                            {local}
                          </option>
                        ))}
                      </select>
                    </div>

                    {formViagem.destino === 'Outros' && (
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <MapPin size={16} />
                          Especifique o Destino
                        </label>
                        <input
                          type="text"
                          value={formViagem.destinoOutros}
                          onChange={handleViagemInputChange('destinoOutros')}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Digite o destino"
                        />
                      </div>
                    )}

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Bike size={16} />
                        Modelo da Moto
                      </label>
                      <input
                        type="text"
                        value={formViagem.modeloMoto}
                        onChange={handleViagemInputChange('modeloMoto')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Ex: Honda CG 160"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Palette size={16} />
                        Cor
                      </label>
                      <input
                        type="text"
                        value={formViagem.cor}
                        onChange={handleViagemInputChange('cor')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Ex: Vermelha"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Hash size={16} />
                        Chassi
                      </label>
                      <input
                        type="text"
                        value={formViagem.chassi}
                        onChange={handleViagemInputChange('chassi')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Digite o chassi"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <FileText size={16} />
                        Número do Pedido
                      </label>
                      <input
                        type="text"
                        value={formViagem.numeroPedido}
                        onChange={handleViagemInputChange('numeroPedido')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Digite o número do pedido"
                      />
                    </div>
                  </div>

                  <button
                    onClick={cadastrarViagem}
                    disabled={loading}
                    className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processando...
                      </>
                    ) : (
                      <>
                        <Plus size={20} />
                        Cadastrar Viagem
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">Viagens ({viagens.length})</h2>
                    <div className="flex gap-2 text-sm">
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                        {viagensPendentes} Pendentes
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                        {viagensConcluidas} Concluídas
                      </span>
                    </div>
                  </div>

                  {viagens.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Truck size={48} className="mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Nenhuma viagem cadastrada</p>
                      <p className="text-sm">Cadastre a primeira viagem acima</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {viagensOrdenadas.map((viagem) => (
                        <div
                          key={viagem.id}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 text-lg mb-1">
                                {viagem.origem} → {viagem.destino}
                              </h3>
                            </div>
                            {getStatusBadgeViagem(viagem.status)}
                          </div>

                          <div className="grid md:grid-cols-2 gap-3 mb-3 text-sm">
                            <div className="flex items-center gap-2 text-gray-700">
                              <Bike size={16} className="text-red-600" />
                              <span>
                                <strong>Moto:</strong> {viagem.modeloMoto} - {viagem.cor}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                              <Hash size={16} className="text-red-600" />
                              <span>
                                <strong>Chassi:</strong> {viagem.chassi}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                              <FileText size={16} className="text-red-600" />
                              <span>
                                <strong>Pedido:</strong> {viagem.numeroPedido}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() =>
                                alterarStatusViagem(
                                  viagem.id,
                                  viagem.status === 'pendente' ? 'concluida' : 'pendente'
                                )
                              }
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                viagem.status === 'pendente'
                                  ? 'bg-green-600 hover:bg-green-700 text-white'
                                  : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                              }`}
                            >
                              {viagem.status === 'pendente' ? (
                                <>
                                  <Check size={16} />
                                  Marcar como Concluída
                                </>
                              ) : (
                                <>
                                  <Clock size={16} />
                                  Marcar como Pendente
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => excluirViagemHandler(viagem.id)}
                              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              <X size={16} />
                              Excluir
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SistemaAribeMotos;