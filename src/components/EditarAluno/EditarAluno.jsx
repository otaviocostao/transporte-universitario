import React, { useState, useEffect } from 'react';
import { updateStudent } from '../../services/studentService'; // Importe a função
import './EditarAluno.css';

const EditarAluno = ({ isOpen, onClose, onConfirm, aluno }) => {
  const [nome, setNome] = useState('');
  const [faculdade, setFaculdade] = useState('uefs');
  const [viagem, setViagem] = useState('bate-volta');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Estado para erros

  useEffect(() => {
    if (aluno) {
      setNome(aluno.nome);
      setFaculdade(aluno.faculdade);
      setViagem(aluno.viagem);
    }
  }, [aluno]);

  if (!isOpen) {
    return null;
  }

 const handleSubmit = async (event) => {
    event.preventDefault();

    if (!nome.trim()) {
      setError("O nome do aluno é obrigatório.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const updatedAluno = await updateStudent(aluno.id, { nome, faculdade, viagem });
      onConfirm(updatedAluno); // Passa o aluno atualizado

    } catch (error) {
      console.error("Erro ao atualizar aluno:", error);
      setError("Erro ao atualizar aluno. Tente novamente.");
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
        <h3 className='h3-form-edit-student'>Editar Aluno</h3>

        {error && <div className="error-message">{error}</div>} {/* Exibe mensagem de erro */}

        <form onSubmit={handleSubmit}>
          <label className='edit-text-area'>
            <span>Nome: </span>
            <input
              type="text"
              id='name-aluno'
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={loading}
            />
          </label>
          <label className='edit-select-area'>
            <span>Faculdade:</span>
            <select
              name="faculdade-aluno"
              id="faculdade-aluno"
              value={faculdade}
              onChange={(e) => setFaculdade(e.target.value)}
              disabled={loading}
            >
              <option value="uefs">UEFS</option>
              <option value="pitagoras">Pitagoras</option>
              <option value="unifan">UNIFAN</option>
              <option value="fat">FAT</option>
              <option value="unef">UNEF</option>
            </select>
          </label>
          <label className='edit-select-area'>
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
          <div className='area-edit-student-buttons'>
            <button
              type="submit"
              className='button-edit-student'
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
            <button
              type="button"
              className='button-cancel-edit-student'
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

export default EditarAluno;