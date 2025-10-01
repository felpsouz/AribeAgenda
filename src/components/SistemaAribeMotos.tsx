'use client'
import React, { useState, useEffect } from 'react';
import { User, Calendar, Phone, Bike, Palette, Hash, Clock, Check, X, Plus, MapPin, MessageCircle, FileText, LogOut, Truck } from 'lucide-react';
import { criarAgendamento, listarAgendamentos, atualizarStatus, excluirAgendamento } from '@/firebase/agendamentos';
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

  const carregarAgendamentos = async () => {
    setLoadingData(true);
    try {
      const resultado = await listarAgendamentos();
      if (resultado.success && resultado.data) {
        setAgendamentos(resultado.data);
      } else {
        mostrarMensagem('Erro ao carregar agendamentos', 'erro');
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      mostrarMensagem('Erro ao carregar agendamentos', 'erro');
    } finally {
      setLoadingData(false);
    }
  };

  const carregarViagens = () => {
    const viagensSalvas = localStorage.getItem('viagens');
    if (viagensSalvas) {
      setViagens(JSON.parse(viagensSalvas));
    }
  };

  const salvarViagensStorage = (novasViagens: Viagem[]) => {
    localStorage.setItem('viagens', JSON.stringify(novasViagens));
    setViagens(novasViagens);
  };

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

  const criarViagem = (novaViagem: Omit<Viagem, 'dataCadastro'>) => {
    const viagemComData: Viagem = {
      ...novaViagem,
      dataCadastro: new Date().toISOString()
    };
    const novasViagens = [...viagens, viagemComData];
    salvarViagensStorage(novasViagens);
    return true;
  };

  const atualizarStatusViagem = (id: string, novoStatus: StatusViagemType) => {
    const novasViagens = viagens.map(v => 
      v.id === id ? { ...v, status: novoStatus } : v
    );
    salvarViagensStorage(novasViagens);
    return true;
  };

  const excluirViagem = (id: string) => {
    const novasViagens = viagens.filter(v => v.id !== id);
    salvarViagensStorage(novasViagens);
    return true;
  };

  useEffect(() => {
    carregarAgendamentos();
    carregarViagens();
  }, []);

  const verificarHorarioValido = (data: string, horario: string): boolean => {
    const agora = new Date();
    const [ano, mes, dia] = data.split('-').map(Number);
    const [hora, minuto] = horario.split(':').map(Number);
    const dataHorarioAgendamento = new Date(ano, mes - 1, dia, hora, minuto, 0);
    const diferencaHoras = (dataHorarioAgendamento.getTime() - agora.getTime()) / (1000 * 60 * 60);
    return diferencaHoras >= 6;
  };

  const gerarHorariosDisponiveis = (data: string): string[] => {
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
  };

  const obterHorariosOcupados = (data: string): string[] => {
    return agendamentos
      .filter(agendamento => agendamento.dataRetirada === data)
      .map(agendamento => agendamento.horarioRetirada);
  };

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
  }, [dataSelecionada, agendamentos, formCadastro.horarioRetirada]);

  const mostrarMensagem = (texto: string, tipo: 'sucesso' | 'erro' = 'sucesso'): void => {
    setMensagem({ texto, tipo });
    setTimeout(() => setMensagem(null), 4000);
  };

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

  const cadastrarViagem = (): void => {
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

    const sucesso = criarViagem(novaViagem);
    
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

  const alterarStatusViagem = (id: string, novoStatus: StatusViagemType): void => {
    const sucesso = atualizarStatusViagem(id, novoStatus);
    
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

  const excluirViagemHandler = (id: string): void => {
    if (window.confirm('Tem certeza que deseja excluir esta viagem?')) {
      const sucesso = excluirViagem(id);
      
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
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className={`p-4 rounded-lg shadow-lg border ${
            mensagem.tipo === 'erro' 
              ? 'bg-red-50 border-red-200 text-red-700' 
              : 'bg-green-50 border-green-200 text-green-700'
          }`}>
            <div className="flex items-center gap-2">
              {mensagem.tipo === 'erro' ? <X size={16} /> : <Check size={16} />}
              {mensagem.texto}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-4">
        <nav className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setActiveTab('cadastro')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'cadastro'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Plus size={18} />
            Novo Agendamento
          </button>
          <button
            onClick={() => setActiveTab('agendamentos')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'agendamentos'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Calendar size={18} />
            Agendamentos ({agendamentosPendentes})
          </button>
          <button
            onClick={() => setActiveTab('viagens')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'viagens'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Truck size={18} />
            Viagens ({viagensPendentes})
          </button>
        </nav>

        {activeTab === 'cadastro' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Novo Agendamento de Retirada</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
                  <p className="text-xs text-gray-500 mt-1">
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
                  disabled={!dataSelecionada}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Selecione o horário</option>
                  {horariosDisponiveis.map(horario => (
                    <option key={horario} value={horario}>
                      {horario}
                    </option>
                  ))}
                </select>
                {dataSelecionada && horariosDisponiveis.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    Nenhum horário disponível para esta data
                  </p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Atenção:</strong> Agendamentos devem ser feitos com pelo menos 6 horas de antecedência.
                Horário limite para agendamento: {obterHorarioCorte()}
              </p>
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
                  <Plus size={18} />
                  Cadastrar Agendamento
                </>
              )}
            </button>
          </div>
        )}

        {activeTab === 'agendamentos' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pendentes</p>
                    <p className="text-3xl font-bold text-yellow-600">{agendamentosPendentes}</p>
                  </div>
                  <Clock className="text-yellow-600" size={40} />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Entregues</p>
                    <p className="text-3xl font-bold text-green-600">{agendamentosEntregues}</p>
                  </div>
                  <Check className="text-green-600" size={40} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">Lista de Agendamentos</h2>
              </div>
              
              {loadingData ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Carregando agendamentos...</p>
                </div>
              ) : agendamentosOrdenados.length === 0 ? (
                <div className="p-12 text-center">
                  <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600">Nenhum agendamento cadastrado</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {agendamentosOrdenados.map((agendamento) => (
                    <div key={agendamento.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold text-gray-800">
                              {agendamento.nomeCompleto}
                            </h3>
                            {getStatusBadge(agendamento.status)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Phone size={14} />
                              {formatarTelefone(agendamento.telefone)}
                            </div>
                            <div className="flex items-center gap-2">
                              <Bike size={14} />
                              {agendamento.modeloMoto}
                            </div>
                            <div className="flex items-center gap-2">
                              <Palette size={14} />
                              {agendamento.cor}
                            </div>
                            <div className="flex items-center gap-2">
                              <Hash size={14} />
                              Chassi: {agendamento.chassi}
                            </div>
                            <div className="flex items-center gap-2">
                              <FileText size={14} />
                              Pedido: {agendamento.numeroPedido}
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar size={14} />
                              {formatarData(agendamento.dataRetirada)} às {agendamento.horarioRetirada}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => abrirWhatsApp(
                              agendamento.telefone,
                              agendamento.nomeCompleto,
                              agendamento.modeloMoto,
                              agendamento.numeroPedido
                            )}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                            title="Enviar mensagem no WhatsApp"
                          >
                            <MessageCircle size={16} />
                            WhatsApp
                          </button>
                          
                          {agendamento.status === 'pendente' ? (
                            <button
                              onClick={() => alterarStatus(agendamento.id, 'entregue')}
                              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                              title="Marcar como entregue"
                            >
                              <Check size={16} />
                              Entregar
                            </button>
                          ) : (
                            <button
                              onClick={() => alterarStatus(agendamento.id, 'pendente')}
                              className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                              title="Marcar como pendente"
                            >
                              <Clock size={16} />
                              Pendente
                            </button>
                          )}
                          
                          <button
                            onClick={() => excluirAgendamentoHandler(agendamento.id)}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                            title="Excluir agendamento"
                          >
                            <X size={16} />
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'viagens' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pendentes</p>
                    <p className="text-3xl font-bold text-yellow-600">{viagensPendentes}</p>
                  </div>
                  <Clock className="text-yellow-600" size={40} />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Concluídas</p>
                    <p className="text-3xl font-bold text-green-600">{viagensConcluidas}</p>
                  </div>
                  <Check className="text-green-600" size={40} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Cadastrar Nova Viagem</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
                    {locaisDisponiveis.map(local => (
                      <option key={local} value={local}>{local}</option>
                    ))}
                  </select>
                </div>

                {formViagem.origem === 'Outros' && (
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <MapPin size={16} />
                      Especificar Origem
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
                    {locaisDisponiveis.map(local => (
                      <option key={local} value={local}>{local}</option>
                    ))}
                  </select>
                </div>

                {formViagem.destino === 'Outros' && (
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <MapPin size={16} />
                      Especificar Destino
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
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    Cadastrar Viagem
                  </>
                )}
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">Lista de Viagens</h2>
              </div>
              
              {viagensOrdenadas.length === 0 ? (
                <div className="p-12 text-center">
                  <Truck className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600">Nenhuma viagem cadastrada</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {viagensOrdenadas.map((viagem) => (
                    <div key={viagem.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold text-gray-800">
                              {viagem.origem} → {viagem.destino}
                            </h3>
                            {getStatusBadgeViagem(viagem.status)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Bike size={14} />
                              {viagem.modeloMoto}
                            </div>
                            <div className="flex items-center gap-2">
                              <Palette size={14} />
                              {viagem.cor}
                            </div>
                            <div className="flex items-center gap-2">
                              <Hash size={14} />
                              Chassi: {viagem.chassi}
                            </div>
                            <div className="flex items-center gap-2">
                              <FileText size={14} />
                              Pedido: {viagem.numeroPedido}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {viagem.status === 'pendente' ? (
                            <button
                              onClick={() => alterarStatusViagem(viagem.id, 'concluida')}
                              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                              title="Marcar como concluída"
                            >
                              <Check size={16} />
                              Concluir
                            </button>
                          ) : (
                            <button
                              onClick={() => alterarStatusViagem(viagem.id, 'pendente')}
                              className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                              title="Marcar como pendente"
                            >
                              <Clock size={16} />
                              Pendente
                            </button>
                          )}
                          
                          <button
                            onClick={() => excluirViagemHandler(viagem.id)}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                            title="Excluir viagem"
                          >
                            <X size={16} />
                            Excluir
                          </button>
                        </div>
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
  );
};

export default SistemaAribeMotos;