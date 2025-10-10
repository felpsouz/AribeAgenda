import React from 'react';
import { Plus, FileText, Truck } from 'lucide-react';

type TabType = 'cadastro' | 'agendamentos' | 'viagens';

interface NavigationTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  agendamentosPendentes?: number;
  viagensPendentes?: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onTabChange,
  agendamentosPendentes = 0,
  viagensPendentes = 0
}) => {
  const tabs = [
    {
      id: 'cadastro' as TabType,
      label: 'Novo Agendamento',
      icon: Plus,
      badge: null
    },
    {
      id: 'agendamentos' as TabType,
      label: 'Agendamentos',
      icon: FileText,
      badge: agendamentosPendentes
    },
    {
      id: 'viagens' as TabType,
      label: 'Viagens',
      icon: Truck,
      badge: viagensPendentes
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm mb-6">
      <div className="flex border-b">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 px-6 py-4 font-medium transition-colors duration-200 ${
              activeTab === tab.id
                ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
                : 'text-gray-600 hover:text-red-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <tab.icon size={20} />
              <span>{tab.label}</span>
              {tab.badge !== null && tab.badge > 0 && (
                <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                  {tab.badge}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};