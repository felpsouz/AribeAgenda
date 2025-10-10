import React from 'react';

interface MessageProps {
  texto: string;
  tipo: 'sucesso' | 'erro';
  onClose: () => void;
}

export const Message: React.FC<MessageProps> = ({ texto, tipo, onClose }) => {
  return (
    <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
      tipo === 'sucesso' 
        ? 'bg-green-500 text-white' 
        : 'bg-red-500 text-white'
    } animate-fade-in`}>
      {texto}
      <button onClick={onClose} className="ml-4 font-bold">×</button>
    </div>
  );
};