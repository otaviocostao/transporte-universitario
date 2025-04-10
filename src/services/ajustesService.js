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
      indice: data.indice !== undefined ? parseInt(data.indice, 10) : 0, // Garante que índice seja número
      embarque: data.embarque || false
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
  
    
    if (faculdadeData.nome !== undefined) {
        dataToUpdate.nome = faculdadeData.nome;
    }
    
    if (faculdadeData.indice !== undefined) {
        dataToUpdate.indice = parseInt(faculdadeData.indice, 10);
    }
  
    if (faculdadeData.embarque !== undefined) {
        dataToUpdate.embarque = Boolean(faculdadeData.embarque); // Garante que seja true ou false
    }
  
    if (Object.keys(dataToUpdate).length > 0) {
       console.log(`Atualizando faculdade ${id} com:`, dataToUpdate);
       await update(faculdadeRef, dataToUpdate);
       const currentDataSnapshot = await get(faculdadeRef);
       if (currentDataSnapshot.exists()) {
           return { id, ...currentDataSnapshot.val() };
       } else {
           return null;
       }
  
    }
    console.log(`Nenhuma atualização necessária para faculdade ${id}.`); // Log para debug
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
  
    // Cria uma cópia dos dados recebidos para não modificar o original
    const dataToUpdate = { ...usuarioData };

    delete dataToUpdate.email;
    delete dataToUpdate.regras; 
    delete dataToUpdate.uid;
    delete dataToUpdate.id;
    delete dataToUpdate.createdAt;
  
    // Remova campos que NUNCA devem ser atualizados por esta função
    // (O email geralmente não é alterado, e regras pode ter lógica própria)
    delete dataToUpdate.email;
    // Considere se 'regras' deve ser atualizado aqui ou por uma função separada.
    // Se 'regras' PODE ser atualizado aqui, certifique-se que 'usuarioData.regras'
    // já está no formato de OBJETO correto vindo do EditUsuarioModal.
    // delete dataToUpdate.regras; // Descomente se regras NUNCA são atualizadas aqui.
  
    // Remove o UID se ele foi passado acidentalmente no objeto
    delete dataToUpdate.uid;
    delete dataToUpdate.id; // Remove id também, se existir
  
    // Verifica se há algo para atualizar após as remoções
    if (Object.keys(dataToUpdate).length === 0) {
        console.warn("updateUsuarioData: Nenhum dado válido para atualizar após remoções.");
        // Você pode querer retornar null ou o perfil atual sem tentar o update
        // const currentSnapshot = await get(usuarioRef);
        // return currentSnapshot.exists() ? { id: userId, ...currentSnapshot.val() } : null;
         return null; // Ou lance um erro informando que nada foi alterado
    }
  
  
    console.log(`DEBUG: Enviando para update em /usuarios/${userId}:`, JSON.stringify(dataToUpdate, null, 2));
  
    // Envia APENAS os campos recebidos e permitidos para o Firebase
    await update(usuarioRef, dataToUpdate);
  
    // Retorna os dados que foram enviados para atualização (não o objeto formatado completo)
    // Ou busca os dados atualizados do banco para retornar o estado mais recente
     const updatedSnapshot = await get(usuarioRef);
     if (updatedSnapshot.exists()) {
         return { id: userId, ...updatedSnapshot.val() };
     } else {
         // Isso não deveria acontecer se o update deu certo, mas é um fallback
         return { id: userId, ...usuarioData }; // Retorna o que foi enviado originalmente
     }
  
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
    const faculdadesRef = ref(db, 'faculdades'); // Certifique-se que o caminho está correto
  
    // Usando get() para uma leitura única (mais simples que onValue com onlyOnce)
    try {
      const snapshot = await get(faculdadesRef);
      const lista = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const facData = childSnapshot.val();
          // CORREÇÃO: Inclui TODOS os dados do snapshot + o ID
          if (facData) { // Verifica se facData não é null/undefined
              lista.push({
                id: childSnapshot.key, // Pega a chave (ID)
                ...facData // Copia TODOS os campos (incluindo nome e indice)
              });
          }
        });
      }
      return lista; // Retorna a lista completa
    } catch (error) {
      console.error("Erro ao buscar lista de faculdades:", error);
      throw error; // Lança o erro para ser tratado no componente
    }
  }

  export const setUserActivity = async (userId, isActive) => {
    if (typeof isActive !== 'boolean') {
        throw new Error("O status de atividade deve ser true ou false.");
    }
    // Referência para o nó PAI do usuário
    const userRef = ref(db, `usuarios/${userId}`);
    try {
        // Usa update() no nó pai, especificando apenas o campo a ser alterado
        await update(userRef, { isActive: isActive });
        console.log(`Usuário ${userId} definido como ${isActive ? 'ativo' : 'inativo'} (via update)`);
        return { id: userId, isActive: isActive };
    } catch (error) {
         console.error(`Erro ao definir atividade para usuário ${userId}:`, error);
         throw error; // Re-lança o erro para ser pego no componente
    }
  };