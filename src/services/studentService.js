import {
  ref,
  set,
  push,
  update,
  remove,
  onValue,
  off,
  get // Importante
} from 'firebase/database';
import { db } from '../firebase/config';

// Formatar data (Melhoria: Adicionar validação básica)
const formatDateKey = (date) => {
  // Verifica se 'date' é um objeto Date válido
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    console.warn("formatDateKey recebeu data inválida. Usando data atual.");
    date = new Date(); // Fallback para data atual
  }
  const d = date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- FUNÇÕES PRINCIPAIS ---

// Obter alunos uma única vez (para histórico, etc.)
export const getStudents = async (date = new Date()) => {
  const dateKey = formatDateKey(date);
  const dateRef = ref(db, `students/${dateKey}`);

  try {
    const snapshot = await get(dateRef); // Usar get para leitura única é mais direto
    const students = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        students.push({
          id: childSnapshot.key,
          ...childSnapshot.val() 
        });
      });
    }
    return students;
  } catch (error) {
    console.error(`Erro ao buscar alunos para ${dateKey}:`, error);
    throw error; // Re-lança o erro para ser tratado por quem chamou
  }
};

// Listener em tempo real para alunos de uma data específica
export const subscribeToStudents = (selectedDate, callback) => {
  if (!selectedDate || !(selectedDate instanceof Date) || isNaN(selectedDate.getTime())) {
    console.error('subscribeToStudents: Data inválida fornecida.', selectedDate);
    // Chama o callback com erro e retorna uma função vazia para desinscrever
    callback([], new Error('Data inválida fornecida para subscribeToStudents'));
    return () => {};
  }

  const dateKey = formatDateKey(selectedDate);
  const dateRef = ref(db, `students/${dateKey}`);

  // Callback para quando os dados mudam
  const onDataChange = (snapshot) => {
    const students = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        students.push({
          id: childSnapshot.key,
          ...childSnapshot.val(), // Incluirá 'embarcado' se existir no DB
        });
      });
    }
    callback(students, null); // Passa os dados (ou array vazio) e nenhum erro
  };

  // Callback para erros no listener
  const onError = (error) => {
    console.error(`Erro ao ouvir dados de alunos para ${dateKey}:`, error);
    callback([], error); // Passa array vazio e o objeto de erro
  };

  // Registra o listener
  onValue(dateRef, onDataChange, onError);

  // Retorna a função de cleanup para desregistrar o listener
  return () => {
    // console.log(`Desinscrevendo do listener de alunos para ${dateKey}`); // Log opcional para debug
    off(dateRef, 'value', onDataChange); // Remove o listener específico
  };
};

// Adicionar aluno - MODIFICADO
export const addStudent = async (studentData, date = new Date()) => {
  const dateKey = formatDateKey(date);
  const dailyStudentsRef = ref(db, `students/${dateKey}`);
  const newStudentRef = push(dailyStudentsRef); // Gera um ID único

  // Cria o objeto completo a ser salvo
  const studentWithMetadata = {
    ...studentData,      // Dados do aluno (nome, faculdadeId, etc.)
    timestamp: Date.now(), // Data/hora da criação
    liberado: false,     // Status inicial de liberação
    embarcado: false,    // <<< ADICIONADO: Status inicial de embarque
    updatedAt: Date.now() // Opcional: data da última atualização (inicialmente igual à criação)
  };

  try {
    await set(newStudentRef, studentWithMetadata);
    // Retorna o objeto completo como foi salvo, incluindo o ID gerado
    return {
      id: newStudentRef.key,
      ...studentWithMetadata,
    };
  } catch (error) {
    console.error(`Erro ao adicionar aluno em ${dateKey}:`, error);
    throw error; // Re-lança o erro
  }
};

// Atualizar dados gerais do aluno (exceto status específicos como liberado/embarcado,
// que podem ter funções dedicadas ou serem atualizados aqui também se necessário)
export const updateStudent = async (id, studentData, date = new Date()) => {
  const dateKey = formatDateKey(date);
  const studentRef = ref(db, `students/${dateKey}/${id}`);

  // Prepara os dados para atualização, incluindo um timestamp de atualização
  const updates = {
    ...studentData,     // Novos dados (ex: { nome: 'Novo Nome' })
    updatedAt: Date.now(), // Atualiza o timestamp da última modificação
  };

  try {
    await update(studentRef, updates);
    // Opcional: buscar e retornar o dado completo atualizado
    const snapshot = await get(studentRef);
     if (snapshot.exists()) {
       return { id, ...snapshot.val() };
     } else {
       console.warn(`Aluno ${id} não encontrado em ${dateKey} após tentativa de update.`);
       return null; // Ou lançar erro se preferir
     }
  } catch (error) {
    console.error(`Erro ao atualizar aluno ${id} em ${dateKey}:`, error);
    throw error;
  }
};

// Excluir aluno
export const deleteStudent = async (id, date = new Date()) => {
  const dateKey = formatDateKey(date);
  const studentRef = ref(db, `students/${dateKey}/${id}`);
  try {
    await remove(studentRef);
    return id; // Retorna o ID do aluno excluído para confirmação
  } catch (error) {
    console.error(`Erro ao excluir aluno ${id} em ${dateKey}:`, error);
    throw error;
  }
};

// --- FUNÇÕES DE TOGGLE DE STATUS ---

// Alternar status 'liberado'
export const toggleStudentStatus = async (id, date = new Date()) => {
  const dateKey = formatDateKey(date);
  const studentRef = ref(db, `students/${dateKey}/${id}`);

  try {
    // 1. Ler o valor atual
    const snapshot = await get(studentRef);
    if (!snapshot.exists()) {
      throw new Error(`Aluno ${id} não encontrado em ${dateKey} para alternar status liberado.`);
    }

    const currentData = snapshot.val();
    const newLiberado = !currentData.liberado; // Inverte o valor atual

    // 2. Atualizar apenas o campo 'liberado' e 'updatedAt'
    await update(studentRef, {
      liberado: newLiberado,
      updatedAt: Date.now(),
    });

    // Retorna o ID e o novo status para confirmação
    return { id, liberado: newLiberado };

  } catch (error) {
    console.error(`Erro ao alternar status liberado para aluno ${id} em ${dateKey}:`, error);
    throw error;
  }
};

// Alternar status 'embarcado' - NOVA FUNÇÃO
export const toggleEmbarqueStatus = async (id, date = new Date()) => {
  const dateKey = formatDateKey(date);
  const studentRef = ref(db, `students/${dateKey}/${id}`);

  try {
    // 1. Ler o valor atual
    const snapshot = await get(studentRef);
    if (!snapshot.exists()) {
      throw new Error(`Aluno ${id} não encontrado em ${dateKey} para alternar status embarcado.`);
    }

    const currentData = snapshot.val();
    // Garante que 'embarcado' seja tratado como booleano, mesmo se não existir (default false)
    const currentEmbarcado = Boolean(currentData.embarcado);
    const newEmbarcado = !currentEmbarcado; // Inverte o valor atual

    // 2. Atualizar apenas o campo 'embarcado' e 'updatedAt'
    await update(studentRef, {
      embarcado: newEmbarcado,
      updatedAt: Date.now(),
    });

    // Retorna o ID e o novo status para confirmação
    return { id, embarcado: newEmbarcado };

  } catch (error) {
    console.error(`Erro ao alternar status embarcado para aluno ${id} em ${dateKey}:`, error);
    throw error;
  }
};