import React from 'react';
import { Bike, MapPin, LogOut } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle: string;
  onLogout: () => void;
  stats?: {
    pendentes: number;
    concluidos: number;
  };
}

export const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  onLogout, 
  stats 
}) => {
  return (
    <div className="bg-gradient-to-r from-red-600 to-red-700 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <Bike className="text-red-600" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{title}</h1>
              <p className="text-red-100 text-sm">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-white">
              <div className="flex items-center gap-2 mb-1">
                <MapPin size={16} />
                <span className="text-sm">Aracaju, SE</span>
              </div>
              {stats && (
                <div className="text-xs opacity-90">
                  {stats.pendentes} pendentes | {stats.concluidos} concluídos
                </div>
              )}
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-200 border border-white/20"
              title="Sair do sistema"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};