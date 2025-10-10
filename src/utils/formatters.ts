export const formatarTelefone = (telefone: string): string => {
  const cleaned = telefone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return telefone;
};

export const formatarData = (data: string): string => {
  const [ano, mes, dia] = data.split('-').map(Number);
  const dataObj = new Date(ano, mes - 1, dia);
  return dataObj.toLocaleDateString('pt-BR');
};

export const obterNomeDiaSemana = (data: string): string => {
  const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const [ano, mes, dia] = data.split('-').map(Number);
  const dataObj = new Date(ano, mes - 1, dia);
  return dias[dataObj.getDay()];
};

export const obterHorarioCorte = (): string => {
  const agora = new Date();
  const corte = new Date(agora.getTime() + 6 * 60 * 60 * 1000);
  return corte.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const ordenarAgendamentos = (agendamentos: any[]) => {
  return [...agendamentos].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === 'pendente' ? -1 : 1;
    }
    
    const [anoA, mesA, diaA] = a.dataRetirada.split('-').map(Number);
    const [horaA, minutoA] = a.horarioRetirada.split(':').map(Number);
    const dataA = new Date(anoA, mesA - 1, diaA, horaA, minutoA);
    
    const [anoB, mesB, diaB] = b.dataRetirada.split('-').map(Number);
    const [horaB, minutoB] = b.horarioRetirada.split(':').map(Number);
    const dataB = new Date(anoB, mesB - 1, diaB, horaB, minutoB);
    
    return dataA.getTime() - dataB.getTime();
  });
};