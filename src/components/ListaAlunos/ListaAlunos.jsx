import { useState } from "react";
import "./ListaAlunos.css";
import { BsTrash3Fill, BsFillPencilFill, BsCheckLg } from "react-icons/bs";
import ModalDelete from "../ModalDelete/ModalDelete";
import EditarAluno from "../EditarAluno/EditarAluno";

const ListaAlunos = () => {
    const [alunos, setAlunos] = useState([
        { id: 1, nome: 'João', faculdade: 'UEFS', viagem: "ida e volta", liberado: true },
        { id: 2, nome: 'Maria Eduarda', faculdade: 'UEFS', viagem: "ida e volta", liberado: false },
        { id: 3, nome: 'José', faculdade: 'UEFS', viagem: "ida e volta", liberado: false },
        { id: 4, nome: 'Ana', faculdade: 'UNIFAN', viagem: "ida e volta", liberado: true },
        { id: 5, nome: 'Pedro', faculdade: 'UNIFAN', viagem: "ida e volta", liberado: false },
    ]);

    const [showModal, setShowModal] = useState(false);
    const [alunoToDelete, setAlunoToDelete] = useState(null);

    const handleDeleteClick = (aluno) => {
        setAlunoToDelete(aluno);
        setShowModal(true);
    };

    const handleConfirmDelete = () => {
        setAlunos(alunos.filter((a) => a.id !== alunoToDelete.id));
        setShowModal(false);
        setAlunoToDelete(null);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setAlunoToDelete(null);
    };

    const handleReadyClick = (alunoId) => {
      setAlunos(prevAlunos =>
        prevAlunos.map(aluno =>
          aluno.id === alunoId ? { ...aluno, liberado: !aluno.liberado } : aluno
        )
      );
    };

    const [showEditModal, setShowEditModal] = useState(false);
    const [alunoEdit, setAlunoEdit] = useState(null);
    const handleEditClick = (aluno) => {
        setAlunoEdit(aluno);
        setShowEditModal(true);
    }

    const handleCloseEditModal = () => {
        setAlunoEdit(null);
        setShowEditModal(false);
    }

    const handleConfirmEdit = (updatedAluno) => {
        setAlunos(prevAlunos =>
            prevAlunos.map(aluno =>
                aluno.id === updatedAluno ? {...aluno, ...updatedAluno} : aluno
            )
        );
        setShowEditModal(false);
        setAlunoEdit(null);
    }

    return (
        <div className="container-lista-alunos">
            <div className="lista-alunos">
                <ul className="ul-lista-alunos">
                    <li className="li-college">
                        <p className="paragraph-college">UEFS:</p>
                    </li>
                    {alunos.filter(aluno => aluno.faculdade === 'UEFS').map((aluno, index) => (
                        <li className="li-student" key={aluno.id}>
                            <div className="paragraph-area">
                                <p className="paragraph-student">
                                    {index + 1}. {aluno.nome} {aluno.liberado && "✅"}
                                </p>
                            </div>
                            <div className="list-buttons">
                                <button className="button-ready" onClick={() => handleReadyClick(aluno.id)}>
                                    <BsCheckLg />
                                </button>
                                <button className="button-edit" onClick={() => handleEditClick(aluno)}><BsFillPencilFill /></button>
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

                <ul className="ul-lista-alunos">
                    <li className="li-college">
                        <p className="paragraph-college">UNIFAN:</p>
                    </li>
                    {alunos.filter(aluno => aluno.faculdade === 'UNIFAN').map((aluno, index) => (
                        <li className="li-student" key={aluno.id}>
                            <div className="paragraph-area">
                                <p className="paragraph-student">
                                    {index + 1}. {aluno.nome} {aluno.liberado && "✅"}
                                </p>
                            </div>
                            <div className="list-buttons">
                                
                                <button className="button-ready" onClick={() => handleReadyClick(aluno.id)}>
                                    <BsCheckLg />
                                </button>
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
            </div>

            {showModal && (
                <ModalDelete
                    isOpen={showModal}
                    onClose={handleCloseModal}
                    onConfirm={handleConfirmDelete}
                >
                    <h3 className="h3-modal-delete">Confirmar Exclusão</h3>
                    <p className="paragraph-modal-delete">
                        Tem certeza de que deseja remover {alunoToDelete ? alunoToDelete.nome : ''} da lista?
                    </p>
                </ModalDelete>
            )}

            {showEditModal && (
                <EditarAluno 
                    isOpen={showEditModal}
                    onClose={handleCloseEditModal}
                    onConfirm={handleConfirmEdit}
                    aluno={alunoEdit}
                />
            )}
        </div>
    );
};

export default ListaAlunos;