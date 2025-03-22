import React, { useState, useEffect } from 'react';
import BarraNavegacao from '../../components/BarraNavegacao/BarraNavegacao'; 
import AddButton from '../../components/AddButton/AddButton';
import ListaAlunos from '../../components/ListaAlunos/ListaAlunos';
import { subscribeToStudents } from '../../services/studentService';
import './Inicio.css';

function Inicio() {
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
        <div className="inicio-container">
            <BarraNavegacao />
            <div className='inicio-content'>
                <main className="inicio-content">
                    <AddButton 
                        onDateChange={handleDateChange} 
                        selectedDate={selectedDate} 
                    />
                    <ListaAlunos 
                        students={students}
                        loading={loading}
                        selectedDate={selectedDate}
                    />
                </main>
            </div>
        </div>
    );
}

export default Inicio;