import React from 'react';
import './SelectDataHistorico.css';

const SelectDataHistorico = ({ onDateChange, selectedDate }) => {

  const handleDateChange = (e) => {
    // Obtém a string YYYY-MM-DD diretamente do input
    const dateString = e.target.value;

    if (onDateChange) {
      // Passa a STRING "YYYY-MM-DD" para o componente pai
      onDateChange(dateString);
    }
  };

  // Função auxiliar para formatar a data para exibição no input
  // Lida com string ou objeto Date
  const formatDateForInput = (date) => {
    if (!date) { return ''; }

    // Se 'date' for uma string (já no formato correto), retorna diretamente
    if (typeof date === 'string') { return date; }

    // Se 'date' for um objeto Date, formata usando toISOString()
    if (date instanceof Date && !isNaN(date)) {
      // Usar toISOString e split para garantir o formato YYYY-MM-DD
      // Independente do fuso horário do navegador para a *exibição* inicial
      const offset = date.getTimezoneOffset();
      const adjustedDate = new Date(date.getTime() - (offset*60*1000)); // Ajusta para UTC 00:00
      return adjustedDate.toISOString().split('T')[0];
    }
    return ''; // Retorna vazio se a data for inválida
  };


  return (
    <div className='content-select-data-historico'>
      <p>Selecione a data:</p>
      <input
        type="date"
        className='input-date-historico'
        value={formatDateForInput(selectedDate)} // Formata para exibição
        onChange={handleDateChange}
      />
    </div>
  );
};

export default SelectDataHistorico;