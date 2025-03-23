import { useState } from 'react';
import './AddPassagem.css';
import FormAdicionarPassagem from '../FormAdicionarPassagem/FormAdicionarPassagem';

const AddPassagem = () => {
  const [showFormPassagem, setShowFormPassagem] = useState(false);

  const handleClickAddPassagem = () => {
    setShowFormPassagem(true);
  };

  const handleCloseAddPassagem = () => {
    setShowFormPassagem(false);
  };

  return (
    <div className='content-adicionar-passagem'>
      <h2>Passagens</h2>
      <button className='add-passagem-button' onClick={handleClickAddPassagem}>
        Adicionar
      </button>

      {/* Adiciona o container do modal */}
      {showFormPassagem && (
        <div className="modal-container">
          <FormAdicionarPassagem
            isOpen={showFormPassagem}
            onClose={handleCloseAddPassagem}
          />
        </div>
      )}
    </div>
  );
};

export default AddPassagem;