import './ModalDelete.css'

const ModalDelete = ({isOpen, onClose, children, onConfirm}) => {
    if(!isOpen){
        return null;
    }

  return (
    <div className='modal-delete-overlay' onClick={onClose}>
        <div className='modal-delete-content' onClick={(e) => e.stopPropagation()}>
            {children}
            <div className='modal-delete-buttons'>
                <button className='modal-delete-confirm' onClick={onConfirm}>Remover</button>
                <button className='modal-delete-cancel' onClick={onClose}>Cancelar</button>
            </div>
        </div>
    </div>
  )
}

export default ModalDelete
