import React from 'react';
import { MessageCircle, Check, Clock, X } from 'lucide-react';
import { Agendamento } from '@/types';
import { Button } from '@/components/ui/Button';

interface AgendamentoActionsProps {
  agendamento: Agendamento;
  onStatusChange: (id: string, status: 'pendente' | 'entregue') => void;
  onDelete: (id: string) => void;
  onWhatsApp: (agendamento: Agendamento) => void;
}

export const AgendamentoActions: React.FC<AgendamentoActionsProps> = ({
  agendamento,
  onStatusChange,
  onDelete,
  onWhatsApp
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="success"
        onClick={() => onWhatsApp(agendamento)}
        icon={MessageCircle}
      >
        WhatsApp
      </Button>

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
    </div>
  );
};