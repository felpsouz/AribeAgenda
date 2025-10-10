import React from 'react';
import { Clock } from 'lucide-react';

interface LoadingProps {
  texto?: string;
  tamanho?: 'sm' | 'md' | 'lg';
}

export const Loading: React.FC<LoadingProps> = ({ 
  texto = 'Carregando...', 
  tamanho = 'md' 
}) => {
  const sizeConfig = {
    sm: { icon: 24, text: 'text-sm' },
    md: { icon: 32, text: 'text-base' },
    lg: { icon: 48, text: 'text-lg' }
  };

  const { icon, text } = sizeConfig[tamanho];

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Clock 
        className="animate-spin text-red-600 mb-4" 
        size={icon} 
      />
      <p className={`text-gray-600 ${text}`}>{texto}</p>
    </div>
  );
};