import React, { useState, useEffect } from 'react';
import BarraNavegacao from '../../components/BarraNavegacao/BarraNavegacao';
import ListaHistorico from '../../components/ListaHistorico/ListaHistorico';
import SelectDataHistorico from '../../components/SelectDataHistorico/SelectDataHistorico';
import { subscribeToStudents } from '../../services/studentService';
import './Historico.css';

function Historico() {
    const [selectedDate, setSelectedDate] = useState(new Date());
        const [students, setStudents] = useState([]);
        const [loading, setLoading] = useState(true);
    
        useEffect(() => {
            // Configurar listener em tempo real para alunos
            const unsubscribe = subscribeToStudents(selectedDate, (updatedStudents) => {
                setStudents(updatedStudents);
                setLoading(false);
            });
            
            // Limpar listener ao desmontar
            return () => unsubscribe();
        }, [selectedDate]);
    
        const handleDateChange = (date) => {
            setSelectedDate(date);
            setLoading(true);
        };
    

    return (
        <div className="historico-container">
            <BarraNavegacao />
            <div className='historico-content'>
                <main className="historico-content">
                    <div className='titulo-historico'>
                        <h2>Histórico</h2>
                    </div>
                    <SelectDataHistorico />
                    <ListaHistorico
                    students={students}
                    loading={loading}
                    selectedDate={selectedDate} />
                </main>
            </div>
        </div>
    );
}

export default Historico;