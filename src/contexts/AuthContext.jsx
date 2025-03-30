// src/contexts/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Função para cadastro no Authentication
  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  // Função para salvar dados do usuário no Realtime Database
  async function saveUserData(uid, userData) {
    const userRef = ref(db, `usuarios/${uid}`);
    return set(userRef, {
      nome: userData.nome || '',
      sobrenome: userData.sobrenome || '',
      email: userData.email || '',
      faculdadeId: userData.faculdadeId || '',
      regras: userData.regras || ['user'],
      createdAt: Date.now()
    });
  }

  // Função completa para registrar um usuário (Auth + DB)
  async function registerUser(userData) {
    // Criar o usuário no Firebase Authentication
    const userCredential = await signup(userData.email, userData.password);

    // Depois salva os dados adicionais no Realtime Database
    await saveUserData(userCredential.user.uid, {
      nome: userData.nome,
      sobrenome: userData.sobrenome,
      email: userData.email,
      faculdadeId: userData.faculdadeId,
      regras: userData.regras,
    });

    return userCredential;
  }

  // Função para login
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Função para logout
  function logout() {
    return signOut(auth);
  }

  // Configura o listener de estado da autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
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