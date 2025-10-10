import React from 'react';
import { Phone, Bike, Palette, Hash, FileText, Calendar, MessageCircle, Check, Clock, X } from 'lucide-react';
import { Agendamento } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatarTelefone, formatarData } from '@/utils/formatters';

interface AgendamentoCardProps {
  agendamento: Agendamento;
  onStatusChange: (id: string, status: 'pendente' | 'entregue') => void;
  onDelete: (id: string) => void;
  onWhatsApp: (agendamento: Agendamento) => void;
}

export const AgendamentoCard: React.FC<AgendamentoCardProps> = ({
  agendamento,
  onStatusChange,
  onDelete,
  onWhatsApp
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold text-gray-800">{agendamento.nomeCompleto}</h3>
            <StatusBadge status={agendamento.status} type="agendamento" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Phone size={16} />
              <span>{formatarTelefone(agendamento.telefone)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Bike size={16} />
              <span>{agendamento.modeloMoto}</span>
            </div>
            <div className="flex items-center gap-2">
              <Palette size={16} />
              <span>{agendamento.cor}</span>
            </div>
            <div className="flex items-center gap-2">
              <Hash size={16} />
              <span>{agendamento.chassi}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText size={16} />
              <span>Pedido: {agendamento.numeroPedido}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{formatarData(agendamento.dataRetirada)} - {agendamento.horarioRetirada}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onWhatsApp(agendamento)}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
        >
          <MessageCircle size={16} />
          WhatsApp
        </button>

        {agendamento.status === 'pendente' ? (
          <button
            onClick={() => onStatusChange(agendamento.id, 'entregue')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            <Check size={16} />
            Marcar como Entregue
          </button>
        ) : (
          <button
            onClick={() => onStatusChange(agendamento.id, 'pendente')}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors duration-200"
          >
            <Clock size={16} />
            Marcar como Pendente
          </button>
        )}

        <button
          onClick={() => onDelete(agendamento.id)}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
        >
          <X size={16} />
          Excluir
        </button>
      </div>
    </div>
  );
};
interface AgendamentoCardProps {
  // ... props existentes
  modoUsuario?: boolean;
}

export const AgendamentoCard: React.FC<AgendamentoCardProps> = ({
  // ... outras props
  modoUsuario = false
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
      {/* ... conteúdo existente */}
      
      <div className="flex flex-wrap gap-2">
        <Button
          variant="success"
          onClick={() => onWhatsApp(agendamento)}
          icon={MessageCircle}
        >
          WhatsApp
        </Button>

        {/* Mostrar ações apenas se NÃO for modo usuário */}
        {!modoUsuario && (
          <>
            {agendamento.status === 'pendente' ? (
              <Button
                variant="primary"
                onClick={() => onStatusChange(agendamento.id, 'entregue')}
                icon={Check}
              >
                Marcar como Entregue
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={() => onStatusChange(agendamento.id, 'pendente')}
                icon={Clock}
              >
                Marcar como Pendente
              </Button>
            )}

            <Button
              variant="danger"
              onClick={() => onDelete(agendamento.id)}
              icon={X}
            >
              Excluir
            </Button>
          </>
        )}
      </div>
    </div>
  );
};