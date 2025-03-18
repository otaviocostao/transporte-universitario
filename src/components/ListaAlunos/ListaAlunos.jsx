import "./ListaAlunos.css";
import { BsTrash3Fill, BsFillPencilFill, BsCheckLg } from "react-icons/bs";

const ListaAlunos = () => {
  return (
    <div className="container-lista-alunos">
        
        <div className="lista-alunos">
            <ul className="ul-lista-alunos">
                <li className="li-college">
                    <p className="paragraph-college">UEFS:</p>
                </li>
                <li className="li-student">
                    <div className="paragraph-area">
                        <p className="paragraph-student">João Pedro</p>
                    </div>
                    <div className="list-buttons">
                        <button className="button-ready" ><BsCheckLg /></button>
                        <button className="button-edit"><BsFillPencilFill /></button>
                        <button className="button-delete"><BsTrash3Fill /></button>
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
                    <button className="button-ready" ><BsCheckLg /></button>
                        <button className="button-edit"><BsFillPencilFill /></button>
                        <button className="button-delete"><BsTrash3Fill /></button>
                    </div>  
                </li>
                <li className="li-student">
                    <p className="paragraph-student">Pedro</p>
                    <div className="list-buttons">
                        <button className="button-ready" ><BsCheckLg /></button>
                        <button className="button-edit"><BsFillPencilFill /></button>
                        <button className="button-delete"><BsTrash3Fill /></button>
                    </div>  
                </li>
                <li className="li-student">
                    <p className="paragraph-student">Jonathas</p>
                    <div className="list-buttons">
                        <button className="button-ready" ><BsCheckLg /></button>
                        <button className="button-edit"><BsFillPencilFill /></button>
                        <button className="button-delete"><BsTrash3Fill /></button>
                    </div>  
                </li>
            </ul>

        </div>
    </div>
  )
}

export default ListaAlunos
