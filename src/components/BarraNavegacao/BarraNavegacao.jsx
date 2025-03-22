import { useState } from 'react';
import './BarraNavegacao.css';
import { BsList } from "react-icons/bs";
import MenuLateral from '../MenuLateral/MenuLateral';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const BarraNavegacao = () => {
  const [showMenu, setShowMenu] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleMenuClick = () => {
    setShowMenu(true);
  };
  
  const handleCloseMenu = () => {
    setShowMenu(false);
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };
  
  return (
    <div className="nav-bar">
      <h2>Transporte universitário</h2>
      <div className="navbar-user-area">
        <button className='menu-button' onClick={handleMenuClick}>
          <BsList />
        </button>
      </div>

      <MenuLateral 
        isOpen={showMenu}
        onClose={handleCloseMenu}
        onLogout={handleLogout}
      />
    </div>
  );
};

export default BarraNavegacao;
