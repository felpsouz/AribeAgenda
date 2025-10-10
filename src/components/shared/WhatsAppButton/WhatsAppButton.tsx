import React from 'react';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  telefone: string;
  nomeCompleto: string;
  modeloMoto: string;
  numeroPedido: string;
  tipo?: 'agendamento' | 'consulta';
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  telefone,
  nomeCompleto,
  modeloMoto,
  numeroPedido,
  tipo = 'agendamento'
}) => {
  const abrirWhatsApp = () => {
    const telefoneLimpo = telefone.replace(/\D/g, '');
    let numeroFormatado = telefoneLimpo;
    
    if (!numeroFormatado.startsWith('55')) {
      numeroFormatado = '55' + numeroFormatado;
    }

    const mensagem = tipo === 'agendamento' 
      ? `Olá ${nomeCompleto}! Sua moto ${modeloMoto} (Pedido: ${numeroPedido}) está pronta para retirada. Entre em contato para combinarmos o melhor horário. Obrigado por escolher a Aribé Motos!`
      : `Olá! Gostaria de obter informações sobre meu agendamento. Nome: ${nomeCompleto}, Moto: ${modeloMoto}, Pedido: ${numeroPedido}`;
    
    const mensagemCodificada = encodeURIComponent(mensagem);
    const linkWhatsApp = `https://wa.me/${numeroFormatado}?text=${mensagemCodificada}`;
    
    window.open(linkWhatsApp, '_blank');
  };

  return (
    <button
      onClick={abrirWhatsApp}
      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
    >
      <MessageCircle size={16} />
      WhatsApp
    </button>
  );
};