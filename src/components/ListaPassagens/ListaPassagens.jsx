import './ListaPassagens.css'
import { BsTrash3Fill, BsPencilSquare} from "react-icons/bs";

const ListaPassagens = () => {
  return (
    <div className='lista-passagens-content'>
            <table className='table-passagens'>
                <thead className='header-table-passagens'>
                    <tr>
                        <th className='cell-id-passagens'>#</th>
                        <th className='cell-nome-passagens'>Nome</th>
                        <th className='cell-destino-passagens'>Destino</th>
                        <th className='cell-viagem-passagens'>Viagem</th>
                        <th className='cell-data-passagens'>Data</th>
                        <th className='cell-valor-passagens'>Valor</th>
                        <th className='cell-actions-passagens'></th>
                    </tr>
                </thead>
                <tbody className='table-rows-passagens'>
                   <tr>
                        <td>1</td>
                        <td>Maria Eduarda</td>
                        <td>Unef</td>
                        <td>Bate-volta</td>
                        <td>22/03/2025</td>
                        <td>R$ 30,00</td>
                        <td>
                            <div className='action-buttons'>
                                <button 
                                    className="button-edit" 
                                    onClick={() => handleEditClick(aluno)}
                                >
                                <BsPencilSquare />
                                </button>
                                <button
                                    className="button-delete"
                                    onClick={() => handleDeleteClick(aluno)}
                                >
                                <BsTrash3Fill />
                                </button>
                            </div>
                        </td>
                    </tr> 
                   <tr>
                        <td>2</td>
                        <td>João Pedro</td>
                        <td>UNIFAN</td>
                        <td>Bate-volta</td>
                        <td>22/03/2025</td>
                        <td>R$ 30,00</td>
                        <td>
                            <div className='action-buttons'>
                                <button 
                                                      className="button-edit" 
                                                      onClick={() => handleEditClick(aluno)}
                                                    >
                                                      <BsPencilSquare />
                                                    </button>
                                                    <button
                                                      className="button-delete"
                                                      onClick={() => handleDeleteClick(aluno)}
                                                    >
                                                      <BsTrash3Fill />
                                                    </button>
                            </div>
                        </td>
                    </tr> 
                </tbody>
            </table>
    </div>
  )
}

export default ListaPassagens