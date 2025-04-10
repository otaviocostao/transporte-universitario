import React, { useState } from 'react'; // Importe useState
import './FormAdicionarPassagem.css';
import { addStudent } from '../../services/studentService';
import { addPassagem } from '../../services/passagensService';

const FormAdicionarPassagem = ({ isOpen, onClose, onConfirm }) => {
  const [nome, setNome] = useState('');
  const [destino, setDestino] = useState('');
  const [viagem, setViagem] = useState('bate-volta'); 
  const [valor, setValor] = useState('');

  const[loading, setLoading] = useState(false);
  const[error, setError] = useState(null);

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

    const handleSubmit = async (e) => {
      e.preventDefault(); 

      if(!nome.trim()){
        setError("O nome do passageiro é obrigarório")
      }
      
      if(!destino.trim()){
        setError("O destino do passageiro é obrigarório")
      }
      
      if (!valor.trim() || isNaN(parseFloat(valor))) {
        setError("O valor da passagem é obrigatório e deve ser um número.");
        return;
    }

      try{
        setLoading(true);
        setError(null);

        await addPassagem({nome, destino, viagem, valor});
      
        setNome('');
        setDestino('');
        setViagem('bate-volta');
        setValor('');
        onClose();
      }catch(err){
        console.error("Erro ao adicionar passagem: ", err);
        setError("Erro ao adicionar passagem. Tente novamente.");
      }finally{
        setLoading(false);
      };
    };

  return (
    <div className='area-add-passagem-overlay' onClick={handleOverlayClick}>
      <div className='add-passagem-content' onClick={(e) => e.stopPropagation()}>
        <h3 className='h3-form-add-passagem'>Adicionar nova passagem</h3>

        {error && <div className="error-message">{error}</div>}

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
              Adicionar
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

export default FormAdicionarPassagem;