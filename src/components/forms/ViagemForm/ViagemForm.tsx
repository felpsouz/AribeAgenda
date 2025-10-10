import React from 'react';
import { MapPin, Bike, Palette, Hash, FileText, Plus } from 'lucide-react';
import { FormField } from './FormField';

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

interface ViagemFormProps {
  formData: FormViagem;
  loading: boolean;
  onChange: (field: keyof FormViagem, value: string) => void;
  onSubmit: () => void;
}

const locaisDisponiveis = ['Aracaju', 'Socorro', 'Itabaiana', 'Outros'];

export const ViagemForm: React.FC<ViagemFormProps> = ({
  formData,
  loading,
  onChange,
  onSubmit
}) => {
  const handleInputChange = (field: keyof FormViagem) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    onChange(field, e.target.value);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Cadastrar Nova Viagem</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <FormField
          label="Origem"
          icon={MapPin}
          required
        >
          <select
            value={formData.origem}
            onChange={handleInputChange('origem')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">Selecione a origem</option>
            {locaisDisponiveis.map(local => (
              <option key={local} value={local}>{local}</option>
            ))}
          </select>
        </FormField>

        {formData.origem === 'Outros' && (
          <FormField
            label="Especifique a Origem"
            icon={MapPin}
            required
          >
            <input
              type="text"
              value={formData.origemOutros}
              onChange={handleInputChange('origemOutros')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Digite a origem"
            />
          </FormField>
        )}

        <FormField
          label="Destino"
          icon={MapPin}
          required
        >
          <select
            value={formData.destino}
            onChange={handleInputChange('destino')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">Selecione o destino</option>
            {locaisDisponiveis.map(local => (
              <option key={local} value={local}>{local}</option>
            ))}
          </select>
        </FormField>

        {formData.destino === 'Outros' && (
          <FormField
            label="Especifique o Destino"
            icon={MapPin}
            required
          >
            <input
              type="text"
              value={formData.destinoOutros}
              onChange={handleInputChange('destinoOutros')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Digite o destino"
            />
          </FormField>
        )}

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
      </div>

      <button
        onClick={onSubmit}
        disabled={loading}
        className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? 'Cadastrando...' : (
          <>
            <Plus size={20} />
            Cadastrar Viagem
          </>
        )}
      </button>
    </div>
  );
};