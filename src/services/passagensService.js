import {
    ref,
    set,
    push,
    update,
    remove,
    onValue,
    off,
    query,
    orderByKey,
    startAt,
    endAt,
    get,
  } from 'firebase/database';
  import { db } from '../firebase/config';

  // Formatar data (mantém sua versão, adiciona validação)
  const formatDateKey = (date) => {
    // Validação adicionada
    if (!date || !(date instanceof Date) || isNaN(date)) {
      console.error("formatDateKey: Data inválida recebida", date);
      return ''; // Retorna vazio ou lança um erro
    }
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

    // Obter todas as passagens para uma data específica
    export const getPassagens = async (date = new Date()) => {
        const dateKey = formatDateKey(date);
        if (!dateKey) return Promise.reject(new Error("Data inválida para getPassagens")); // Rejeita se a chave for inválida

        const dateRef = ref(db, `passagens/${dateKey}`);

        // Alternativa usando get() - mais idiomático para v9+ para leitura única:
        /*
        try {
          const snapshot = await get(dateRef);
          const passagens = [];
          if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
              passagens.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
              });
            });
          }
          return passagens;
        } catch (error) {
          console.error("Erro ao buscar passagens:", error);
          throw error; // Re-lança o erro
        }
        */

        // Sua versão original com onValue (funciona, mas get() é mais limpo):
        return new Promise((resolve, reject) => {
            onValue(dateRef, (snapshot) => {
              const passagens = [];
              if (snapshot.exists()){ // Adiciona verificação de existência
                  snapshot.forEach((childSnapshot) => {
                    passagens.push({
                      id: childSnapshot.key,
                      ...childSnapshot.val()
                    });
                  });
              }
              resolve(passagens);
            },
            (error) => { // Callback de erro simplificada
              console.error("Erro ao buscar passagens (onValue):", error);
              reject(error);
            },
            { // Opções como último argumento
              onlyOnce: true
            });
          });
    };

    // Listener em tempo real (sem alterações necessárias)
    export const subscribeToPassagens = (selectedDate, callback) => {
        if (!selectedDate || !(selectedDate instanceof Date) || isNaN(selectedDate)) {
            callback([], new Error('Data inválida'));
            return () => {};
        };

        const dateKey = formatDateKey(selectedDate);
        if (!dateKey) { // Verifica se a formatação retornou uma chave válida
            callback([], new Error('Data inválida para subscribeToPassagens'));
            return () => {};
        }

        const dateRef = ref(db, `passagens/${dateKey}`);

        const onDataChange = (snapshot) => {
            const passagens = [];
            if(snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    passagens.push({
                        id: childSnapshot.key,
                        ...childSnapshot.val(),
                    });
                });
            }
            callback(passagens, null);
        }

        const onError = (error) => {
            console.error("Erro ao ouvir dados", error);
            callback([], error);
        };

        onValue(dateRef, onDataChange, onError);

        return () => {
            off(dateRef, 'value', onDataChange);
        };
    };

    // Adicionar passagem (sem alterações necessárias)
    export const addPassagem = async (passagemData) => {
        const dateKey = formatDateKey(new Date());
        if (!dateKey) throw new Error("Data inválida para addPassagem");

        const newPassagemRef = push(ref(db, `passagens/${dateKey}`));

        const passagemWithMetadata = {
            ...passagemData,
            timestamp: Date.now(),
        }

        await set(newPassagemRef, passagemWithMetadata);

        return {
            id: newPassagemRef.key,
            ...passagemWithMetadata,
        };
    };

    // Atualizar passagem (CORRIGIDO)
    export const updatePassagem = async (id, passagemData, date = new Date()) => { // Correção: new Date()
        const dateKey = formatDateKey(date);
        if (!dateKey || !id) throw new Error("ID ou Data inválida para updatePassagem");

        // Correção: Referência CORRETA para a passagem específica
        const passagemRef = ref(db, `passagens/${dateKey}/${id}`);

        const updates = {
            ...passagemData,
            updatedAt: Date.now(), // Correção: updatedAt
        };

        await update(passagemRef, updates);

        return {
            id,
            ...updates,
        };
    };

    // Excluir passagem (sem alterações necessárias)
    export const deletePassagem = async (id, date = new Date()) => {
        const dateKey = formatDateKey(date);
         if (!dateKey || !id) throw new Error("ID ou Data inválida para deletePassagem");

        const passagemRef = ref(db, `passagens/${dateKey}/${id}`);
        await remove(passagemRef);
        return id;
    };

    export const subscribeToPassagensInRange = (startDate, endDate, callback) => {
        // Validação das datas de entrada
        if (!startDate || !endDate || !(startDate instanceof Date) || !(endDate instanceof Date) || isNaN(startDate) || isNaN(endDate) || startDate > endDate) {
          callback([], new Error('Range de datas inválido'));
          return () => {};
        }
      
        const startDateKey = formatDateKey(startDate);
        const endDateKey = formatDateKey(endDate);
      
        // Referência ao nó PAI 'passagens'
        const passagensRef = ref(db, 'passagens');
      
        // Cria a query para buscar no range de chaves (datas formatadas)
        const rangeQuery = query(
          passagensRef,
          orderByKey(), // Ordena/Filtra pela chave (YYYY-MM-DD)
          startAt(startDateKey), // Começa na data de início
          endAt(endDateKey) // Termina na data de fim
        );
      
        const onDataChange = (snapshot) => {
          const passagens = [];
          if (snapshot.exists()) {
            // Itera sobre os NÓS DE DATA dentro do range
            snapshot.forEach((dateSnapshot) => {
              // Itera sobre as PASSAGENS dentro de cada nó de data
              dateSnapshot.forEach((passagemSnapshot) => {
                passagens.push({
                  id: passagemSnapshot.key,
                  ...passagemSnapshot.val(),
                  // Opcional: Adicionar a data da passagem se não estiver nos dados internos
                  // data: dateSnapshot.key
                });
              });
            });
          }
          callback(passagens, null); // Retorna TODAS as passagens no range
        };
      
        const onError = (error) => {
          console.error("Erro ao ouvir passagens no range:", error);
          callback([], error);
        };
      
        // Anexa o listener à QUERY
        onValue(rangeQuery, onDataChange, onError);
      
        // Retorna a função de cancelamento
        return () => {
          off(rangeQuery, 'value', onDataChange);
        };
      };