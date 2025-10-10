import React from 'react';
import { FileText } from 'lucide-react';
import { Agendamento } from '@/types';
import { AgendamentoCard } from './AgendamentoCard';

interface AgendamentoListProps {
  agendamentos: Agendamento[];
  loading: boolean;
  onStatusChange: (id: string, status: 'pendente' | 'entregue') => void;
  onDelete: (id: string) => void;
  onWhatsApp: (agendamento: Agendamento) => void;
}

export const AgendamentoList: React.FC<AgendamentoListProps> = ({
  agendamentos,
  loading,
  onStatusChange,
  onDelete,
  onWhatsApp
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <p className="text-gray-600">Carregando agendamentos...</p>
      </div>
    );
  }

  if (agendamentos.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <FileText className="mx-auto mb-4 text-gray-400" size={48} />
        <p className="text-gray-600">Nenhum agendamento cadastrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {agendamentos.map(agendamento => (
        <AgendamentoCard
          key={agendamento.id}
          agendamento={agendamento}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
          onWhatsApp={onWhatsApp}
        />
      ))}
    </div>
  );
};

interface AgendamentoListProps {
  // ... props existentes
  modoUsuario?: boolean;
}

export const AgendamentoList: React.FC<AgendamentoListProps> = ({
  // ... outras props
  modoUsuario = false
}) => {
  // No retorno, passe o modoUsuario para o AgendamentoCard
  return (
    // ...
    <AgendamentoCard
      // ... outras props
      modoUsuario={modoUsuario}
    />
  );
};