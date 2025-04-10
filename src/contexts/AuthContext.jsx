// src/contexts/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database'; // get está importado - OK
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // >>> CORREÇÃO 1: Declarar o estado userProfile <<<
  const [userProfile, setUserProfile] = useState(null);

  // --- Funções de Autenticação e Dados ---

  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  async function saveUserData(uid, userData) {
    const userRef = ref(db, `usuarios/${uid}`);
  
    // --- Conversão de Array para Objeto ---
    const regrasObj = { user: true }; // Todo usuário logado é 'user' por padrão
    // Verifica se userData.regras FOI passado, se é um ARRAY e se inclui 'admin'
    if (userData.regras && Array.isArray(userData.regras) && userData.regras.includes('admin')) {
      regrasObj.admin = true; // Adiciona admin: true se encontrado no array
    }
    // --- Fim da conversão ---
  
    console.log(`Salvando dados para ${uid} com regrasObj:`, regrasObj); // Log para debug
  
    return set(userRef, { // Usa set para garantir que sobrescreva completamente (incluindo regras)
      nome: userData.nome || '',
      sobrenome: userData.sobrenome || '',
      email: userData.email || '',
      faculdadeId: userData.faculdadeId || '',
      regras: regrasObj, // <<< SALVA O OBJETO <<<
      createdAt: Date.now(),
      isActive: true
    });
  }

  async function registerUser(userData) {
    const userCredential = await signup(userData.email, userData.password);
    await saveUserData(userCredential.user.uid, {
      nome: userData.nome,
      sobrenome: userData.sobrenome,
      email: userData.email,
      faculdadeId: userData.faculdadeId,
      regras: userData.regras || ['user'], // Passa o array para saveUserData
    });
    return userCredential;
  }

  function login(email, password) {
    return new Promise(async (resolve, reject) => {
       try {
           // 1. Tenta autenticar
           const userCredential = await signInWithEmailAndPassword(auth, email, password);
           const user = userCredential.user;

           // 2. Autenticação OK, AGORA verifica o status no RTDB
           const userRef = ref(db, `usuarios/${user.uid}`);
           const snapshot = await get(userRef);

           // 3. Verifica se existe e se está ativo
           // Considera inativo se não existir perfil ou isActive for explicitamente false
           if (!snapshot.exists() || snapshot.val().isActive === false) {
               console.warn(`Login bloqueado: Usuário ${email} (UID: ${user.uid}) está inativo ou sem perfil.`);
               // 4. DESLOGA imediatamente
               await signOut(auth);
               // 5. Rejeita a promessa de login com um erro específico
               reject(new Error("Conta inativa. Entre em contato com o administrador."));
           } else {
               // 6. Usuário ativo, login permitido.
               console.log(`Login permitido para usuário ativo: ${email}`);
               // O onAuthStateChanged cuidará de definir currentUser e userProfile.
               // Resolve a promessa com as credenciais originais.
               resolve(userCredential);
           }

       } catch (error) {
           // Erro durante signInWithEmailAndPassword ou get()
           console.error("Erro durante o processo de login:", error);
           reject(error); // Rejeita com o erro original do Firebase Auth ou do get()
       }
   });
  }

  function logout() {
    // Limpar o perfil ao deslogar também aqui é uma boa prática
    setUserProfile(null);
    return signOut(auth);
  }

  // --- Listener de Autenticação e Perfil ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // >>> DEFINIR LOADING COMO TRUE AQUI <<< enquanto busca o perfil
        setLoading(true);
        const userRef = ref(db, `usuarios/${user.uid}`);
        try {
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            setUserProfile(snapshot.val());
            console.log("AuthContext: Perfil carregado para", user.uid, snapshot.val());
          } else {
            console.warn(`AuthContext: Dados não encontrados no RTDB para o usuário ${user.uid}`);
            setUserProfile(null);
          }
        } catch (error) {
          console.error("Erro ao buscar perfil do usuário do RTDB:", error);
          setUserProfile(null);
        } finally {
           // >>> Definir loading false SOMENTE APÓS a busca (sucesso ou falha) <<<
           setLoading(false);
        }
      } else {
        setUserProfile(null);
        // Usuário deslogado, não está mais carregando
        setLoading(false);
      }
      // REMOVA setLoading(false) daqui de fora do if/else
    });
  
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,     
    userProfile,   
    signup,
    login,
    logout,
    saveUserData,
    registerUser
  };

  return (
      <AuthContext.Provider value={value}>
        {!loading && children}
      </AuthContext.Provider>
  );
}