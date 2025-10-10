import React from 'react';
import { User, Phone, Bike, Palette, Hash, FileText, Calendar, Clock, Plus } from 'lucide-react';
import { FormField } from './FormField';

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

interface AgendamentoFormProps {
  formData: FormCadastro;
  horariosDisponiveis: string[];
  dataSelecionada: string;
  loading: boolean;
  onChange: (field: keyof FormCadastro, value: string) => void;
  onDataChange: (data: string) => void;
  onSubmit: () => void;
  onObterHorarioCorte: () => string;
  onObterNomeDiaSemana: (data: string) => string;
}

export const AgendamentoForm: React.FC<AgendamentoFormProps> = ({
  formData,
  horariosDisponiveis,
  dataSelecionada,
  loading,
  onChange,
  onDataChange,
  onSubmit,
  onObterHorarioCorte,
  onObterNomeDiaSemana
}) => {
  const dataMinima = new Date().toISOString().split('T')[0];

  const handleInputChange = (field: keyof FormCadastro) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    onChange(field, e.target.value);
  };

  const handleDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDataChange(e.target.value);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Cadastrar Novo Agendamento</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <FormField
          label="Nome"
          icon={User}
          required
        >
          <input
            type="text"
            value={formData.nome}
            onChange={handleInputChange('nome')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Digite o nome"
          />
        </FormField>

        <FormField
          label="Sobrenome"
          icon={User}
          required
        >
          <input
            type="text"
            value={formData.sobrenome}
            onChange={handleInputChange('sobrenome')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Digite o sobrenome"
          />
        </FormField>

        <FormField
          label="Telefone"
          icon={Phone}
          required
        >
          <input
            type="tel"
            value={formData.telefone}
            onChange={handleInputChange('telefone')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="(00) 00000-0000"
          />
        </FormField>

        <FormField
          label="Modelo da Moto"
          icon={Bike}
          required
        >
          <input
            type="text"
            value={formData.modeloMoto}
            onChange={handleInputChange('modeloMoto')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Ex: Honda CG 160"
          />
        </FormField>

        <FormField
          label="Cor"
          icon={Palette}
          required
        >
          <input
            type="text"
            value={formData.cor}
            onChange={handleInputChange('cor')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Ex: Preta"
          />
        </FormField>

        <FormField
          label="Chassi"
          icon={Hash}
          required
        >
          <input
            type="text"
            value={formData.chassi}
            onChange={handleInputChange('chassi')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Digite o número do chassi"
          />
        </FormField>

        <FormField
          label="Número do Pedido"
          icon={FileText}
          required
        >
          <input
            type="text"
            value={formData.numeroPedido}
            onChange={handleInputChange('numeroPedido')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Digite o número do pedido"
          />
        </FormField>

        <FormField
          label="Data de Retirada"
          icon={Calendar}
          required
        >
          <input
            type="date"
            value={formData.dataRetirada}
            onChange={handleDataChange}
            min={dataMinima}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          {dataSelecionada && (
            <p className="text-xs text-gray-500 mt-1">
            {onObterNomeDiaSemana(dataSelecionada)} - {new Date(dataSelecionada).toLocaleDateString('pt-BR')}
            </p>
          )}
        </FormField>

        <FormField
          label="Horário de Retirada"
          icon={Clock}
          required
        >
          <select
            value={formData.horarioRetirada}
            onChange={handleInputChange('horarioRetirada')}
            disabled={!dataSelecionada}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Selecione um horário</option>
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
        </FormField>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Importante:</strong> Agendamentos devem ser feitos com pelo menos 6 horas de antecedência. 
          Horário limite para hoje: {onObterHorarioCorte()}
        </p>
      </div>

      <button
        onClick={onSubmit}
        disabled={loading}
        className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? 'Cadastrando...' : (
          <>
            <Plus size={20} />
            Cadastrar Agendamento
          </>
        )}
      </button>
    </div>
  );
};