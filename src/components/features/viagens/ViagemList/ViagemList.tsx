import React from 'react';
import { Truck, MapPin } from 'lucide-react';
import { Viagem } from '@/types';
import { ViagemCard } from './ViagemCard';

interface ViagemListProps {
  viagens: Viagem[];
  loading: boolean;
  onStatusChange: (id: string, status: 'pendente' | 'concluida') => void;
  onDelete: (id: string) => void;
}

export const ViagemList: React.FC<ViagemListProps> = ({
  viagens,
  loading,
  onStatusChange,
  onDelete
}) => {
  const agruparViagensPorDestino = (viagens: Viagem[]) => {
    const grupos = viagens.reduce((acc, viagem) => {
      const destino = viagem.destino;
      if (!acc[destino]) {
        acc[destino] = [];
      }
      acc[destino].push(viagem);
      return acc;
    }, {} as Record<string, Viagem[]>);

    Object.keys(grupos).forEach(destino => {
      grupos[destino].sort((a, b) => {
        if (a.status !== b.status) {
          return a.status === 'pendente' ? -1 : 1;
        }
        return new Date(b.dataCadastro).getTime() - new Date(a.dataCadastro).getTime();
      });
    });

    const ordemDestinos = ['Aracaju', 'Socorro', 'Itabaiana'];
    const destinosOrdenados = Object.keys(grupos).sort((a, b) => {
      const indexA = ordemDestinos.indexOf(a);
      const indexB = ordemDestinos.indexOf(b);
      
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      return a.localeCompare(b);
    });

    return { grupos, destinosOrdenados };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <p className="text-gray-600">Carregando viagens...</p>
      </div>
    );
  }

  if (viagens.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <Truck className="mx-auto mb-4 text-gray-400" size={48} />
        <p className="text-gray-600">Nenhuma viagem cadastrada</p>
      </div>
    );
  }

  const { grupos, destinosOrdenados } = agruparViagensPorDestino(viagens);

  return (
    <div className="space-y-6">
      {destinosOrdenados.map(destino => (
        <div key={destino}>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="text-red-600" size={24} />
            <h3 className="text-xl font-bold text-gray-800">Destino: {destino}</h3>
            <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
              {grupos[destino].length} {grupos[destino].length === 1 ? 'viagem' : 'viagens'}
            </span>
          </div>
          <div className="space-y-4">
            {grupos[destino].map(viagem => (
              <ViagemCard
                key={viagem.id}
                viagem={viagem}
                onStatusChange={onStatusChange}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};