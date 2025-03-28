import React from 'react'; // Import React
import './FiltroPassagens.css';
import { BsArrowCounterclockwise } from "react-icons/bs";

// Função auxiliar para formatar Date para "YYYY-MM-DD"
const formatDateForInput = (date) => {
  if (!date) return '';
  if (date instanceof Date && !isNaN(date)) {
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
    return adjustedDate.toISOString().split('T')[0];
  }
  if (typeof date === 'string') { // Se já for string YYYY-MM-DD
      // Validar formato básico
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return date;
      }
  }
  return ''; // Retorna vazio se inválido
};

const FiltroPassagens = ({
  startDate,
  endDate,
  viagemFilter,
  onStartDateChange,
  onEndDateChange,
  onViagemChange,
  onClearFilters
}) => {

  const handleStartDateChange = (e) => {
    onStartDateChange(e.target.value); // Passa a string YYYY-MM-DD
  };

  const handleEndDateChange = (e) => {
    onEndDateChange(e.target.value); // Passa a string YYYY-MM-DD
  };

  const handleViagemChange = (e) => {
    onViagemChange(e.target.value); // Passa o valor selecionado ('todos', 'ida', etc.)
  };

  return (
    <div className='card-filtro-passagens'>
      <div className='titulo-filtros-passagens'>
        <h3>Filtros</h3>
        <button className='button-limpar-filtros' onClick={onClearFilters}> {/* Chama onClearFilters */}
          <BsArrowCounterclockwise /> Limpar filtros
        </button>
      </div>
      <div className='area-campos-filtros'>
        <label className='campo-filtro'>
          <span>Período:</span>
          <div className='area-inputs-date'>
            <input
              className='input-date'
              type="date"
              name='periodo-inicio'
              id='periodo-inicio'
              value={formatDateForInput(startDate)} // Controlado pelo estado do pai
              onChange={handleStartDateChange} // Chama o handler
            />
            <span>-</span>
            <input
              className='input-date'
              type="date"
              name="periodo-fim"
              id="periodo-fim"
              value={formatDateForInput(endDate)} // Controlado pelo estado do pai
              onChange={handleEndDateChange} // Chama o handler
            />
          </div>
        </label>
        <label className='campo-filtro'>
          <span>Viagem: </span>
          <select
            className='select-passagem'
            name="tipo-viagem-passagem"
            id="tipo-viagem-passagem"
            value={viagemFilter} // Controlado pelo estado do pai
            onChange={handleViagemChange} // Chama o handler
          >
            <option value="todos">Todos</option>
            <option value="bate-volta">Bate-volta</option>
            <option value="ida">Ida</option>
            <option value="volta">Volta</option>
          </select>
        </label>
      </div>
    </div>
  );
};

export default FiltroPassagens;