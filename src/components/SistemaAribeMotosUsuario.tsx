'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { User, Calendar, Phone, Bike, Palette, Hash, Clock, Check, Plus, MapPin, MessageCircle, FileText, LogOut } from 'lucide-react';
import { criarAgendamento, listarAgendamentos } from '@/firebase/agendamentos';
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

interface Mensagem {
  texto: string;
  tipo: 'sucesso' | 'erro';
}

interface StatusConfig {
  style: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

type TabType = 'cadastro' | 'agendamentos';
type StatusType = 'pendente' | 'entregue';

const SistemaAribeMotosUsuario: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('cadastro');
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
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

  const salvarAgendamento = async (novoAgendamento: Omit<Agendamento, 'id' | 'dataCadastro'>) => {
    try {
      const resultado = await criarAgendamento(novoAgendamento);
      
      if (resultado.success) {
        await carregarAgendamentos();
        return true;
      }
      
      // Tratamento específico para horário ocupado
      if (resultado.error === 'HORARIO_OCUPADO') {
        mostrarMensagem('Este horário acabou de ser reservado por outro cliente. Por favor, selecione outro horário.', 'erro');
        
        // Atualiza os agendamentos para refletir a mudança
        await carregarAgendamentos();
        
        // Força atualização dos horários disponíveis
        if (dataSelecionada) {
          const todosHorarios = gerarHorariosDisponiveis(dataSelecionada);
          const horariosOcupados = obterHorariosOcupados(dataSelecionada);
          const horariosLivres = todosHorarios.filter(horario => !horariosOcupados.includes(horario));
          setHorariosDisponiveis(horariosLivres);
          
          // Limpa o horário selecionado se ele não estiver mais disponível
          if (formCadastro.horarioRetirada && !horariosLivres.includes(formCadastro.horarioRetirada)) {
            setFormCadastro(prev => ({ ...prev, horarioRetirada: '' }));
          }
        }
      } else {
        mostrarMensagem(resultado.error || 'Erro ao criar agendamento. Tente novamente.', 'erro');
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      mostrarMensagem('Erro ao criar agendamento. Tente novamente.', 'erro');
      return false;
    }
  };

  useEffect(() => {
    carregarAgendamentos();
  }, [carregarAgendamentos]);

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

  const cadastrarCliente = async (): Promise<void> => {
    if (!validarFormulario()) return;
    
    setLoading(true);

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
      mostrarMensagem('Agendamento criado com sucesso!');
    } else {
      mostrarMensagem('Erro ao criar agendamento. Tente novamente.', 'erro');
    }
    
    setLoading(false);
  };

  const abrirWhatsApp = (telefone: string, nomeCompleto: string, modeloMoto: string, numeroPedido: string): void => {
    const telefoneLimpo = telefone.replace(/\D/g, '');
    let numeroFormatado = telefoneLimpo;
    
    if (!numeroFormatado.startsWith('55')) {
      numeroFormatado = '55' + numeroFormatado;
    }

    const mensagem = `Olá! Gostaria de obter informações sobre meu agendamento. Nome: ${nomeCompleto}, Moto: ${modeloMoto}, Pedido: ${numeroPedido}`;
    const mensagemCodificada = encodeURIComponent(mensagem);
    const linkWhatsApp = `https://wa.me/${numeroFormatado}?text=${mensagemCodificada}`;
    
    window.open(linkWhatsApp, '_blank');
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

  const agendamentosPendentes = agendamentos.filter(a => a.status === 'pendente').length;
  const agendamentosEntregues = agendamentos.filter(a => a.status === 'entregue').length;

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
                <p className="text-red-100 text-sm">Agendamento de Retirada de Motos</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right text-white">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={16} />
                  <span className="text-sm">Aracaju, SE</span>
                </div>
                <div className="text-xs opacity-90">
                  {agendamentosPendentes} pendentes | {agendamentosEntregues} entregues
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
              {mensagem.tipo === 'erro' ? <Clock size={16} /> : <Check size={16} />}
              {mensagem.texto}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-4">
        <nav className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('cadastro')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'cadastro' 
                ? 'bg-red-600 text-white shadow-lg transform scale-105' 
                : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 shadow-sm'
            }`}
          >
            <Plus size={18} />
            Novo Agendamento
          </button>
          <button
            onClick={() => setActiveTab('agendamentos')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 relative ${
              activeTab === 'agendamentos' 
                ? 'bg-red-600 text-white shadow-lg transform scale-105' 
                : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 shadow-sm'
            }`}
          >
            <Calendar size={18} />
            Meus Agendamentos
            {agendamentosPendentes > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                {agendamentosPendentes}
              </span>
            )}
          </button>
        </nav>

        {activeTab === 'cadastro' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <User className="text-red-600" size={20} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Agendar Retirada de Moto</h2>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <Clock className="text-blue-600" size={20} />
                <div>
                  <p className="text-blue-800 font-medium">Atenção: Agendamento com antecedência mínima</p>
                  <p className="text-blue-700 text-sm">
                    Os agendamentos devem ser feitos com pelo menos 6 horas de antecedência. 
                    Próximo horário disponível: após {obterHorarioCorte()}
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={formCadastro.nome}
                    onChange={handleInputChange('nome')}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    placeholder="Digite o nome"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sobrenome *
                  </label>
                  <input
                    type="text"
                    value={formCadastro.sobrenome}
                    onChange={handleInputChange('sobrenome')}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    placeholder="Digite o sobrenome"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Phone size={16} className="inline mr-1" />
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    value={formCadastro.telefone}
                    onChange={handleInputChange('telefone')}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Bike size={16} className="inline mr-1" />
                    Modelo da Moto *
                  </label>
                  <input
                    type="text"
                    value={formCadastro.modeloMoto}
                    onChange={handleInputChange('modeloMoto')}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    placeholder="Ex: Honda CG 160"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Palette size={16} className="inline mr-1" />
                    Cor *
                  </label>
                  <input
                    type="text"
                    value={formCadastro.cor}
                    onChange={handleInputChange('cor')}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    placeholder="Ex: Preta"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Hash size={16} className="inline mr-1" />
                    Chassi *
                  </label>
                  <input
                    type="text"
                    value={formCadastro.chassi}
                    onChange={handleInputChange('chassi')}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    placeholder="Número do chassi"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FileText size={16} className="inline mr-1" />
                    Número do Pedido *
                  </label>
                  <input
                    type="text"
                    value={formCadastro.numeroPedido}
                    onChange={handleInputChange('numeroPedido')}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    placeholder="Ex: PED-12345"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar size={16} className="inline mr-1" />
                    Data de Retirada *
                  </label>
                  <input
                    type="date"
                    value={formCadastro.dataRetirada}
                    onChange={handleDataChange}
                    min={dataMinima}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    required
                  />
                  {dataSelecionada && (
                    <p className="text-sm text-gray-600 mt-1">
                      {obterNomeDiaSemana(dataSelecionada)}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Clock size={16} className="inline mr-1" />
                    Horário de Retirada *
                  </label>
                  <select
                    value={formCadastro.horarioRetirada}
                    onChange={handleInputChange('horarioRetirada')}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    required
                    disabled={!dataSelecionada}
                  >
                    <option value="">Selecione o horário</option>
                    {horariosDisponiveis.map((horario) => (
                      <option key={horario} value={horario}>
                        {horario}
                      </option>
                    ))}
                  </select>
                  {dataSelecionada && horariosDisponiveis.length === 0 && (
                    <p className="text-sm text-red-600 mt-1">
                      Nenhum horário disponível para esta data
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  onClick={cadastrarCliente}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Clock className="animate-spin" size={20} />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      Criar Agendamento
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'agendamentos' && (
          <div className="space-y-4">
            {loadingData ? (
              <div className="bg-white rounded-xl shadow-lg p-8 flex items-center justify-center">
              <div className="text-center">
                <Clock className="animate-spin text-red-600 mx-auto mb-4" size={48} />
                <p className="text-gray-600">Carregando agendamentos...</p>
              </div>
            </div>
            ) : agendamentosOrdenados.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Calendar className="text-gray-300 mx-auto mb-4" size={64} />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Nenhum agendamento encontrado
                </h3>
                <p className="text-gray-500 mb-6">
                  Você ainda não possui agendamentos cadastrados.
                </p>
                <button
                  onClick={() => setActiveTab('cadastro')}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2 transition-colors"
                >
                  <Plus size={20} />
                  Criar Primeiro Agendamento
                </button>
              </div>
            ) : (
              agendamentosOrdenados.map((agendamento) => (
                <div 
                  key={agendamento.id} 
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <User className="text-red-600" size={20} />
                        <h3 className="text-xl font-bold text-gray-800">
                          {agendamento.nomeCompleto}
                        </h3>
                        {getStatusBadge(agendamento.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone size={16} className="text-red-500" />
                          <span>{formatarTelefone(agendamento.telefone)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-600">
                          <Bike size={16} className="text-red-500" />
                          <span>{agendamento.modeloMoto}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-600">
                          <Palette size={16} className="text-red-500" />
                          <span>{agendamento.cor}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-600">
                          <Hash size={16} className="text-red-500" />
                          <span className="truncate">{agendamento.chassi}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-600">
                          <FileText size={16} className="text-red-500" />
                          <span>{agendamento.numeroPedido}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar size={16} className="text-red-500" />
                          <span>
                            {formatarData(agendamento.dataRetirada)} às {agendamento.horarioRetirada}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 lg:flex-col">
                      <button
                        onClick={() => abrirWhatsApp(
                          agendamento.telefone,
                          agendamento.nomeCompleto,
                          agendamento.modeloMoto,
                          agendamento.numeroPedido
                        )}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                        title="Enviar mensagem no WhatsApp"
                      >
                        <MessageCircle size={18} />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SistemaAribeMotosUsuario;