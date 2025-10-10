import { FormCadastro, FormViagem } from '@/types';

export const validarFormularioAgendamento = (formData: FormCadastro): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const { nome, sobrenome, telefone, modeloMoto, cor, chassi, numeroPedido, dataRetirada, horarioRetirada } = formData;

  if (!nome.trim()) errors.push('Nome é obrigatório');
  if (!sobrenome.trim()) errors.push('Sobrenome é obrigatório');
  if (!telefone.trim()) errors.push('Telefone é obrigatório');
  if (!modeloMoto.trim()) errors.push('Modelo da moto é obrigatório');
  if (!cor.trim()) errors.push('Cor é obrigatória');
  if (!chassi.trim()) errors.push('Chassi é obrigatório');
  if (!numeroPedido.trim()) errors.push('Número do pedido é obrigatório');
  if (!dataRetirada) errors.push('Data de retirada é obrigatória');
  if (!horarioRetirada) errors.push('Horário de retirada é obrigatório');

  if (dataRetirada) {
    const [ano, mes, dia] = dataRetirada.split('-').map(Number);
    const dataAgendamento = new Date(ano, mes - 1, dia);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    dataAgendamento.setHours(0, 0, 0, 0);
    
    if (dataAgendamento < hoje) {
      errors.push('A data de retirada deve ser hoje ou no futuro');
    }

    const diaSemana = dataAgendamento.getDay();
    if (diaSemana === 0) {
      errors.push('Não trabalhamos aos domingos. Selecione outro dia.');
    }

    if (horarioRetirada && !verificarHorarioValido(dataRetirada, horarioRetirada)) {
      errors.push('O agendamento deve ser feito com pelo menos 6 horas de antecedência');
    }
  }

  return { isValid: errors.length === 0, errors };
};

export const validarFormularioViagem = (formData: FormViagem): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const { origem, origemOutros, destino, destinoOutros, modeloMoto, cor, chassi, numeroPedido } = formData;

  if (!origem) errors.push('Origem é obrigatória');
  if (origem === 'Outros' && !origemOutros.trim()) errors.push('Especifique a origem');
  if (!destino) errors.push('Destino é obrigatório');
  if (destino === 'Outros' && !destinoOutros.trim()) errors.push('Especifique o destino');
  if (!modeloMoto.trim()) errors.push('Modelo da moto é obrigatório');
  if (!cor.trim()) errors.push('Cor é obrigatória');
  if (!chassi.trim()) errors.push('Chassi é obrigatório');
  if (!numeroPedido.trim()) errors.push('Número do pedido é obrigatório');

  return { isValid: errors.length === 0, errors };
};

export const verificarHorarioValido = (data: string, horario: string): boolean => {
  const agora = new Date();
  const [ano, mes, dia] = data.split('-').map(Number);
  const [hora, minuto] = horario.split(':').map(Number);
  const dataHorarioAgendamento = new Date(ano, mes - 1, dia, hora, minuto, 0);
  const diferencaHoras = (dataHorarioAgendamento.getTime() - agora.getTime()) / (1000 * 60 * 60);
  return diferencaHoras >= 6;
};