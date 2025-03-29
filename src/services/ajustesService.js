import {
    ref,
    set,
    push,
    update,
    remove,
    onValue,
    off,
    orderByChild, // Para ordenar faculdades pelo índice
    query,
    get // Para buscar dados uma vez
  } from 'firebase/database';
  // Importe funções de autenticação se precisar criar/deletar usuários no Auth
  import { /* createUserWithEmailAndPassword, deleteUser */ } from 'firebase/auth'; // Descomente se necessário
  import { db, auth } from '../firebase/config'; // Importe db e auth
  
  // --- FACULDADES ---
  
  const faculdadesRef = ref(db, 'faculdades');
  
  // Formatar dados da faculdade para salvar/atualizar
  const formatFaculdadeData = (data) => ({
      nome: data.nome || '',
      indice: data.indice !== undefined ? parseInt(data.indice, 10) : 0 // Garante que índice seja número
  });
  
  // Listener para Faculdades (Ordenado por Índice)
  export const subscribeToFaculdades = (callback) => {
    const q = query(faculdadesRef, orderByChild('indice')); // Ordena pelo campo 'indice'
    const listener = onValue(q, (snapshot) => {
      const faculdades = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          faculdades.push({
            id: childSnapshot.key,
            ...childSnapshot.val(),
          });
        });
      }
      callback(faculdades, null); // Passa os dados ordenados
    }, (error) => {
      console.error("Erro ao ouvir faculdades:", error);
      callback([], error);
    });
  
    return () => off(faculdadesRef, 'value', listener); // Função para cancelar
  };
  
  // Adicionar Faculdade
  export const addFaculdade = async (faculdadeData) => {
    const newFaculdadeRef = push(faculdadesRef);
    const dataToSave = formatFaculdadeData(faculdadeData);
    await set(newFaculdadeRef, dataToSave);
    return { id: newFaculdadeRef.key, ...dataToSave };
  };
  
  // Atualizar Faculdade (Nome e/ou Índice)
  export const updateFaculdade = async (id, faculdadeData) => {
    const faculdadeRef = ref(db, `faculdades/${id}`);
    const dataToUpdate = {};
    if (faculdadeData.nome !== undefined) dataToUpdate.nome = faculdadeData.nome;
    if (faculdadeData.indice !== undefined) dataToUpdate.indice = parseInt(faculdadeData.indice, 10);
  
    if (Object.keys(dataToUpdate).length > 0) {
       await update(faculdadeRef, dataToUpdate);
       return { id, ...dataToUpdate };
    }
    return null; // Nada para atualizar
  };
  
  // Deletar Faculdade
  export const deleteFaculdade = async (id) => {
    const faculdadeRef = ref(db, `faculdades/${id}`);
    await remove(faculdadeRef);
    return id;
  };
  
  // Atualizar Ordem das Faculdades (Recebe um array de faculdades ordenadas)
  export const updateFaculdadeOrder = async (orderedFaculdades) => {
      const updates = {};
      orderedFaculdades.forEach((faculdade, index) => {
          // Atualiza apenas o índice de cada faculdade baseado na nova ordem
          updates[`faculdades/${faculdade.id}/indice`] = index;
      });
      // Aplica todas as atualizações de índice de uma vez
      await update(ref(db), updates);
  };
  
  
  // --- USUÁRIOS ---
  
  const usuariosRef = ref(db, 'usuarios');
  
  // Formatar dados do usuário
  const formatUsuarioData = (data) => ({
      nome: data.nome || '',
      sobrenome: data.sobrenome || '',
      faculdadeId: data.faculdadeId || '', // Armazena o ID da faculdade
      email: data.email || '',
      regras: Array.isArray(data.regras) ? data.regras : ['user'] // Padrão 'user'
  });
  
  // Listener para Usuários
  export const subscribeToUsuarios = (callback) => {
    const listener = onValue(usuariosRef, (snapshot) => {
      const usuarios = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          usuarios.push({
            id: childSnapshot.key, // O ID do usuário (geralmente o UID do Auth)
            ...childSnapshot.val(),
          });
        });
      }
      callback(usuarios, null);
    }, (error) => {
      console.error("Erro ao ouvir usuários:", error);
      callback([], error);
    });
  
    return () => off(usuariosRef, 'value', listener);
  };
  
  // Adicionar Usuário (IMPORTANTE: Segurança e Fluxo)
  // Esta função adiciona APENAS os dados no Realtime Database.
  // A criação do usuário no Firebase Authentication deve ser feita SEPARADAMENTE,
  // preferencialmente por um fluxo de convite ou pelo próprio usuário.
  // NÃO armazene senhas aqui.
  export const addUsuarioData = async (userId, usuarioData) => {
    const usuarioRef = ref(db, `usuarios/${userId}`); // Usa o UID do Auth como chave
    const dataToSave = formatUsuarioData(usuarioData);
    await set(usuarioRef, dataToSave);
    return { id: userId, ...dataToSave };
  };
  
  // Atualizar Dados do Usuário (Exceto email/senha)
  export const updateUsuarioData = async (userId, usuarioData) => {
    const usuarioRef = ref(db, `usuarios/${userId}`);
      const dataToUpdate = formatUsuarioData(usuarioData); // Garante formatação correta
      // Remove campos que não devem ser atualizados diretamente aqui (ex: email)
      delete dataToUpdate.email;
  
    await update(usuarioRef, dataToUpdate);
    return { id: userId, ...dataToUpdate };
  };
  
  // Deletar Dados do Usuário do Realtime Database
  // A exclusão do usuário no Firebase Authentication deve ser feita SEPARADAMENTE.
  export const deleteUsuarioData = async (userId) => {
    const usuarioRef = ref(db, `usuarios/${userId}`);
    await remove(usuarioRef);
    return userId;
  };
  
  // --- Funções Auxiliares (Exemplo) ---
  
  // Buscar todas as faculdades uma vez (útil para selects em formulários)
  export const getFaculdadesList = async () => {
      const snapshot = await get(query(faculdadesRef, orderByChild('indice')));
      const faculdades = [];
      if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
              faculdades.push({
                  id: childSnapshot.key,
                  nome: childSnapshot.val().nome
              });
          });
      }
      return faculdades;
  }