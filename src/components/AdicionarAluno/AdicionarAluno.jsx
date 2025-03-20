import { useState } from 'react';
import './AdicionarAluno.css';

const AdicionarAluno = ({ isOpen, onClose }) => {
  const [nome, setNome] = useState('');
  const [faculdade, setFaculdade] = useState('uefs'); // Valor inicial para o select
  const [viagem, setViagem] = useState('bate-volta'); // Valor inicial

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event) => {
    event.preventDefault(); // Impede o comportamento padrão do form (recarregar a página)

    // Aqui você faria algo com os dados do formulário (ex: enviar para uma API)
    console.log('Dados do aluno:', { nome, faculdade, viagem });
    setNome('');
    setFaculdade('uefs');
    setViagem('bate-volta');
    onClose();
  };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

  return (
    <div className='area-add-student-overlay' onClick={handleOverlayClick}>
      <div className='add-student-content' onClick={(e) => e.stopPropagation()}>
        <h3 className='h3-form-add-student'>Adicionar nome na lista</h3>
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
          <div className='area-add-student-buttons'>
            <button type="submit" className='button-add-student'>Adicionar</button> {/* type="submit" */}
            <button type="button" className='button-cancel-add-student' onClick={onClose}>Cancelar</button> {/* type="button" e onClick */}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdicionarAluno;