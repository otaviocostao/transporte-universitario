import { 
    ref, 
    set, 
    push, 
    update, 
    remove, 
    query, 
    orderByChild, 
    equalTo, 
    get, 
    onValue
  } from 'firebase/database';
  import { db } from '../firebase/config';
  
  // Referência para a coleção de alunos
  const studentsRef = ref(db, 'students');
  
  // Formatar data como string YYYY-MM-DD para usar como chave
  const formatDateKey = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  
  // Obter todos os alunos para uma data específica
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
  
  // Configurar listener em tempo real para uma data específica
  export const subscribeToStudents = (date, callback) => {
    const dateKey = formatDateKey(date);
    const dateRef = ref(db, `students/${dateKey}`);
    
    const unsubscribe = onValue(dateRef, (snapshot) => {
      const students = [];
      snapshot.forEach((childSnapshot) => {
        students.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      callback(students);
    });
    
    // Retornar função para cancelar a inscrição
    return unsubscribe;
  };
  
  // Adicionar um novo aluno
  export const addStudent = async (studentData) => {
    const dateKey = formatDateKey(new Date());
    const newStudentRef = push(ref(db, `students/${dateKey}`));
    
    const studentWithMetadata = {
      ...studentData,
      timestamp: Date.now(),
      liberado: false
    };
    
    await set(newStudentRef, studentWithMetadata);
    
    return {
      id: newStudentRef.key,
      ...studentWithMetadata
    };
  };
  
  // Atualizar um aluno
  export const updateStudent = async (id, studentData, date = new Date()) => {
    const dateKey = formatDateKey(date);
    const studentRef = ref(db, `students/${dateKey}/${id}`);
    
    const updates = {
      ...studentData,
      updatedAt: Date.now()
    };
    
    await update(studentRef, updates);
    
    return {
      id,
      ...updates
    };
  };
  
  // Excluir um aluno
  export const deleteStudent = async (id, date = new Date()) => {
    const dateKey = formatDateKey(date);
    const studentRef = ref(db, `students/${dateKey}/${id}`);
    await remove(studentRef);
    return id;
  };
  
  // Alternar o status "liberado" de um aluno
  export const toggleStudentStatus = async (id, currentStatus, date = new Date()) => {
    const dateKey = formatDateKey(date);
    const studentRef = ref(db, `students/${dateKey}/${id}`);
    
    await update(studentRef, {
      liberado: !currentStatus,
      updatedAt: Date.now()
    });
    
    return {
      id,
      liberado: !currentStatus
    };
  };