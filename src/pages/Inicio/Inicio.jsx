import React from 'react';
import BarraNavegacao from '../../components/BarraNavegacao/BarraNavegacao'; 
import AddButton from '../../components/AddButton/AddButton';
import ListaAlunos from '../../components/ListaAlunos/ListaAlunos';
import './Inicio.css';


function Inicio() {
    return (
        <div className="inicio-container">
            <BarraNavegacao />
            <div className='inicio-content'>
                <main className="inicio-content">
                    <AddButton />
                    <ListaAlunos />
                </main>
            </div>
        </div>
    );
}

export default Inicio;