import React, { useState, useEffect } from 'react';
import BarraNavegacao from '../../components/BarraNavegacao/BarraNavegacao';
import AddButton from '../../components/AddButton/AddButton';
import ListaAlunos from '../../components/ListaAlunos/ListaAlunos';
import { subscribeToStudents } from '../../services/studentService';
import './Inicio.css';
import ListaPassagensInicio from '../../components/ListaPassagensInicio/ListaPassagensInicio';
import { subscribeToPassagens } from '../../services/passagensService';
import { getFaculdadesList } from '../../services/ajustesService';
import Footer from '../../components/Footer/Footer';

function Inicio() {
  const [selectedDate, setSelectedDate] = useState(new Date()); 
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [passagens, setPassagens] = useState([]);

  const [faculdades, setFaculdades] = useState([]);

  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());

    useEffect(() => {
      const fetchFaculdades = async () => {
        try {
          const lista = await getFaculdadesList();
            setFaculdades(lista);
            } catch (err) {
              console.error("Erro ao buscar lista de faculdades:", err);
              setError("Não foi possível carregar as faculdades para o formulário.");
            }
            };
            fetchFaculdades();
    }, []);

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

  useEffect(() => {
    setLoading(true);
    setError(null);

  const listaPassagens = subscribeToPassagens(selectedDate, (updatedPassagens, err) => {
    if (err) {
      setError(err.message || 'Erro ao carregar dados.');
      setLoading(loading);
      setPassagens([]);
      return;
    }
    setPassagens(updatedPassagens);
    setLoading(false);
  });

    return () => listaPassagens();
  }, [selectedDate]);

  
  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="inicio-container">
      <BarraNavegacao />
      <div className='inicio-content'>
        <main className="inicio-content">
          
          <ListaAlunos
            students={students}
            loading={loading}
            error={error}
            selectedDate={selectedDate}
            faculdadesList={faculdades}
          />
          <ListaPassagensInicio 
            passagens={passagens}
            loading={loading}
            error={error}
            selectedDate={selectedDate}
          />
          <Footer />
        </main>
      </div>
    </div>
  );
}

export default Inicio;