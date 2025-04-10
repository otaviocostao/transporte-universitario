import React, { useState } from 'react';
// Importe Navigate também
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';

const Login = () => {
  // Hooks de estado do formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Loading do formulário

  // Hooks de contexto e navegação
  // Renomeie 'loading' do contexto para 'authLoading' para evitar conflito
  const { login, currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate(); // Mantenha se precisar para outras coisas (ex: link "Esqueci senha?")

  // --- Lógica de Redirecionamento se já estiver logado ---
  // 1. Se o contexto ainda está carregando, mostra indicador
  if (authLoading) {
    return <div>Carregando...</div>; // Ou um spinner mais elaborado
  }

  // 2. Se o contexto NÃO está carregando E existe um usuário, redireciona para Home
  if (currentUser) {
    console.log("Login Component: Usuário já logado, redirecionando para /");
    return <Navigate to="/" replace />; // Impede voltar para /login
  }
  // --- Fim da Lógica de Redirecionamento ---


  // Manipulador de envio do formulário
  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true); // Inicia loading DO FORMULÁRIO
      await login(email, password); // Chama a função de login do contexto
      // *** REMOVIDO: navigate('/'); ***
      // O componente irá re-renderizar devido à mudança no currentUser (do useAuth)
      // e a lógica de redirecionamento acima será acionada.
      console.log("Login form submission successful. Waiting for state update...");
      // Não precisa setar setLoading(false) aqui, pois o componente vai redirecionar/desmontar
    } catch (err) {
      // Define o erro usando a mensagem vinda do AuthContext (ex: "Conta inativa...")
      setError(err.message || 'Falha ao fazer login. Verifique suas credenciais.');
      console.error("Login form error:", err);
      setLoading(false); // Para loading DO FORMULÁRIO somente em caso de erro
    }
    // Removido: setLoading(false); daqui
  }

  // Renderiza o formulário apenas se não estiver carregando E não houver usuário logado
  return (
    <div className="login-container">
      <div className="login-card">
        <div className='login-card-top'>
            <h2>Transporte Universitário</h2>
        </div>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className='form-login'>
            <label className='input-area'>
                <div className='label-area'>
                        <span>E-mail:</span>
                    </div>
                    <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading} // Desabilita input durante o loading do form
                    />
            </label>
            <label className='input-area'>
                    <div className='label-area'>
                        <label>Senha:</label>
                    </div>
                    <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading} // Desabilita input durante o loading do form
                    />
            </label>
          <button
            type="submit"
            className="login-button"
            disabled={loading} // Usa o loading DO FORMULÁRIO
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;