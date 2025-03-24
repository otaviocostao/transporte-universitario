import {
  ref,
  onValue,
  off,
  query,
  orderByChild,
  equalTo,
} from 'firebase/database';
import { db } from '../firebase/config'; 

const formatDateKey = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date)) {
    return ''; // Ou lançar um erro, se preferir
  }
  const d = new Date(date.getTime()); // Cria uma cópia, usando o timestamp
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
};

// Configurar listener em tempo real para uma data específica
export const subscribeToStudents = (selectedDate, callback) => {
    if (!selectedDate || !(selectedDate instanceof Date) || isNaN(selectedDate)) {
      callback([], new Error('Data inválida'));
      return () => {}; 
    }

  const dateKey = formatDateKey(selectedDate);
  const dateRef = ref(db, `students/${dateKey}`);


  const onDataChange = (snapshot) => { // Função separada para melhor legibilidade
    const students = [];
    if (snapshot.exists()) { 
      snapshot.forEach((childSnapshot) => {
        students.push({
          id: childSnapshot.key,
          ...childSnapshot.val(),
        });
      });
    }
    callback(students, null); // Chama a callback com os dados e null para erro
  };

  const onError = (error) => { // Função separada para lidar com erros
    console.error("Erro ao ouvir dados:", error); // Log do erro
    callback([], error);
  };

  // Usar onValue com tratamento de erros
  onValue(dateRef, onDataChange, onError);

  // Retornar função para cancelar a inscrição
  return () => {
    off(dateRef, 'value', onDataChange); 
  };
};


export const addStudent = async (studentData) => {
  const dateKey = formatDateKey(new Date());
  const newStudentRef = push(ref(db, `students/${dateKey}`));

  const studentWithMetadata = {
    ...studentData,
    timestamp: Date.now(), 
    liberado: false,
  };

  await set(newStudentRef, studentWithMetadata);

  return {
    id: newStudentRef.key,
    ...studentWithMetadata,
  };
};

// Atualizar um aluno
export const updateStudent = async (id, studentData, date = new Date()) => {
  const dateKey = formatDateKey(date);
  const studentRef = ref(db, `students/${dateKey}/${id}`);

  const updates = {
    ...studentData,
    updatedAt: Date.now(), 
  };

  await update(studentRef, updates);

  return {
    id,
    ...updates,
  };
};

// Excluir um aluno
export const deleteStudent = async (id, date = new Date()) => {
  const dateKey = formatDateKey(date);
  const studentRef = ref(db, `students/${dateKey}/${id}`);
  await remove(studentRef);
  return id;
};


export const toggleStudentStatus = async (id, date = new Date()) => {
  const dateKey = formatDateKey(date);
  const studentRef = ref(db, `students/${dateKey}/${id}`);


  try {
        const {snapshot} = await transaction(studentRef, (currentData) => {
            if (currentData) {
                return { ...currentData, liberado: !currentData.liberado, updatedAt: Date.now() };
            }
            return currentData; 
        });
        if (snapshot.exists()){
            return { id, liberado: snapshot.val().liberado };
        }
        return null;

    } catch (error) {
        console.error("Erro ao alternar status:", error);
        throw error; 
    }
};