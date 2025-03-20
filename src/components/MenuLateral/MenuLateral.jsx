import './MenuLateral.css'
import { BsArrowLeft } from "react-icons/bs";


const MenuLateral = ({isOpen, onClose}) => {
  if(!isOpen){
    return null;
  }

  return (
    <div className='menu-area-overlay' onClick={onClose}>
      <div className='menu-content' onClick={(e) => e.stopPropagation()}>
        <div className='back-button-area'>
            <button href="" className='back-button' onClick={onClose}>
              <BsArrowLeft />
              <p>Voltar</p>
            </button>
        </div>
            <div className='menu-buttons-area'>
              <div className='area-sidebar-button'>
              <a href="" className='menu-sidebar-button'>Início</a>
              </div>
              <div className='area-sidebar-button'>
                <a href="" className='menu-sidebar-button'>Histórico</a>

              </div>
              <div className='area-sidebar-button'>
                <a href="" className='menu-sidebar-button'>Passagens</a>

              </div>
              <div className='area-sidebar-button'>
                <a href="" className='menu-sidebar-button'>Pagamentos</a>
              </div>
                
            </div>
        </div>
    </div>
  )
}

export default MenuLateral
