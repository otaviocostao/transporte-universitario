import React, { useState, useEffect } from 'react';
import './EditarPassagem.css';
import { updatePassagem } from '../../services/passagensService';

const EditarPassagem = ({ isOpen, onClose, onConfirm, passagem }) => {
  const [nome, setNome] = useState('');
  const [destino, setDestino] = useState('');
  const [viagem, setViagem] = useState('bate-volta');
  const [valor, setValor] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Estado para erros

  useEffect(() => {
    if (passagem) {
      setNome(passagem.nome);
      setDestino(passagem.destino);
      setViagem(passagem.viagem);
      setValor(passagem.valor);
    }
  }, [valor]);

  if (!isOpen) {
    return null;
  }

 const handleSubmit = async (event) => {
    event.preventDefault();

    if (!nome.trim()) {
      setError("O nome da passagem é obrigatório.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const updatedPassagem = await updatePassagem(passagem.id, { nome, destino, viagem, valor });
      onConfirm(updatedPassagem);
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar passagem:", error);
      setError("Erro ao atualizar passagem. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className='area-edit-student-overlay' onClick={handleOverlayClick}>
      <div className='edit-student-content' onClick={(e) => e.stopPropagation()}>
        <h3 className='h3-form-edit-student'>Editar Passagem</h3>

        {error && <div className="error-message">{error}</div>} {/* Exibe mensagem de erro */}

        <form onSubmit={handleSubmit}>
          <label className='add-text-area'>
            <span>Nome: </span>
            <input
              type="text"
              id='name-passagem'
              value={nome} // Controla o valor
              onChange={(e) => setNome(e.target.value)} // Atualiza o estado
              disabled={loading}
            />
          </label>
          <label className='add-text-area'>
            <span>Destino:</span>
            <input
              type='text'
              name="destino-passagem"
              id="destino-passagem"
              value={destino} // Controla o valor
              onChange={(e) => setDestino(e.target.value)} // Atualiza o estado
              disabled={loading}
            />
          </label>
          <label className='add-select-area'>
            <span>Viagem:</span>
            <select
              name="viagem"
              id="viagem"
              value={viagem}
              onChange={(e) => setViagem(e.target.value)}
              disabled={loading}
            >
              <option value="bate-volta">Ida e volta</option>
              <option value="ida">Ida</option>
              <option value="volta">Volta</option>
            </select>
          </label>
          <label className='add-text-area' id='input-valor-passagem'>
            <span>Valor:</span>
            <input
              type="text" 
              name="valor"
              id="valor"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              disabled={loading}
            />
          </label>
          <div className='area-add-student-buttons'>
            <button type="submit" className='button-add-student' disabled={loading}>
              Salvar
            </button>
            <button
              type="button"
              className='button-cancel-add-student'
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

export default EditarPassagem;