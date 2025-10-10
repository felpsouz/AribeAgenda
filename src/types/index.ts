export interface Agendamento {
  id: string;
  nomeCompleto: string;
  telefone: string;
  modeloMoto: string;
  cor: string;
  chassi: string;
  numeroPedido: string;
  dataRetirada: string;
  horarioRetirada: string;
  status: 'pendente' | 'entregue';
  dataCadastro: string;
}

export interface Viagem {
  id: string;
  origem: string;
  origemOutros?: string;
  destino: string;
  destinoOutros?: string;
  modeloMoto: string;
  cor: string;
  chassi: string;
  numeroPedido: string;
  dataCadastro: string;
  status: 'pendente' | 'concluida';
}

export interface FormCadastro {
  nome: string;
  sobrenome: string;
  telefone: string;
  modeloMoto: string;
  cor: string;
  chassi: string;
  numeroPedido: string;
  dataRetirada: string;
  horarioRetirada: string;
}

export interface FormViagem {
  origem: string;
  origemOutros: string;
  destino: string;
  destinoOutros: string;
  modeloMoto: string;
  cor: string;
  chassi: string;
  numeroPedido: string;
}

export interface Mensagem {
  texto: string;
  tipo: 'sucesso' | 'erro';
}

export type TabType = 'cadastro' | 'agendamentos' | 'viagens';
export type StatusType = 'pendente' | 'entregue';
export type StatusViagemType = 'pendente' | 'concluida';