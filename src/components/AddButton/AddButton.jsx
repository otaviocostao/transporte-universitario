import { useState, useEffect } from 'react';
import './AddButton.css';
import AdicionarAluno from '../AdicionarAluno/AdicionarAluno';

const AddButton = ({ onDateChange, selectedDate }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());

  useEffect(() => {
    if (!selectedDate) {
      const today = new Date();
      setCurrentDate(today);
      if (onDateChange) {
        onDateChange(today);
      }
    }
  }, [selectedDate, onDateChange]);

  const handleClickAddForm = () => {
    setShowAddForm(true);
  };

  const handleCloseAddForm = () => {
    setShowAddForm(false);
  };

  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    setCurrentDate(newDate);
    if (onDateChange) {
      onDateChange(newDate);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className='add-button-area'>
      <div className="date-area">
        <p className='paragraph-date'>Lista do dia: </p>
        <span>{formatDate(currentDate)}</span>
      </div>
      <button className='add-button' onClick={handleClickAddForm}>
        Adicionar
      </button>

      {showAddForm && (
        <AdicionarAluno 
          isOpen={showAddForm}
          onClose={handleCloseAddForm}
          selectedDate={currentDate}
        />
      )}
    </div>
  );
};

export default AddButton;
