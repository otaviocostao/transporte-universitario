// Ajustes.jsx Simplificado

import React from 'react';
// Remova useNavigate, useState, useEffect se não forem mais usados para a verificação
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../contexts/AuthContext'; // Mantenha se precisar de currentUser para algo mais
import GerenciarFaculdades from '../../components/Ajustes/GerenciarFaculdades/GerenciarFaculdades';
import GerenciarUsuarios from '../../components/Ajustes/GerenciarUsuarios/GerenciarUsuarios';
import BarraNavegacao from '../../components/BarraNavegacao/BarraNavegacao';
import './Ajustes.css';

function Ajustes() {
  // Não precisa mais da verificação interna, pois AdminRoute protege a rota

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