// App.jsx Corrigido

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Inicio from './pages/Inicio/Inicio.jsx';
import Login from './pages/Login/Login.jsx';
import Passagens from './pages/Passagens/Passagens.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';
import Historico from './pages/Historico/Historico.jsx';
import Ajustes from './pages/Ajustes/Ajustes.jsx'; // Renomeado para AjustesPage para clareza (opcional)

// Importe o AdminRoute que criamos
import AdminRoute from './components/AdminRoute/AdminRoute'; // <-- AJUSTE O CAMINHO se necessário

// Componente de rota protegida (para rotas que SÓ precisam de login)
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth(); // Adicione loading

  if (loading) {
    return <div>Carregando...</div>; // Evita renderizar antes de saber o status
  }

  if (!currentUser) {
    // Se não estiver carregando e não houver usuário, redireciona
    return <Navigate to="/login" replace />;
  }

  // Se não estiver carregando e houver usuário, renderiza o children
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rota de Login (pública) */}
          <Route path="/login" element={<Login />} />

          {/* Rotas que exigem apenas login */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Inicio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/passagens"
            element={
              <ProtectedRoute>
                <Passagens />
              </ProtectedRoute>
            }
          />
          <Route
            path="/historico"
            element={
              <ProtectedRoute>
                <Historico />
              </ProtectedRoute>
            }
          />

          {/* Rota /ajustes que exige login E ser ADMIN */}
          <Route element={<AdminRoute />}> {/* <-- USA O ADMINROUTE */}
            <Route path="/ajustes" element={<Ajustes />} />
             {/* Se tiver sub-rotas como /ajustes/usuarios, defina aqui ou use /ajustes/* */}
          </Route>

          {/* Você pode adicionar uma rota Curinga/Not Found no final */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;