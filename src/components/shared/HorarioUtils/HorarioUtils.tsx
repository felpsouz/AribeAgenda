import React from 'react';
import { Clock } from 'lucide-react';

interface HorarioUtilsProps {
  horarioCorte: string;
}

export const HorarioUtils: React.FC<HorarioUtilsProps> = ({ horarioCorte }) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2">
        <Clock className="text-blue-600" size={20} />
        <div>
          <p className="text-blue-800 font-medium">Atenção: Agendamento com antecedência mínima</p>
          <p className="text-blue-700 text-sm">
            Os agendamentos devem ser feitos com pelo menos 6 horas de antecedência. 
            Próximo horário disponível: após {horarioCorte}
          </p>
        </div>
      </div>
    </div>
  );
};