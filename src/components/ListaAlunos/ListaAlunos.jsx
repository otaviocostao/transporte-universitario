import { useState } from "react";
import "./ListaAlunos.css";
import { BsTrash3Fill, BsPencilSquare, BsCheckSquare } from "react-icons/bs";
import ModalDelete from "../ModalDelete/ModalDelete";
import EditarAluno from "../EditarAluno/EditarAluno";
import { deleteStudent, toggleStudentStatus, updateStudent } from "../../services/studentService";

const ListaAlunos = ({ students, loading, selectedDate }) => {
  const [error, setError] = useState(null);
  
  const [showModal, setShowModal] = useState(false);
  const [alunoToDelete, setAlunoToDelete] = useState(null);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [alunoEdit, setAlunoEdit] = useState(null);

  // Lidar com exclusão de aluno
  const handleDeleteClick = (aluno) => {
    setAlunoToDelete(aluno);
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteStudent(alunoToDelete.id, selectedDate);
      setShowModal(false);
      setAlunoToDelete(null);
    } catch (err) {
      console.error("Erro ao excluir aluno:", err);
      setError("Erro ao excluir aluno. Tente novamente.");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setAlunoToDelete(null);
  };

  // Lidar com mudança de status do aluno
  const handleReadyClick = async (alunoId) => {
    try {
      const aluno = students.find(a => a.id === alunoId);
      await toggleStudentStatus(alunoId, aluno.liberado, selectedDate);
    } catch (err) {
      console.error("Erro ao atualizar status do aluno:", err);
      setError("Erro ao atualizar status do aluno. Tente novamente.");
    }
  };

  // Lidar com edição de aluno
  const handleEditClick = (aluno) => {
    setAlunoEdit(aluno);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setAlunoEdit(null);
    setShowEditModal(false);
  };

  const handleConfirmEdit = async (updatedAluno) => {
    try {
      await updateStudent(updatedAluno.id, updatedAluno, selectedDate);
      setShowEditModal(false);
      setAlunoEdit(null);
    } catch (err) {
      console.error("Erro ao atualizar aluno:", err);
      setError("Erro ao atualizar dados do aluno. Tente novamente.");
    }
  };

  // Função para agrupar alunos por faculdade
  const groupStudentsByFaculty = () => {
    const grouped = {};
    
    students.forEach(aluno => {
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

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const groupedStudents = groupStudentsByFaculty();

  return (
    <div className="container-lista-alunos">
      <div className="lista-alunos">
        {Object.keys(groupedStudents).length === 0 ? (
          <p className="no-students-message">Nenhum estudante cadastrado para esta data.</p>
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
                      {index + 1}. {aluno.nome} {aluno.liberado && <div className="stats-liberado"><span>Liberado</span></div> }
                    </p>
                  </div>
                  <div className="list-buttons">
                    <button 
                      className="button-ready" 
                      onClick={() => handleReadyClick(aluno.id)}
                    >
                      <BsCheckSquare />
                    </button>
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