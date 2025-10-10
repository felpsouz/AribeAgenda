import { useState, useCallback } from 'react';

interface Mensagem {
  texto: string;
  tipo: 'sucesso' | 'erro';
}

export const useMessage = () => {
  const [mensagem, setMensagem] = useState<Mensagem | null>(null);

  const mostrarMensagem = useCallback((texto: string, tipo: 'sucesso' | 'erro' = 'sucesso'): void => {
    setMensagem({ texto, tipo });
    setTimeout(() => setMensagem(null), 4000);
  }, []);

  return { mensagem, mostrarMensagem, setMensagem };
};