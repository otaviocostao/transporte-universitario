import { useState } from 'react'
import './AddButton.css'
import AdicionarAluno from '../AdicionarAluno/AdicionarAluno';

const AddButton = () => {

  const [showAddForm, setShowAddForm] = useState(false);

  const handleClickAddForm = () => {
    setShowAddForm(true);
  }

  const handleCloseAddForm = () => {
    setShowAddForm(false);
  }

  return (
    <div className='add-button-area'>
        <div className="date-area">
            <p className='paragraph-date'>Lista do dia: </p>
            <span>17/03/2025</span>
        </div>
      <button className='add-button' onClick={() => handleClickAddForm()}>
        Adicionar
      </button>

      {showAddForm && (
        <AdicionarAluno 
          isOpen={showAddForm}
          onClose={handleCloseAddForm}
        />
      )}
    </div>
  )
}

export default AddButton
