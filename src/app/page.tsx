'use client'
import React, { useState, useEffect } from 'react';
import { User, Calendar, Phone, Bike, Palette, Hash, Clock, Check, X, Plus, MapPin, MessageCircle } from 'lucide-react';

const SistemaAribeMotos = () => {
  const [activeTab, setActiveTab] = useState('cadastro');
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  // Estado do formulário de cadastro
  const [formCadastro, setFormCadastro] = useState({
    nome: '',
    sobrenome: '',
    telefone: '',
    modeloMoto: '',
    cor: '',
    chassi: '',
    dataRetirada: ''
  });

  // Carregar dados do localStorage ao iniciar
  useEffect(() => {
    const agendamentosSalvos = localStorage.getItem('agendamentos-aribe-motos');
    if (agendamentosSalvos) {
      setAgendamentos(JSON.parse(agendamentosSalvos));
    }
  }, []);

  // Salvar dados no localStorage sempre que agendamentos mudarem
  useEffect(() => {
    localStorage.setItem('agendamentos-aribe-motos', JSON.stringify(agendamentos));
  }, [agendamentos]);

  const mostrarMensagem = (texto, tipo = 'sucesso') => {
    setMensagem({ texto, tipo });
    setTimeout(() => setMensagem(null), 4000);
  };

  const validarFormulario = () => {
    const { nome, sobrenome, telefone, modeloMoto, cor, chassi, dataRetirada } = formCadastro;
    
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
    if (!dataRetirada) {
      mostrarMensagem('Data e horário de retirada são obrigatórios', 'erro');
      return false;
    }

    // Validar se a data não é no passado
    const dataAgendamento = new Date(dataRetirada);
    const agora = new Date();
    if (dataAgendamento <= agora) {
      mostrarMensagem('A data de retirada deve ser no futuro', 'erro');
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
        dataRetirada: formCadastro.dataRetirada,
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
        dataRetirada: ''
      });

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

  const abrirWhatsApp = (telefone, nomeCompleto, modeloMoto) => {
    // Limpar o telefone e garantir formato correto
    const telefoneLimpo = telefone.replace(/\D/g, '');
    let numeroFormatado = telefoneLimpo;
    
    // Se não começar com 55 (código do Brasil), adicionar
    if (!numeroFormatado.startsWith('55')) {
      numeroFormatado = '55' + numeroFormatado;
    }

    const mensagem = `Olá ${nomeCompleto}! Sua moto ${modeloMoto} está pronta para retirada. Entre em contato para combinarmos o melhor horário. Obrigado por escolher a Aribé Motos!`;
    const mensagemCodificada = encodeURIComponent(mensagem);
    const linkWhatsApp = `https://wa.me/${numeroFormatado}?text=${mensagemCodificada}`;
    
    window.open(linkWhatsApp, '_blank');
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

  const formatarDataHora = (dataHora) => {
    return new Date(dataHora).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
    return new Date(a.dataRetirada) - new Date(b.dataRetirada);
  });

  const agendamentosPendentes = agendamentos.filter(a => a.status === 'pendente').length;
  const agendamentosEntregues = agendamentos.filter(a => a.status === 'entregue').length;

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

                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar size={16} className="inline mr-1" />
                    Data e Horário para Retirada *
                  </label>
                  <input
                    type="datetime-local"
                    value={formCadastro.dataRetirada}
                    onChange={(e) => setFormCadastro({...formCadastro, dataRetirada: e.target.value})}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    min={new Date().toISOString().slice(0, 16)}
                    required
                  />
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
                  <Calendar className="text-gray-400" size={32} />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-600 text-sm font-medium">Pendentes</p>
                    <p className="text-3xl font-bold text-yellow-700">{agendamentosPendentes}</p>
                  </div>
                  <Clock className="text-yellow-400" size={32} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Entregues</p>
                    <p className="text-3xl font-bold text-green-700">{agendamentosEntregues}</p>
                  </div>
                  <Check className="text-green-400" size={32} />
                </div>
              </div>
            </div>

            {/* Lista de Agendamentos */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Lista de Agendamentos</h2>
              
              {agendamentosOrdenados.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="mx-auto text-gray-300 mb-4" size={64} />
                  <p className="text-gray-500 text-lg">Nenhum agendamento cadastrado</p>
                  <button
                    onClick={() => setActiveTab('cadastro')}
                    className="mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Cadastrar Primeiro Cliente
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {agendamentosOrdenados.map((agendamento) => (
                    <div 
                      key={agendamento.id} 
                      className={`border rounded-xl p-6 transition-all duration-200 hover:shadow-md ${
                        agendamento.status === 'pendente' 
                          ? 'border-yellow-200 bg-yellow-50' 
                          : 'border-green-200 bg-green-50'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                              <User className="text-red-600" size={20} />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-800">{agendamento.nomeCompleto}</h3>
                              {getStatusBadge(agendamento.status)}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Bike size={16} className="text-red-500" />
                              <span className="font-medium">{agendamento.modeloMoto}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Palette size={16} className="text-purple-500" />
                              <span>{agendamento.cor}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Phone size={16} className="text-green-500" />
                              <span>{formatarTelefone(agendamento.telefone)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock size={16} className="text-blue-500" />
                              <span>{formatarDataHora(agendamento.dataRetirada)}</span>
                            </div>
                          </div>
                          
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Chassi:</span> {agendamento.chassi}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => abrirWhatsApp(agendamento.telefone, agendamento.nomeCompleto, agendamento.modeloMoto)}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                          >
                            <MessageCircle size={16} />
                            WhatsApp
                          </button>

                          {agendamento.status === 'pendente' ? (
                            <button
                              onClick={() => alterarStatus(agendamento.id, 'entregue')}
                              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                            >
                              <Check size={16} />
                              Marcar como Entregue
                            </button>
                          ) : (
                            <button
                              onClick={() => alterarStatus(agendamento.id, 'pendente')}
                              className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                            >
                              <Clock size={16} />
                              Marcar como Pendente
                            </button>
                          )}
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