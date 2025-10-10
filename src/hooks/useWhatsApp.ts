import { useCallback } from 'react';

export const useWhatsApp = () => {
  const abrirWhatsApp = useCallback((
    telefone: string, 
    nomeCompleto: string, 
    modeloMoto: string, 
    numeroPedido: string,
    tipo: 'agendamento' | 'consulta' = 'agendamento'
  ): void => {
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
  }, []);

  return { abrirWhatsApp };
};