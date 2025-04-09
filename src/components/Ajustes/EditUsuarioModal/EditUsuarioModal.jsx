// src/components/Ajustes/EditUsuarioModal/EditUsuarioModal.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext'; // Verifique o caminho
import './EditUsuarioModal.css'; // Crie ou adapte este CSS
import { updateUsuarioData } from '../../../services/ajustesService';

const EditUsuarioModal = ({ isOpen, onClose, onConfirm, faculdadesList, userToEdit }) => {
  // Estado inicial vazio ou baseado no userToEdit se já disponível
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [faculdadeId, setFaculdadeId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  

  // Efeito para preencher o formulário quando o modal abre ou userToEdit muda
  useEffect(() => {
    if (userToEdit) {
      setNome(userToEdit.nome || '');
      setSobrenome(userToEdit.sobrenome || '');
      setFaculdadeId(userToEdit.faculdadeId || '');
      // Verifica se 'admin' está presente no array de regras
      setIsAdmin(userToEdit.regras && userToEdit.regras.includes('admin'));
      // Limpa campos de senha ao abrir/trocar usuário
      setError(null); // Limpa erros anteriores
    } else {
       // Limpa o formulário se userToEdit for nulo (embora não deva acontecer se isOpen=true)
       setNome('');
       setSobrenome('');
       setFaculdadeId('');
       setIsAdmin(false);
       setError(null);
    }
    // Dependência de userToEdit para re-popular o form se o usuário a ser editado mudar
  }, [userToEdit, isOpen]);


  if (!isOpen || !userToEdit) { // Só renderiza se estiver aberto E tiver um usuário para editar
    return null;
  }

  const handleOverlayClick = (e) => {
    if (!loading && e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validações básicas (exceto senha)
    if (!nome.trim() || !sobrenome.trim()) {
      setError("Nome e sobrenome são obrigatórios.");
      return;
    }

    if (!faculdadeId) {
      setError("Selecione uma faculdade.");
      return;
    }

    // Validação de senha SÓ SE o campo de nova senha foi preenchido

    setLoading(true);
    setError(null);

    try {
      // Montar os dados a serem atualizados
      const updatedData = {
        uid: userToEdit.uid, // ou userToEdit.id, dependendo de como você armazena
        nome,
        sobrenome,
        faculdadeId,
        regras: isAdmin ? ['admin', 'user'] : ['user'],
      };

      await updateUsuarioData(userToEdit.id, updatedData);

      onClose(); // Fecha o modal
      onConfirm(); // Atualiza a lista de usuários na tela anterior
    } catch (err) {
      console.error("Erro ao atualizar usuário:", err);
      // Adapte as mensagens de erro conforme necessário para atualização
      setError(err.message || "Erro ao atualizar usuário. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
      // Use classes CSS diferentes ou adapte as existentes
      <div className='area-edit-usuario-overlay' onClick={handleOverlayClick}>
        <div className='edit-usuario-content' onClick={(e) => e.stopPropagation()}>
          {/* Título Atualizado */}
          <h3 className='h3-form-edit-usuario'>Editar Usuário</h3>

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
                   <>
                    {/* Adiciona uma opção padrão caso o usuário não tenha faculdade ou ela não exista mais */}
                    <option value="" disabled={faculdadeId !== ''}>Selecione...</option>
                    {faculdadesList.map(fac => (
                        <option key={fac.id} value={fac.id}>{fac.nome}</option>
                    ))}
                   </>
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

            {/* Botões Atualizados */}
            <div className='area-edit-usuario-buttons'>
              <button
                  type="submit"
                  className='button-edit-usuario' // Classe atualizada
                  disabled={loading}
              >
                {loading ? "Salvando..." : "Salvar Alterações"}
              </button>
              <button
                  type="button"
                  className='button-cancel-edit-usuario' // Classe atualizada
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

export default EditUsuarioModal;