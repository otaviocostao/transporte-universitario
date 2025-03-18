import './AddButton.css'

const AddButton = () => {
  return (
    <div className='add-button-area'>
        <div className="date-area">
            <p className='paragraph-date'>Lista do dia: </p>
            <span>17/03/2025</span>
        </div>
      <button className='add-button'>
        Adicionar
      </button>
    </div>
  )
}

export default AddButton
