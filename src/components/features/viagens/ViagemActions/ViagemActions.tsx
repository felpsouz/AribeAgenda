import React from 'react';
import { Check, Clock, X } from 'lucide-react';
import { Viagem } from '@/types';
import { Button } from '@/components/ui/Button';

interface ViagemActionsProps {
  viagem: Viagem;
  onStatusChange: (id: string, status: 'pendente' | 'concluida') => void;
  onDelete: (id: string) => void;
}

export const ViagemActions: React.FC<ViagemActionsProps> = ({
  viagem,
  onStatusChange,
  onDelete
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {viagem.status === 'pendente' ? (
        <Button
          variant="primary"
          onClick={() => onStatusChange(viagem.id, 'concluida')}
          icon={Check}
        >
          Marcar como Concluída
        </Button>
      ) : (
        <Button
          variant="secondary"
          onClick={() => onStatusChange(viagem.id, 'pendente')}
          icon={Clock}
        >
          Marcar como Pendente
        </Button>
      )}

      <Button
        variant="danger"
        onClick={() => onDelete(viagem.id)}
        icon={X}
      >
        Excluir
      </Button>
    </div>
  );
};