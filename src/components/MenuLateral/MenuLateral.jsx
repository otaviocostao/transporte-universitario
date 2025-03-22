import './MenuLateral.css'
import { BsArrowLeft, BsBoxArrowRight } from "react-icons/bs";

const MenuLateral = ({ isOpen, onClose, onLogout }) => {
  if(!isOpen) {
    return null;
  }

  return (
    <div className='menu-area-overlay' onClick={onClose}>
      <div className='menu-content' onClick={(e) => e.stopPropagation()}>
        <div className='back-button-area'>
          <button className='back-button' onClick={onClose}>
            <BsArrowLeft />
            <p>Voltar</p>
          </button>
        </div>
        <div className='menu-buttons-area'>
          <div className='area-sidebar-button'>
            <a href="/" className='menu-sidebar-button'>Início</a>
          </div>
          <div className='area-sidebar-button'>
            <a href="/historico" className='menu-sidebar-button'>Histórico</a>
          </div>
          <div className='area-sidebar-button'>
            <a href="/passagens" className='menu-sidebar-button'>Passagens</a>
          </div>
          <div className='area-sidebar-button'>
            <a href="/pagamentos" className='menu-sidebar-button'>Pagamentos</a>
          </div>
          <div className='area-sidebar-button logout-button-area'>
            <button 
              className='menu-sidebar-button logout-button' 
              onClick={onLogout}
            >
              <span className="logout-text">Sair</span>
              <BsBoxArrowRight className="logout-icon" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MenuLateral;