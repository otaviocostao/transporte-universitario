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

// Formatar data
const formatDateKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Obter alunos (para o histórico - não usado no CRUD da página principal)
export const getStudents = async (date = new Date()) => {
  const dateKey = formatDateKey(date);
  const dateRef = ref(db, `students/${dateKey}`);

  return new Promise((resolve, reject) => {
    onValue(dateRef, (snapshot) => {
      const students = [];
      snapshot.forEach((childSnapshot) => {
        students.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      resolve(students);
    }, {
      onlyOnce: true
    }, (error) => {
      reject(error);
    });
  });
};

// Listener em tempo real
export const subscribeToStudents = (selectedDate, callback) => {
  if (!selectedDate || !(selectedDate instanceof Date) || isNaN(selectedDate)) {
    callback([], new Error('Data inválida'));
    return () => {};
  }

  const dateKey = formatDateKey(selectedDate);
  const dateRef = ref(db, `students/${dateKey}`);

  const onDataChange = (snapshot) => {
    const students = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        students.push({
          id: childSnapshot.key,
          ...childSnapshot.val(),
        });
      });
    }
    callback(students, null);
  };

  const onError = (error) => {
    console.error("Erro ao ouvir dados:", error);
    callback([], error);
  };

  onValue(dateRef, onDataChange, onError);

  return () => {
    off(dateRef, 'value', onDataChange);
  };
};

// Adicionar aluno
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

// Atualizar aluno
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

// Excluir aluno
export const deleteStudent = async (id, date = new Date()) => {
  const dateKey = formatDateKey(date);
  const studentRef = ref(db, `students/${dateKey}/${id}`);
  await remove(studentRef);
  return id;
};

// Alternar status (SEM TRANSACTION)
export const toggleStudentStatus = async (id, date = new Date()) => {
  const dateKey = formatDateKey(date);
  const studentRef = ref(db, `students/${dateKey}/${id}`);

  // 1. LER o valor atual
  const snapshot = await get(studentRef);

  if (!snapshot.exists()) {
    console.error("Aluno não encontrado para alternar status.");
    return null; // Ou lançar um erro
  }

  const currentData = snapshot.val();
  const newLiberado = !currentData.liberado;

  // 2. ATUALIZAR o valor
  await update(studentRef, {
    liberado: newLiberado,
    updatedAt: Date.now(),
  });

  return {
    id,
    liberado: newLiberado,
  };
};