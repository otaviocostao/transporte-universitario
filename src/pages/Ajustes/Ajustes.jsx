import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Para redirecionar se não for admin
import { useAuth } from '../../contexts/AuthContext'; // SEU CONTEXTO DE AUTENTICAÇÃO
import GerenciarFaculdades from '../../components/Ajustes/GerenciarFaculdades/GerenciarFaculdades';
import GerenciarUsuarios from '../../components/Ajustes/GerenciarUsuarios/GerenciarUsuarios';
import BarraNavegacao from '../../components/BarraNavegacao/BarraNavegacao'; // Assumindo que você a use aqui
import './Ajustes.css';

function Ajustes() {
  const { currentUser, isAdmin } = useAuth(); // Obtenha o usuário e a verificação de admin do seu AuthContext
  const navigate = useNavigate();
  const [loadingCheck, setLoadingCheck] = useState(true);

  useEffect(() => {
    // Verifica se o usuário está logado e é admin
    // Adapte a lógica de isAdmin conforme sua implementação
    if (!currentUser || isAdmin) {
       console.log("Acesso negado. Usuário não é admin ou não está logado.");
       navigate('/'); // Redireciona para a home se não for admin
    } else {
        setLoadingCheck(false); // Permite renderizar o conteúdo
    }
    // Certifique-se que seu useAuth lida com o estado de carregamento inicial
  }, [currentUser, isAdmin, navigate]);

  if (loadingCheck) {
    return <div>Verificando permissões...</div>; // Ou um spinner
  }

  // Renderiza o conteúdo apenas se for admin
  return (
    <div className="ajustes-container">
      <BarraNavegacao />
      <div className="ajustes-content">
        <h1>Ajustes da Plataforma</h1>
        <div className="ajustes-section">
          <GerenciarFaculdades />
        </div>
        <div className="ajustes-section">
          <GerenciarUsuarios />
        </div>
      </div>
    </div>
  );
}

export default Ajustes;