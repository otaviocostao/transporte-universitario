import { useState } from "react";
import "./ListaAlunos.css";
import { BsTrash3Fill, BsFillPencilFill, BsCheckLg } from "react-icons/bs";
import ModalDelete from "../ModalDelete/ModalDelete"; // Certifique-se do caminho correto

const ListaAlunos = () => {
    const [alunos, setAlunos] = useState([
        { id: 1, nome: 'João' },
        { id: 2, nome: 'Maria Eduarda'},
        { id: 3, nome: 'José' },
    ]);

    const [showModal, setShowModal] = useState(false);
    const [alunoToDelete, setAlunoToDelete] = useState(null);

    const handleDeleteClick = (aluno) => {
        setAlunoToDelete(aluno);
        setShowModal(true);
    };

    const handleConfirmDelete = () => {
        setAlunos(alunos.filter((a) => a.id !== alunoToDelete.id)); // Filtra pelo ID
        setShowModal(false);
        setAlunoToDelete(null);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setAlunoToDelete(null);
    };

    return (
        <div className="container-lista-alunos">
            <div className="lista-alunos">
                <ul className="ul-lista-alunos">
                    <li className="li-college">
                        <p className="paragraph-college">UEFS:</p>
                    </li>
                    {alunos.map((aluno) => (
                        <li className="li-student" key={aluno.id}>
                            <div className="paragraph-area">
                                <p className="paragraph-student">{aluno.nome}</p>
                            </div>
                            <div className="list-buttons">
                                <button className="button-ready"><BsCheckLg /></button>
                                <button className="button-edit"><BsFillPencilFill /></button>
                                <button
                                    className="button-delete"
                                    onClick={() => handleDeleteClick(aluno)}
                                >
                                    <BsTrash3Fill />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>

                {/* Exemplo de outra lista (Remova se não precisar) */}
                <ul className="ul-lista-alunos">
                    <li className="li-college">
                        <p className="paragraph-college">UNIFAN:</p>
                    </li>
                    <li className="li-student">
                        <p className="paragraph-student">Maria Eduarda</p>
                        <div className="list-buttons">
                            <button className="button-ready"><BsCheckLg /></button>
                            <button className="button-edit"><BsFillPencilFill /></button>
                            <button className="button-delete"><BsTrash3Fill /></button>
                        </div>
                    </li>
                    {/* ... outros alunos da UNIFAN ... */}
                </ul>
            </div>

            {/* Renderização condicional do Modal */}
            {showModal && (
                <ModalDelete
                    isOpen={showModal}
                    onClose={handleCloseModal}
                    onConfirm={handleConfirmDelete}
                >
                    <h3 className="h3-modal-delete">Confirmar Exclusão</h3>
                    <p className="paragraph-modal-delete">Tem certeza de que deseja remover {alunoToDelete ? alunoToDelete.nome : ''} da lista?</p>
                </ModalDelete>
            )}
        </div>
    );
};

export default ListaAlunos;