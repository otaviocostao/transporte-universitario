// src/components/Ajustes/AddUsuarioModal/AddUsuarioModal.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import './AddUsuarioModal.css';

const AddUsuarioModal = ({ isOpen, onClose, onConfirm, faculdadesList }) => {
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [faculdadeId, setFaculdadeId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { registerUser } = useAuth();

  useEffect(() => {
    // Se houver faculdades disponíveis, selecione a primeira por padrão
    if (faculdadesList && faculdadesList.length > 0) {
      setFaculdadeId(faculdadesList[0].id);
    }
  }, [faculdadesList]);

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (e) => {
    if (!loading && e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validações básicas
    if (!nome.trim() || !sobrenome.trim()) {
      setError("Nome e sobrenome são obrigatórios.");
      return;
    }

    if (!email.trim()) {
      setError("O e-mail é obrigatório.");
      return;
    }

    if (!password.trim()) {
      setError("A senha é obrigatória.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (!faculdadeId) {
      setError("Selecione uma faculdade.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Criar o usuário (Auth + DB)
      await registerUser({
        email,
        password,
        nome,
        sobrenome,
        faculdadeId,
        regras: isAdmin ? ['admin', 'user'] : ['user']
      });

      onClose();
      onConfirm(); // Atualiza a lista de usuários
    } catch (err) {
      console.error("Erro ao cadastrar usuário:", err);

      if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está em uso.');
      } else if (err.code === 'auth/invalid-email') {
        setError('E-mail inválido.');
      } else {
        setError(err.message || "Erro ao cadastrar usuário. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className='area-add-usuario-overlay' onClick={handleOverlayClick}>
        <div className='add-usuario-content' onClick={(e) => e.stopPropagation()}>
          <h3 className='h3-form-add-usuario'>Adicionar novo usuário</h3>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <label className='form-group'>
                <span>Nome:</span>
                <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    disabled={loading}
                    required
                />
              </label>

              <label className='form-group'>
                <span>Sobrenome:</span>
                <input
                    type="text"
                    value={sobrenome}
                    onChange={(e) => setSobrenome(e.target.value)}
                    disabled={loading}
                    required
                />
              </label>
            </div>

            <label className='form-group'>
              <span>E-mail:</span>
              <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
              />
            </label>

            <div className="form-row">
              <label className='form-group'>
                <span>Senha:</span>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    minLength={6}
                />
              </label>

              <label className='form-group'>
                <span>Confirmar Senha:</span>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                />
              </label>
            </div>

            <label className='form-group'>
              <span>Faculdade:</span>
              <select
                  value={faculdadeId}
                  onChange={(e) => setFaculdadeId(e.target.value)}
                  disabled={loading || !faculdadesList || faculdadesList.length === 0}
                  required
              >
                {!faculdadesList || faculdadesList.length === 0 ? (
                    <option value="">Carregando faculdades...</option>
                ) : (
                    faculdadesList.map(fac => (
                        <option key={fac.id} value={fac.id}>{fac.nome}</option>
                    ))
                )}
              </select>
            </label>

            <label className='form-group checkbox-group'>
              <input
                  type="checkbox"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                  disabled={loading}
              />
              <span>Conceder privilégios de administrador</span>
            </label>

            <div className='area-add-usuario-buttons'>
              <button
                  type="submit"
                  className='button-add-usuario'
                  disabled={loading}
              >
                {loading ? "Cadastrando..." : "Cadastrar"}
              </button>
              <button
                  type="button"
                  className='button-cancel-add-usuario'
                  onClick={onClose}
                  disabled={loading}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
  );
};

export default AddUsuarioModal;