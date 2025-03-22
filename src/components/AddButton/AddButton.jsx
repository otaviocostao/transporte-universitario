import { useState } from 'react'
import './AddButton.css'
import AdicionarAluno from '../AdicionarAluno/AdicionarAluno';

const AddButton = ({ onDateChange, selectedDate }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  
  const handleClickAddForm = () => {
    setShowAddForm(true);
  }

  const handleCloseAddForm = () => {
    setShowAddForm(false);
  }
  
  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    if (onDateChange) {
      onDateChange(newDate);
    }
  };
  
  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR');
  };
  
  const getISODate = (date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className='add-button-area'>
      <div className="date-area">
        <p className='paragraph-date'>Lista do dia: </p>
        <span>{formatDate(selectedDate)}</span>
      </div>
      <button className='add-button' onClick={() => handleClickAddForm()}>
        Adicionar
      </button>

      {showAddForm && (
        <AdicionarAluno 
          isOpen={showAddForm}
          onClose={handleCloseAddForm}
          selectedDate={selectedDate}
        />
      )}
    </div>
  )
}

export default AddButton;