import React, { useState, useEffect } from "react"; // Import useEffect
import "./ListaAlunos.css";
import { BsTrash3Fill, BsPencilSquare, BsCheckSquare } from "react-icons/bs";
import ModalDelete from "../ModalDelete/ModalDelete";
import EditarAluno from "../EditarAluno/EditarAluno";
import {
  deleteStudent,
  toggleStudentStatus,
  updateStudent,
} from "../../services/studentService";

const ListaAlunos = ({ students, loading, selectedDate, error }) => {
  const [showModal, setShowModal] = useState(false);
  const [alunoToDelete, setAlunoToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [alunoEdit, setAlunoEdit] = useState(null);
  const [localError, setLocalError] = useState(null); // Para erros locais

  // --- Deleção ---
  const handleDeleteClick = (aluno) => {
    setAlunoToDelete(aluno);
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setLocalError(null);
      await deleteStudent(alunoToDelete.id); // Não precisa mais da data
      setShowModal(false);
      setAlunoToDelete(null);
    } catch (err) {
      console.error("Erro ao excluir aluno:", err);
      setLocalError("Erro ao excluir aluno. Tente novamente.");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setAlunoToDelete(null);
  };

 // --- Edição ---
    const handleEditClick = (aluno) => {
        setAlunoEdit(aluno);
        setShowEditModal(true);
    }

    const handleCloseEditModal = () => {
        setAlunoEdit(null);
        setShowEditModal(false);
    }
    const handleConfirmEdit = async (updatedAluno) => {
        try {
          setLocalError(null);
          await updateStudent(updatedAluno.id, updatedAluno); // Não precisa mais da data
          setShowEditModal(false);
          setAlunoEdit(null);
        } catch (err) {
          console.error("Erro ao atualizar aluno:", err);
          setLocalError("Erro ao atualizar dados do aluno. Tente novamente.");
        }
    };

  // --- Alternar Status (Liberado) ---
  const handleReadyClick = async (alunoId) => {
    try {
      setLocalError(null);
      const aluno = students.find((a) => a.id === alunoId);
        if (!aluno) {
            setLocalError("Aluno não encontrado.");
            return;
        }
      const updatedAluno = await toggleStudentStatus(alunoId); 
       if (updatedAluno) { 
  
        }
    } catch (err) {
      console.error("Erro ao atualizar status do aluno:", err);
      setLocalError("Erro ao atualizar status do aluno. Tente novamente.");
    }
  };

    // useEffect para limpar erros locais quando a prop error (global) mudar
    useEffect(() => {
        setLocalError(null);
    }, [error]);

    // --- Agrupar por faculdade ---
  const groupStudentsByFaculty = () => {
    const grouped = {};
    students.forEach((aluno) => {
      const faculty = aluno.faculdade.toUpperCase();
      if (!grouped[faculty]) {
        grouped[faculty] = [];
      }
      grouped[faculty].push(aluno);
    });
    return grouped;
  };

  if (loading) {
    return <div className="loading">Carregando lista de alunos...</div>;
  }

  if (error || localError) {
    return <div className="error-message">{error || localError}</div>;
  }

  const groupedStudents = groupStudentsByFaculty();

  return (
    <div className="container-lista-alunos">
      <div className="lista-alunos">
        {Object.keys(groupedStudents).length === 0 ? (
          <p className="no-students-message">
            Nenhum estudante cadastrado para esta data.
          </p>
        ) : (
          Object.entries(groupedStudents).map(([faculty, facultyStudents]) => (
            <ul className="ul-lista-alunos" key={faculty}>
              <li className="li-college">
                <p className="paragraph-college">{faculty}:</p>
              </li>
              {facultyStudents.map((aluno, index) => (
                <li className="li-student" key={aluno.id}>
                  <div className="paragraph-area">
                    <p className="paragraph-student">
                      {index + 1}. {aluno.nome}{" "}
                      {aluno.liberado && (
                        <span className="stats-liberado">✅</span>
                      )}{" "}
                      {aluno.viagem === "ida" && (
                        <span className="stats-nao-volta">❌</span>
                      )}
                      {aluno.viagem === "volta" && (
                        <span className="stats-volta">(volta)</span>
                      )}
                    </p>
                  </div>
                  <div className="list-buttons">
                    {aluno.viagem !== "ida" && (
                      <button
                        className="button-ready"
                        onClick={() => handleReadyClick(aluno.id)}
                      >
                        <BsCheckSquare />
                      </button>
                    )}
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
                </li>
              ))}
            </ul>
          ))
        )}
      </div>

      {/* Modal de Deleção */}
      {showModal && (
        <ModalDelete
          isOpen={showModal}
          onClose={handleCloseModal}
          onConfirm={handleConfirmDelete}
        >
          <h3 className="h3-modal-delete">Confirmar Exclusão</h3>
          <p className="paragraph-modal-delete">
            Tem certeza de que deseja remover{" "}
            {alunoToDelete ? alunoToDelete.nome : ""} da lista?
          </p>
        </ModalDelete>
      )}

      {/* Modal de Edição */}
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