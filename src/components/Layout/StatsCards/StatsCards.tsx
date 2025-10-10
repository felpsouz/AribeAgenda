import React from 'react';
import { Clock, Check } from 'lucide-react';

interface StatsCardsProps {
  agendamentosPendentes: number;
  agendamentosEntregues: number;
  viagensPendentes?: number;
  viagensConcluidas?: number;
  showViagens?: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  agendamentosPendentes,
  agendamentosEntregues,
  viagensPendentes = 0,
  viagensConcluidas = 0,
  showViagens = false
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className={`grid gap-4 ${showViagens ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2'}`}>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Agendamentos Pendentes</p>
              <p className="text-3xl font-bold text-yellow-600">{agendamentosPendentes}</p>
            </div>
            <Clock className="text-yellow-600" size={32} />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Agendamentos Entregues</p>
              <p className="text-3xl font-bold text-green-600">{agendamentosEntregues}</p>
            </div>
            <Check className="text-green-600" size={32} />
          </div>
        </div>

        {showViagens && (
          <>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Viagens Pendentes</p>
                  <p className="text-3xl font-bold text-yellow-600">{viagensPendentes}</p>
                </div>
                <Clock className="text-yellow-600" size={32} />
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Viagens Concluídas</p>
                  <p className="text-3xl font-bold text-green-600">{viagensConcluidas}</p>
                </div>
                <Check className="text-green-600" size={32} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};