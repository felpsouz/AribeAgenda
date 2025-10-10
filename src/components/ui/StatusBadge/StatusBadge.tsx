import React from 'react';
import { Clock, Check } from 'lucide-react';

interface StatusBadgeProps {
  status: 'pendente' | 'entregue' | 'concluida';
  type?: 'agendamento' | 'viagem';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'agendamento' }) => {
  const config = {
    agendamento: {
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
    },
    viagem: {
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
    }
  };

  const statusConfig = config[type][status];
  const Icon = statusConfig.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.style}`}>
      <Icon size={12} />
      {statusConfig.label}
    </span>
  );
};