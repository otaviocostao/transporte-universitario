import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Inicio from './pages/Inicio/Inicio.jsx';
import Login from './pages/Login/Login.jsx';
import Passagens from './pages/Passagens/Passagens.jsx'
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

// Componente de rota protegida
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
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
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;