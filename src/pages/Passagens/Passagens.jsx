import BarraNavegacao from '../../components/BarraNavegacao/BarraNavegacao'; 
import FiltroPassagens from '../../components/FiltroPassagens/FiltroPassagens';
import ListaPassagens from '../../components/ListaPassagens/ListaPassagens';
import { subscribeToStudents } from '../../services/studentService';
import './Passagens.css';

function Passagens() {


    return (
        <div className="passagens-container">
            <BarraNavegacao />
            <div className='passagens-content'>
                <main className="passagens-content">
                    <h2>Passagens</h2>
                    <FiltroPassagens />
                    <ListaPassagens />
                </main>
            </div>
        </div>
    );
}

export default Passagens;