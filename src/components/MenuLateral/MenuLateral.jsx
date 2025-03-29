import './MenuLateral.css'
import { BsArrowLeft, BsBoxArrowRight, BsClockHistory, BsTicket, BsSliders2, BsHouse } from "react-icons/bs";


const MenuLateral = ({ isOpen, onClose, onLogout }) => {
  return (
    <div className={`menu-area-overlay ${isOpen ? "open" : ""}`} onClick={onClose}>
      <div className='menu-content' onClick={(e) => e.stopPropagation()}>
        <div className='sidebar-header'>
          <div className='back-button-area'>
            <button className='back-button' onClick={onClose}>
              <BsArrowLeft />
              <p>Voltar</p>
            </button>
          </div>
        </div>
        <div className='menu-buttons-area'>
          <div className='area-sidebar-button'>
            <BsHouse className='sb-button-icon'/>
            <a href="/" className='menu-sidebar-button'>Início</a>
          </div>
          <div className='area-sidebar-button'>
            <BsClockHistory className='sb-button-icon'/>
            <a href="/historico" className='menu-sidebar-button'>Histórico</a>
          </div>
          <div className='area-sidebar-button'>
            <BsTicket className='sb-button-icon'/>
            <a href="/passagens" className='menu-sidebar-button'>Passagens</a>
          </div>
          <div className='area-sidebar-button'>
            <BsSliders2 className='sb-button-icon'/>
            <a href="/ajustes" className='menu-sidebar-button'>Ajustes</a>
          </div>
        </div>
        <div className='sidebar-footer'>
          <div className='area-sidebar-button-logout-area'>
            <a className='menu-sidebar-button-logout' onClick={onLogout}>
              <BsBoxArrowRight className="sb-button-icon" />
              <span className="logout-text">Sair</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MenuLateral;
