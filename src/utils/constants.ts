export const LOCAIS_DISPONIVEIS = ['Aracaju', 'Socorro', 'Itabaiana', 'Outros'];

export const HORARIOS_TRABALHO = {
  semana: {
    manha: ['08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00'],
    tarde: ['15:30', '16:00', '16:30', '17:00']
  },
  sabado: {
    manha: ['08:30', '09:00', '09:30', '10:00', '10:30', '11:00']
  }
};

export const MENSAGENS = {
  SUCESSO: {
    AGENDAMENTO_CRIADO: 'Agendamento criado com sucesso!',
    AGENDAMENTO_EXCLUIDO: 'Agendamento excluído com sucesso!',
    STATUS_ATUALIZADO: 'Status atualizado com sucesso!',
    VIAGEM_CRIADA: 'Viagem cadastrada com sucesso!',
    VIAGEM_EXCLUIDA: 'Viagem excluída com sucesso!'
  },
  ERRO: {
    HORARIO_OCUPADO: 'Este horário acabou de ser reservado por outro cliente. Por favor, selecione outro horário.',
    AGENDAMENTO_ERRO: 'Erro ao criar agendamento. Tente novamente.',
    VIAGEM_ERRO: 'Erro ao cadastrar viagem. Tente novamente.'
  }
};