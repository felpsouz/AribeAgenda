'use client'
import React, { useState, useEffect } from 'react';
import { User, Calendar, Phone, Bike, Palette, Hash, Clock, Check, X, Plus, MapPin, MessageCircle, FileText } from 'lucide-react';

const SistemaAribeMotos = () => {
  const [activeTab, setActiveTab] = useState('cadastro');
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const [dataSelecionada, setDataSelecionada] = useState('');

  // Estado do formulário de cadastro
  const [formCadastro, setFormCadastro] = useState({
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

  // Função para verificar se um horário é válido (6 horas a partir de agora)
  const verificarHorarioValido = (data, horario) => {
    const agora = new Date();
    const dataHorarioAgendamento = new Date(`${data}T${horario}:00`);
    const diferencaHoras = (dataHorarioAgendamento - agora) / (1000 * 60 * 60);
    return diferencaHoras >= 6;
  };

  // Função para gerar horários disponíveis
  const gerarHorariosDisponiveis = (data) => {
    const dataObj = new Date(data);
    const diaSemana = dataObj.getDay(); // 0 = domingo, 1 = segunda, ..., 6 = sábado
    const horarios = [];

    if (diaSemana >= 1 && diaSemana <= 5) { // Segunda a sexta
      // Manhã: 8:00 às 13:00
      for (let hora = 8; hora <= 12; hora++) {
        horarios.push(`${hora.toString().padStart(2, '0')}:00`);
        if (hora < 12) {
          horarios.push(`${hora.toString().padStart(2, '0')}:30`);
        }
      }
      horarios.push('13:00');
      
      // Tarde: 15:00 às 17:00
      for (let hora = 15; hora <= 16; hora++) {
        horarios.push(`${hora.toString().padStart(2, '0')}:00`);
        horarios.push(`${hora.toString().padStart(2, '0')}:30`);
      }
      horarios.push('17:00');
    } else if (diaSemana === 6) { // Sábado
      // Manhã: 8:00 às 11:00
      for (let hora = 8; hora <= 10; hora++) {
        horarios.push(`${hora.toString().padStart(2, '0')}:00`);
        horarios.push(`${hora.toString().padStart(2, '0')}:30`);
      }
      horarios.push('11:00');
    }

    // Filtrar horários que atendem à regra das 6 horas
    return horarios.filter(horario => verificarHorarioValido(data, horario));
  };

  // Função para verificar horários ocupados
  const obterHorariosOcupados = (data) => {
    const dataFormatada = new Date(data).toDateString();
    return agendamentos
      .filter(agendamento => {
        const dataAgendamento = new Date(agendamento.dataRetirada).toDateString();
        return dataAgendamento === dataFormatada;
      })
      .map(agendamento => agendamento.horarioRetirada);
  };

  // Atualizar horários disponíveis quando a data muda
  useEffect(() => {
    if (dataSelecionada) {
      const todosHorarios = gerarHorariosDisponiveis(dataSelecionada);
      const horariosOcupados = obterHorariosOcupados(dataSelecionada);
      const horariosLivres = todosHorarios.filter(horario => !horariosOcupados.includes(horario));
      setHorariosDisponiveis(horariosLivres);
      
      // Limpar horário selecionado se não estiver mais disponível
      if (formCadastro.horarioRetirada && !horariosLivres.includes(formCadastro.horarioRetirada)) {
        setFormCadastro(prev => ({ ...prev, horarioRetirada: '' }));
      }
    } else {
      setHorariosDisponiveis([]);
    }
  }, [dataSelecionada, agendamentos]);

  // Carregar dados salvos na memória
  useEffect(() => {
    // Dados de exemplo para demonstração
    const dadosExemplo = [
      {
        id: '1',
        nomeCompleto: 'João Silva',
        telefone: '(79) 99999-1234',
        modeloMoto: 'Honda CG 160',
        cor: 'Vermelha',
        chassi: 'ABC123456789',
        numeroPedido: '001',
        dataRetirada: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        horarioRetirada: '09:00',
        status: 'pendente',
        dataCadastro: new Date().toISOString()
      },
      {
        id: '2',
        nomeCompleto: 'Maria Santos',
        telefone: '(79) 98888-5678',
        modeloMoto: 'Yamaha XTZ 150',
        cor: 'Azul',
        chassi: 'DEF987654321',
        numeroPedido: '002',
        dataRetirada: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        horarioRetirada: '14:00',
        status: 'entregue',
        dataCadastro: new Date().toISOString()
      }
    ];
    
    if (agendamentos.length === 0) {
      setAgendamentos(dadosExemplo);
    }
  }, []);

  const mostrarMensagem = (texto, tipo = 'sucesso') => {
    setMensagem({ texto, tipo });
    setTimeout(() => setMensagem(null), 4000);
  };

  const validarFormulario = () => {
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

    // Validar se a data não é no passado
    const dataAgendamento = new Date(dataRetirada);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    dataAgendamento.setHours(0, 0, 0, 0);
    
    if (dataAgendamento < hoje) {
      mostrarMensagem('A data de retirada deve ser hoje ou no futuro', 'erro');
      return false;
    }

    // Validar se é dia útil ou sábado
    const diaSemana = dataAgendamento.getDay();
    if (diaSemana === 0) { // Domingo
      mostrarMensagem('Não trabalhamos aos domingos. Selecione outro dia.', 'erro');
      return false;
    }

    // Validar regra das 6 horas
    if (!verificarHorarioValido(dataRetirada, horarioRetirada)) {
      mostrarMensagem('O agendamento deve ser feito com pelo menos 6 horas de antecedência', 'erro');
      return false;
    }

    return true;
  };

  const cadastrarCliente = () => {
    if (!validarFormulario()) return;
    
    setLoading(true);

    // Simular delay de API
    setTimeout(() => {
      const novoAgendamento = {
        id: Date.now().toString(),
        nomeCompleto: `${formCadastro.nome} ${formCadastro.sobrenome}`,
        telefone: formCadastro.telefone,
        modeloMoto: formCadastro.modeloMoto,
        cor: formCadastro.cor,
        chassi: formCadastro.chassi,
        numeroPedido: formCadastro.numeroPedido,
        dataRetirada: formCadastro.dataRetirada,
        horarioRetirada: formCadastro.horarioRetirada,
        status: 'pendente',
        dataCadastro: new Date().toISOString()
      };

      setAgendamentos(prev => [...prev, novoAgendamento]);
      
      // Limpar formulário
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
      setLoading(false);
    }, 1000);
  };

  const alterarStatus = (id, novoStatus) => {
    setAgendamentos(prev => 
      prev.map(agendamento => 
        agendamento.id === id 
          ? { ...agendamento, status: novoStatus }
          : agendamento
      )
    );
    
    mostrarMensagem(
      novoStatus === 'entregue' 
        ? 'Entrega marcada como concluída!' 
        : 'Status alterado para pendente'
    );
  };

  const abrirWhatsApp = (telefone, nomeCompleto, modeloMoto, numeroPedido) => {
    // Limpar o telefone e garantir formato correto
    const telefoneLimpo = telefone.replace(/\D/g, '');
    let numeroFormatado = telefoneLimpo;
    
    // Se não começar com 55 (código do Brasil), adicionar
    if (!numeroFormatado.startsWith('55')) {
      numeroFormatado = '55' + numeroFormatado;
    }

    const mensagem = `Olá ${nomeCompleto}! Sua moto ${modeloMoto} (Pedido: ${numeroPedido}) está pronta para retirada. Entre em contato para combinarmos o melhor horário. Obrigado por escolher a Aribé Motos!`;
    const mensagemCodificada = encodeURIComponent(mensagem);
    const linkWhatsApp = `https://wa.me/${numeroFormatado}?text=${mensagemCodificada}`;
    
    window.open(linkWhatsApp, '_blank');
  };

  const excluirAgendamento = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      setAgendamentos(prev => prev.filter(agendamento => agendamento.id !== id));
      mostrarMensagem('Agendamento excluído com sucesso!');
    }
  };

  const formatarTelefone = (telefone) => {
    const cleaned = telefone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return telefone;
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const obterNomeDiaSemana = (data) => {
    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return dias[new Date(data).getDay()];
  };

  const getStatusBadge = (status) => {
    const config = {
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

    const { style, label, icon: Icon } = config[status];

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${style}`}>
        <Icon size={12} />
        {label}
      </span>
    );
  };

  // Ordenar agendamentos: pendentes primeiro, depois por data de retirada
  const agendamentosOrdenados = [...agendamentos].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === 'pendente' ? -1 : 1;
    }
    const dataA = new Date(`${a.dataRetirada}T${a.horarioRetirada}`);
    const dataB = new Date(`${b.dataRetirada}T${b.horarioRetirada}`);
    return dataA - dataB;
  });

  const agendamentosPendentes = agendamentos.filter(a => a.status === 'pendente').length;
  const agendamentosEntregues = agendamentos.filter(a => a.status === 'entregue').length;

  // Obter data mínima (hoje)
  const dataMinima = new Date().toISOString().split('T')[0];

  // Função para obter horário de corte (6 horas a partir de agora)
  const obterHorarioCorte = () => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <Bike className="text-red-600" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Aribé Motos</h1>
                <p className="text-red-100 text-sm">Sistema de Agendamento - Entrega de Motos</p>
              </div>
            </div>
            <div className="text-right text-white">
              <div className="flex items-center gap-2 mb-1">
                <MapPin size={16} />
                <span className="text-sm">Aracaju, SE</span>
              </div>
              <div className="text-xs opacity-90">
                {agendamentosPendentes} pendentes | {agendamentosEntregues} entregues
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mensagem de feedback */}
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

      {/* Navigation Tabs */}
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
            Cadastrar Cliente
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
            Agendamentos
            {agendamentosPendentes > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                {agendamentosPendentes}
              </span>
            )}
          </button>
        </nav>

        {/* Content */}
        {activeTab === 'cadastro' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <User className="text-red-600" size={20} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Cadastrar Novo Cliente</h2>
            </div>

            {/* Aviso sobre horário de corte */}
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
                    onChange={(e) => setFormCadastro({...formCadastro, nome: e.target.value})}
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
                    onChange={(e) => setFormCadastro({...formCadastro, sobrenome: e.target.value})}
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
                    onChange={(e) => setFormCadastro({...formCadastro, telefone: e.target.value})}
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
                    onChange={(e) => setFormCadastro({...formCadastro, modeloMoto: e.target.value})}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    placeholder="Ex: Honda CB 600F"
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
                    onChange={(e) => setFormCadastro({...formCadastro, cor: e.target.value})}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    placeholder="Ex: Azul"
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
                    onChange={(e) => setFormCadastro({...formCadastro, chassi: e.target.value})}
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
                    onChange={(e) => setFormCadastro({...formCadastro, numeroPedido: e.target.value})}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    placeholder="Ex: 12345"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar size={16} className="inline mr-1" />
                    Data para Retirada *
                  </label>
                  <input
                    type="date"
                    value={dataSelecionada}
                    onChange={(e) => {
                      setDataSelecionada(e.target.value);
                      setFormCadastro({...formCadastro, dataRetirada: e.target.value, horarioRetirada: ''});
                    }}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    min={dataMinima}
                    required
                  />
                  {dataSelecionada && (
                    <p className="text-sm text-gray-600 mt-1">
                      {obterNomeDiaSemana(dataSelecionada)} - {formatarData(dataSelecionada)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Clock size={16} className="inline mr-1" />
                    Horário para Retirada *
                  </label>
                  <select
                    value={formCadastro.horarioRetirada}
                    onChange={(e) => setFormCadastro({...formCadastro, horarioRetirada: e.target.value})}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    required
                    disabled={!dataSelecionada}
                  >
                    <option value="">Selecione um horário</option>
                    {horariosDisponiveis.map(horario => (
                      <option key={horario} value={horario}>
                        {horario}
                      </option>
                    ))}
                  </select>
                  {dataSelecionada && horariosDisponiveis.length === 0 && (
                    <p className="text-sm text-red-600 mt-1">
                      Nenhum horário disponível para esta data (considere a regra das 6 horas)
                    </p>
                  )}
                  {dataSelecionada && horariosDisponiveis.length > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      {horariosDisponiveis.length} horários disponíveis
                    </p>
                  )}
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                  <button
                    onClick={cadastrarCliente}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg"
                  >
                    {loading ? 'Cadastrando...' : 'Cadastrar Cliente'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'agendamentos' && (
          <div className="space-y-6">
            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total</p>
                    <p className="text-3xl font-bold text-gray-800">{agendamentos.length}</p>
                    </div>
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Calendar className="text-gray-600" size={24} />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-600 text-sm font-medium">Pendentes</p>
                    <p className="text-3xl font-bold text-yellow-700">{agendamentosPendentes}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="text-yellow-600" size={24} />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Entregues</p>
                    <p className="text-3xl font-bold text-green-700">{agendamentosEntregues}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Check className="text-green-600" size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de agendamentos */}
            <div className="bg-white rounded-xl shadow-lg">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Calendar className="text-red-600" size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Lista de Agendamentos</h2>
                </div>
              </div>

              {agendamentosOrdenados.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="text-gray-400" size={32} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhum agendamento encontrado</h3>
                  <p className="text-gray-500">Os agendamentos aparecerão aqui após o cadastro dos clientes.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {agendamentosOrdenados.map((agendamento) => (
                    <div key={agendamento.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center">
                              <User className="text-red-600" size={20} />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-gray-800">
                                {agendamento.nomeCompleto}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Phone size={14} />
                                  {formatarTelefone(agendamento.telefone)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <FileText size={14} />
                                  Pedido: {agendamento.numeroPedido}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                                Moto
                              </p>
                              <p className="font-semibold text-gray-800 flex items-center gap-1">
                                <Bike size={14} />
                                {agendamento.modeloMoto}
                              </p>
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Palette size={12} />
                                {agendamento.cor}
                              </p>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                                Chassi
                              </p>
                              <p className="font-semibold text-gray-800 flex items-center gap-1 text-sm">
                                <Hash size={14} />
                                {agendamento.chassi}
                              </p>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                                Data de Retirada
                              </p>
                              <p className="font-semibold text-gray-800 flex items-center gap-1">
                                <Calendar size={14} />
                                {formatarData(agendamento.dataRetirada)}
                              </p>
                              <p className="text-sm text-gray-600">
                                {obterNomeDiaSemana(agendamento.dataRetirada)}
                              </p>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                                Horário
                              </p>
                              <p className="font-semibold text-gray-800 flex items-center gap-1">
                                <Clock size={14} />
                                {agendamento.horarioRetirada}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-start lg:items-end gap-3">
                          <div className="flex items-center gap-2">
                            {getStatusBadge(agendamento.status)}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => abrirWhatsApp(
                                agendamento.telefone, 
                                agendamento.nomeCompleto, 
                                agendamento.modeloMoto,
                                agendamento.numeroPedido
                              )}
                              className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              <MessageCircle size={14} />
                              WhatsApp
                            </button>

                            {agendamento.status === 'pendente' ? (
                              <button
                                onClick={() => alterarStatus(agendamento.id, 'entregue')}
                                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                              >
                                <Check size={14} />
                                Marcar como Entregue
                              </button>
                            ) : (
                              <button
                                onClick={() => alterarStatus(agendamento.id, 'pendente')}
                                className="flex items-center gap-2 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors"
                              >
                                <Clock size={14} />
                                Marcar como Pendente
                              </button>
                            )}

                            <button
                              onClick={() => excluirAgendamento(agendamento.id)}
                              className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              <X size={14} />
                              Excluir
                            </button>
                          </div>

                          <div className="text-xs text-gray-500">
                            Cadastrado em: {new Date(agendamento.dataCadastro).toLocaleDateString('pt-BR')}
                          </div>
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