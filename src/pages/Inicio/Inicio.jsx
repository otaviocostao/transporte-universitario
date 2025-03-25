import React, { useState, useEffect } from 'react';
import BarraNavegacao from '../../components/BarraNavegacao/BarraNavegacao';
import AddButton from '../../components/AddButton/AddButton';
import ListaAlunos from '../../components/ListaAlunos/ListaAlunos';
import { subscribeToStudents } from '../../services/studentService';
import './Inicio.css';

function Inicio() {
  const [selectedDate, setSelectedDate] = useState(new Date()); // Inicializa com um objeto Date
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



  return (
    <div className="inicio-container">
      <BarraNavegacao />
      <div className='inicio-content'>
        <main className="inicio-content">
          <AddButton
            selectedDate={selectedDate}
          />
          <ListaAlunos
            students={students}
            loading={loading}
            error={error}
            selectedDate={selectedDate}
          />
        </main>
      </div>
    </div>
  );
}

export default Inicio;