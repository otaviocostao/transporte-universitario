import React, { useState, useEffect } from 'react';
import BarraNavegacao from '../../components/BarraNavegacao/BarraNavegacao';
import ListaHistorico from '../../components/ListaHistorico/ListaHistorico';
import SelectDataHistorico from '../../components/SelectDataHistorico/SelectDataHistorico';
import { subscribeToStudents } from '../../services/studentService'; // Ajuste o caminho, se necessário
import './Historico.css';

function Historico() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null); 

    const unsubscribe = subscribeToStudents(selectedDate, (updatedStudents, err) => {
      if (err) {
        setError(err.message || 'Erro ao carregar dados.');
        setLoading(false);
        setStudents([]);
        return;
      }
      setStudents(updatedStudents);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedDate]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  return (
    <div className="historico-container">
      <BarraNavegacao />
      <div className='historico-content'>
        <main className='historico-content'>
          <div className='titulo-historico'>
            <h2>Histórico</h2>
          </div>
          <SelectDataHistorico
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
          />
          <ListaHistorico
            students={students}
            loading={loading}
            error={error} // Passa o estado de erro
          />
        </main>
      </div>
    </div>
  );
}

export default Historico;