import './SelectDataHistorico.css'

const SelectDataHistorico = ({onDateChange, selectedDate}) => {

  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    if (onDateChange) {
      onDateChange(newDate);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR');
  };
  
  const getISODate = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date)) {
      return '';
    }
    return date.toISOString().split('T')[0];
  };
  
  return (
    <div className='content-select-data-historico'>
      <p>Selecione a data:</p>
      <input 
        type="date" 
        className='input-date-historico'
        value={getISODate(selectedDate)}
        onChange={handleDateChange}
      />
    </div>
  )
}

export default SelectDataHistorico
