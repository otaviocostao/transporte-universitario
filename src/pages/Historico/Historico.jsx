import React, { useState, useEffect } from 'react';
import BarraNavegacao from '../../components/BarraNavegacao/BarraNavegacao';
import ListaHistorico from '../../components/ListaHistorico/ListaHistorico';
import SelectDataHistorico from '../../components/SelectDataHistorico/SelectDataHistorico';
import { subscribeToStudents } from '../../services/studentService';
import './Historico.css';

// Função auxiliar para obter a data de hoje no formato YYYY-MM-DD local
const getTodayString = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const adjustedDate = new Date(today.getTime() - (offset*60*1000));
    return adjustedDate.toISOString().split('T')[0];
};


function Historico() {
  // Inicializa selectedDate com a data de hoje no formato YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Converte a string YYYY-MM-DD para um objeto Date LOCAL (meia-noite)
    // Adiciona 'T00:00:00' para garantir que seja meia-noite no fuso local
    const dateObj = new Date(selectedDate + 'T00:00:00');

    // Verifica se a data criada é válida
     if (isNaN(dateObj.getTime())) {
        setError('Data inválida selecionada.');
        setLoading(false);
        setStudents([]);
        return () => {}; // Retorna função vazia se a data for inválida
    }


    const unsubscribe = subscribeToStudents(dateObj, (updatedStudents, err) => {
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
  }, [selectedDate]); // Depende da string selectedDate

  const handleDateChange = (dateString) => { // Recebe a string YYYY-MM-DD
    setSelectedDate(dateString); // Atualiza o estado com a string
  };

  return (
    <div className="historico-container">
      <BarraNavegacao />
      <div className='historico-content'>
        <main>
          <div className='titulo-historico'>
            <h2>Histórico</h2>
          </div>
          <SelectDataHistorico
            selectedDate={selectedDate} // Passa a string YYYY-MM-DD
            onDateChange={handleDateChange}
          />
          <ListaHistorico
            students={students}
            loading={loading}
            error={error}
            // selectedDate={selectedDate} // Não é mais necessário passar para ListaHistorico
          />
        </main>
      </div>
    </div>
  );
}

export default Historico;