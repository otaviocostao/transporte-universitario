import React, { useState, useEffect } from 'react'; // Importe useEffect
import './EditarAluno.css';

const EditarAluno = ({ isOpen, onClose, onConfirm, aluno }) => {
  const [nome, setNome] = useState('');
  const [faculdade, setFaculdade] = useState('uefs');
  const [viagem, setViagem] = useState('bate-volta');

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

  const handleSubmit = (event) => {
    event.preventDefault();

    onConfirm({ id: aluno.id, nome, faculdade, viagem });
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className='area-edit-student-overlay' onClick={handleOverlayClick}>
      <div className='edit-student-content' onClick={(e) => e.stopPropagation()}>
        <h3 className='h3-form-edit-student'>Editar</h3>
        <form onSubmit={handleSubmit}>
          <label className='text-area'>
            <span>Nome: </span>
            <input
              type="text"
              id='name-aluno'
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </label>
          <label className='select-area'>
            <span>Faculdade:</span>
            <select
              name="faculdade-aluno"
              id="faculdade-aluno"
              value={faculdade}
              onChange={(e) => setFaculdade(e.target.value)}
            >
              <option value="uefs">UEFS</option>
              <option value="pitagoras">Pitagoras</option>
              <option value="unifan">UNIFAN</option>
              <option value="fat">FAT</option>
              <option value="unef">UNEF</option>
            </select>
          </label>
          <label className='select-area'>
            <span>Viagem:</span>
            <select
              name="viagem"
              id="viagem"
              value={viagem}
              onChange={(e) => setViagem(e.target.value)}
            >
              <option value="bate-volta">Ida e volta</option>
              <option value="ida">Ida</option>
              <option value="volta">Volta</option>
            </select>
          </label>
          <div className='area-edit-student-buttons'>
            <button type="submit" className='button-edit-student' onClick={onConfirm}>Salvar</button>
            <button type="button" className='button-cancel-edit-student' onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarAluno;