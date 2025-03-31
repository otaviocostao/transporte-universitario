import { useEffect, useState } from 'react'
import './ListaPassagensInicio.css'

const ListaPassagensInicio = ({ passagens, loading, selectedDate, error}) => {

    const [localError, setLocalError] = useState(null);

    useEffect(() => {
        setLocalError(null);
    }, [error]);

    if (loading) {
        return <div className='loading'>
            Carregando lista de passagens...
        </div>
    }

    if (error || localError) {
        return <div className='error-message'>
            {error || localError}
        </div>
    }

  return (
    <div className='container-lista-passagens'>
        <div className='titulo-passagens'>
            <h3>Passagens</h3>
        </div>
      <div className='lista-passagens'>
        <ul className='ul-lista-passagens'>
        {!Array.isArray(passagens) || passagens.length === 0 ? (
            <p className="no-students-message">
            Nenhuma passagem cadastrada para esta data.
          </p>
            ) : (
                passagens.map((passagem, index) => (
                    <li className='li-passagens'>
                    <div className="paragraph-area">
                        <p className="paragraph-passagens">
                        {index + 1}. {passagem.nome}{" "}
                        {passagem.viagem === "bate-volta" && (
                            <span className="stats-volta">(Bate-volta)</span>
                        )}
                        {passagem.viagem === "ida" && (
                            <span className="stats-nao-volta">(Ida)</span>
                        )}
                        {passagem.viagem === "volta" && (
                            <span className="stats-volta">(Volta)</span>
                        )}
                        </p>
                  </div>
                        <span>-</span>
                        <p>{passagem.destino}</p>
                </li>
                )))}
            </ul>
      </div>
    </div>
  )
}

export default ListaPassagensInicio
