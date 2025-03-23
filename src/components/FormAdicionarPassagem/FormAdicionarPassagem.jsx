import React, { useState } from 'react'; // Importe useState
import './FormAdicionarPassagem.css';

const FormAdicionarPassagem = ({ isOpen, onClose, onConfirm }) => {
  const [nome, setNome] = useState('');
  const [destino, setDestino] = useState('uefs'); // Valor inicial
  const [viagem, setViagem] = useState('bate-volta'); // Valor inicial
  const [valor, setValor] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

    const handleSubmit = (e) => {
      e.preventDefault(); // IMPEDE o recarregamento da página

       // Aqui você chamaria onConfirm, depois de validar os dados
      // Exemplo: onConfirm({ nome, destino, viagem, valor });

      // Limpa os campos (opcional)
       setNome('');
       setDestino('uefs');
       setViagem('bate-volta');
       setValor('');

      onClose(); // Fecha o modal
    };

  return (
    <div className='area-add-passagem-overlay' onClick={handleOverlayClick}>
      <div className='add-passagem-content' onClick={(e) => e.stopPropagation()}>
        <h3 className='h3-form-add-passagem'>Adicionar nova passagem</h3>
        <form onSubmit={handleSubmit}> {/* Adiciona o onSubmit aqui */}
          <label className='add-text-area'>
            <span>Nome: </span>
            <input
              type="text"
              id='name-aluno'
              value={nome} // Controla o valor
              onChange={(e) => setNome(e.target.value)} // Atualiza o estado
            />
          </label>
          <label className='add-select-area'>
            <span>Destino:</span>
            <select
              name="faculdade-aluno"
              id="faculdade-aluno"
              value={destino} // Controla o valor
              onChange={(e) => setDestino(e.target.value)} // Atualiza o estado

            >
              <option value="uefs">UEFS</option>
              <option value="pitagoras">Pitagoras</option>
              <option value="unifan">UNIFAN</option>
              <option value="fat">FAT</option>
              <option value="unef">UNEF</option>
            </select>
          </label>
          <label className='add-select-area'>
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
          <label className='add-text-area' id='input-valor-passagem'>
            <span>Valor:</span>
            <input
              type="text" // Adicione type="text"
              name="valor"
              id="valor"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
            />
          </label>
          <div className='area-add-student-buttons'>
            <button type="submit" className='button-add-student'>
              Adicionar
            </button>
            <button
              type="button"
              className='button-cancel-add-student'
              onClick={onClose}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormAdicionarPassagem;