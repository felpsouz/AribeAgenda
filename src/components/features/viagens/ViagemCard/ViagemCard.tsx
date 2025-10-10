import React from 'react';
import { Bike, Palette, Hash, FileText, Check, Clock, X } from 'lucide-react';
import { Viagem } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface ViagemCardProps {
  viagem: Viagem;
  onStatusChange: (id: string, status: 'pendente' | 'concluida') => void;
  onDelete: (id: string) => void;
}

export const ViagemCard: React.FC<ViagemCardProps> = ({
  viagem,
  onStatusChange,
  onDelete
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="text-lg font-bold text-gray-800">{viagem.origem} → {viagem.destino}</h4>
            <StatusBadge status={viagem.status} type="viagem" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Bike size={16} />
              <span>{viagem.modeloMoto}</span>
            </div>
            <div className="flex items-center gap-2">
              <Palette size={16} />
              <span>{viagem.cor}</span>
            </div>
            <div className="flex items-center gap-2">
              <Hash size={16} />
              <span>{viagem.chassi}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText size={16} />
              <span>Pedido: {viagem.numeroPedido}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {viagem.status === 'pendente' ? (
          <button
            onClick={() => onStatusChange(viagem.id, 'concluida')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            <Check size={16} />
            Marcar como Concluída
          </button>
        ) : (
          <button
            onClick={() => onStatusChange(viagem.id, 'pendente')}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors duration-200"
          >
            <Clock size={16} />
            Marcar como Pendente
          </button>
        )}

        <button
          onClick={() => onDelete(viagem.id)}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
        >
          <X size={16} />
          Excluir
        </button>
      </div>
    </div>
  );
};