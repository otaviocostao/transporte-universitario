import "./ListaAlunos.css"

const ListaAlunos = () => {
  return (
    <div className="container-lista-alunos">
        <div className="date-area">
            <h2>Lista do dia: </h2>
        </div>
        <div className="lista-alunos">
            <ul className="ul-lista-alunos">
                <li className="li-college">
                    <p className="paragraph-college">UEFS:</p>
                </li>
                <li className="li-student">
                    <p className="paragraph-student">João Pedro</p>
                    <div className="list-buttons">
                        <button className="button-ready">Liberado</button>
                        <button className="button-delete">Excluir</button>
                    </div>
                </li>
            </ul>
            <ul className="ul-lista-alunos">
                <li className="li-college">
                    <p className="paragraph-college">UNIFAN:</p>
                </li>
                <li className="li-student">
                    <p className="paragraph-student">Maria Eduarda</p>
                    <div className="list-buttons">
                        <button className="button-ready">Liberado</button>
                        <button className="button-delete">Excluir</button>
                    </div>  
                </li>
                <li className="li-student">
                    <p className="paragraph-student">Pedro</p>
                    <div className="list-buttons">
                        <button className="button-ready">Liberado</button>
                        <button className="button-delete">Excluir</button>
                    </div>  
                </li>
                <li className="li-student">
                    <p className="paragraph-student">Jonathas</p>
                    <div className="list-buttons">
                        <button className="button-ready">Liberado</button>
                        <button className="button-delete">Excluir</button>
                    </div>  
                </li>
            </ul>

        </div>
    </div>
  )
}

export default ListaAlunos
