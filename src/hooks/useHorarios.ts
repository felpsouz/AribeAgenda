import { useState, useEffect, useCallback } from 'react';
import { Agendamento } from '@/types';

export const useHorarios = (agendamentos: Agendamento[]) => {
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [dataSelecionada, setDataSelecionada] = useState<string>('');

  const verificarHorarioValido = useCallback((data: string, horario: string): boolean => {
    const agora = new Date();
    const [ano, mes, dia] = data.split('-').map(Number);
    const [hora, minuto] = horario.split(':').map(Number);
    const dataHorarioAgendamento = new Date(ano, mes - 1, dia, hora, minuto, 0);
    const diferencaHoras = (dataHorarioAgendamento.getTime() - agora.getTime()) / (1000 * 60 * 60);
    return diferencaHoras >= 6;
  }, []);

  const gerarHorariosDisponiveis = useCallback((data: string): string[] => {
    const [ano, mes, dia] = data.split('-').map(Number);
    const dataObj = new Date(ano, mes - 1, dia);
    const diaSemana = dataObj.getDay();
    const horarios: string[] = [];

    if (diaSemana >= 1 && diaSemana <= 5) {
      horarios.push('08:30');
      for (let hora = 9; hora <= 11; hora++) {
        horarios.push(`${hora.toString().padStart(2, '0')}:00`);
        horarios.push(`${hora.toString().padStart(2, '0')}:30`);
      }
      horarios.push('12:00');
      horarios.push('15:30', '16:00', '16:30', '17:00');
    } else if (diaSemana === 6) {
      horarios.push('08:30');
      for (let hora = 9; hora <= 10; hora++) {
        horarios.push(`${hora.toString().padStart(2, '0')}:00`);
        horarios.push(`${hora.toString().padStart(2, '0')}:30`);
      }
      horarios.push('11:00');
    }

    return horarios.filter(horario => verificarHorarioValido(data, horario));
  }, [verificarHorarioValido]);

  const obterHorariosOcupados = useCallback((data: string): string[] => {
    return agendamentos
      .filter(agendamento => agendamento.dataRetirada === data)
      .map(agendamento => agendamento.horarioRetirada);
  }, [agendamentos]);

  useEffect(() => {
    if (dataSelecionada) {
      const todosHorarios = gerarHorariosDisponiveis(dataSelecionada);
      const horariosOcupados = obterHorariosOcupados(dataSelecionada);
      const horariosLivres = todosHorarios.filter(horario => !horariosOcupados.includes(horario));
      setHorariosDisponiveis(horariosLivres);
    } else {
      setHorariosDisponiveis([]);
    }
  }, [dataSelecionada, gerarHorariosDisponiveis, obterHorariosOcupados]);

  return {
    horariosDisponiveis,
    dataSelecionada,
    setDataSelecionada,
    gerarHorariosDisponiveis,
    obterHorariosOcupados
  };
};