// @/scripts/criarAdmin.ts
// Execute este script UMA VEZ para criar o usuário administrador

import { criarUsuario } from '@/firebase/auth';

const criarUsuarioAdmin = async () => {
  const email = 'admin@aribemotos.com'; // Altere para o e-mail desejado
  const senha = 'SenhaSegura123!'; // Altere para uma senha forte
  
  console.log('Criando usuário administrador...');
  
  const resultado = await criarUsuario(email, senha);
  
  if (resultado.success) {
    console.log('✅ Usuário criado com sucesso!');
    console.log('E-mail:', email);
    console.log('Agora você pode fazer login com estas credenciais');
  } else {
    console.error('❌ Erro ao criar usuário:', resultado.error);
  }
};

// Descomente a linha abaixo para executar
// criarUsuarioAdmin();

export default criarUsuarioAdmin;