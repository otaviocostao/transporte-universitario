import { useEffect, useState } from 'react';
import './AddPassagem.css';
import FormAdicionarPassagem from '../FormAdicionarPassagem/FormAdicionarPassagem';

const AddPassagem = ({onDateChange, selectedDate}) => {
  const [showFormPassagem, setShowFormPassagem] = useState(false);
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());

  useEffect(() => {
    if(!selectedDate){
      const today = new Date();
      setCurrentDate(today);
      if(onDateChange) {
        onDateChange(today);
      }
    }
  }, [selectedDate, onDateChange])

  const handleClickAddPassagem = () => {
    setShowFormPassagem(true);
  };

  const handleCloseAddPassagem = () => {
    setShowFormPassagem(false);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR');
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
            selectedDate={selectedDate}
          />
        </div>
      )}
    </div>
  );
};

export default AddPassagem;