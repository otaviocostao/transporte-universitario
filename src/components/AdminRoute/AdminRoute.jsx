// src/components/AdminRoute/AdminRoute.jsx
import React from 'react';
// Importe Navigate e Outlet do react-router-dom para lidar com redirecionamento e renderização
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
// Importe seu hook useAuth para acessar o contexto

const AdminRoute = () => {
  // Pegue os dados do contexto
  const { currentUser, userProfile, loading } = useAuth();

  // ---- Lógica de Verificação ----

  // 1. Ainda carregando? Mostra um indicador temporário.
  if (loading) {
    // É importante esperar o loading terminar para ter certeza sobre currentUser e userProfile
    return <div>Verificando permissões...</div>; // Ou um componente Spinner, etc.
  }

  // 2. Não está logado? Redireciona para a página de login.
  if (!currentUser) {
    console.log("AdminRoute: Usuário não autenticado. Redirecionando para /login.");
    // 'replace' evita que o usuário volte para a rota admin pelo botão "voltar" do navegador
    return <Navigate to="/login" replace />;
  }

  // 3. Está logado, mas o perfil não carregou ou não é admin?
  //    (Verifica se userProfile existe e se userProfile.regras.admin é true)
  //    Lembre-se: Adaptar userProfile.regras.admin se você ainda usa array em 'regras'
  const isAdmin = userProfile && userProfile.regras && userProfile.regras.admin === true;

  if (!isAdmin) {
    console.log(`AdminRoute: Usuário ${currentUser.email} autenticado, mas não é admin. Perfil:`, userProfile);
    // Redireciona para a página inicial ou uma página de "Acesso Negado"
    return <Navigate to="/" replace />; // Redireciona para a Home
    // Alternativa: return <Navigate to="/acesso-negado" replace />;
  }

  // ---- Permissão Concedida ----
  // 4. Se passou por todas as verificações, o usuário está logado e é admin.
  console.log(`AdminRoute: Acesso permitido para admin ${currentUser.email}.`);
  // Renderiza o componente filho definido na configuração das rotas (sua AjustesPage)
  return <Outlet />;
};

export default AdminRoute;