import './FiltroPassagens.css'
import { BsArrowCounterclockwise } from "react-icons/bs";
const FiltroPassagens = () => {
  return (
    <div className='card-filtro-passagens'>
        <div className='titulo-filtros-passagens'>
            <h3>Filtros</h3>
            <button className='button-limpar-filtros'> <BsArrowCounterclockwise /> Limpar filtros</button>
        </div>
        <div className='area-campos-filtros'>
            <label className='campo-filtro'>
                <span>Período:</span>
                <div className='area-inputs-date'>
                    <input className='input-date' type="date" name='periodo-inicio' id='periodo-inicio'/>
                    <span>-</span>
                    <input className='input-date' type="date" name="periodo-fim" id="periodo-fim" />
                </div>
            </label>
            <label className='campo-filtro'>
                <span>Viagem: </span>
                <select className='select-passagem' name="tipo-viagem-passagem" id="tipo-viagem-passagem">
                    <option value="bate-volta">Bate-volta</option>
                    <option value="ida">ida</option>
                    <option value="volta">volta</option>
                </select>
            </label>
            <label className='campo-filtro'>
                <span>Destino:</span>
                <select
                    className='select-passagem'
                    name="faculdade-passagem"
                    id="faculdade-aluno"
                >
                    <option value="uefs">UEFS</option>
                    <option value="pitagoras">Pitagoras</option>
                    <option value="unifan">UNIFAN</option>
                    <option value="fat">FAT</option>
                    <option value="unef">UNEF</option>
                </select>
            </label>
        </div>
    </div>
  )
}

export default FiltroPassagens