import { useState } from 'react';
import './BarraNavegacao.css'
import { BsList } from "react-icons/bs";
import MenuLateral from '../MenuLateral/MenuLateral';

const BarraNavegacao = () => {
  
  const [showMenu, setShowMenu] = useState(false);
  
  const handleMenuClick = () =>{
    setShowMenu(true);
  };
  
  const handleCloseMenu = () => {
    setShowMenu(false);
  };
  return (
    <div className="nav-bar">
        <h2>Transporte universitário</h2>
        <button className='menu-button' onClick={() => handleMenuClick()}><BsList /></button>

        {showMenu && (
          <MenuLateral 
          isOpen={showMenu}
          onClose={handleCloseMenu}/>
        )}
    </div>
  )
}

export default BarraNavegacao
