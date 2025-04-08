import React, { useState, useEffect, useMemo } from "react";
import "./ListaAlunos.css";
import { BsTrash3Fill, BsPencilSquare, BsCheckSquare } from "react-icons/bs";
import ModalDelete from "../ModalDelete/ModalDelete";
import EditarAluno from "../EditarAluno/EditarAluno"; // Certifique-se que o componente de edição esteja correto
import {
  deleteStudent,
  toggleStudentStatus,
  updateStudent,
} from "../../services/studentService";

const ListaAlunos = ({ students, loading, error, faculdadesList, selectedDate }) => { // Recebe faculdadesList e selectedDate
  const [showModal, setShowModal] = useState(false);
  const [alunoToDelete, setAlunoToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [alunoEdit, setAlunoEdit] = useState(null);
  const [localError, setLocalError] = useState(null);

  // --- Funções CRUD (mantidas como na versão funcional anterior) ---
  const handleDeleteClick = (aluno) => { setAlunoToDelete(aluno); setShowModal(true); };

  const handleConfirmDelete = async () => {
    try {
      setLocalError(null);
      await deleteStudent(alunoToDelete.id, selectedDate); // Passa selectedDate
      setShowModal(false);
      setAlunoToDelete(null);
      // Lista atualizada pelo listener
    } catch (err) {
      console.error("Erro ao excluir aluno:", err);
      setLocalError("Erro ao excluir aluno. Tente novamente.");
    }
  };

  const handleCloseModal = () => { setShowModal(false); setAlunoToDelete(null); };

  const handleEditClick = (aluno) => { setAlunoEdit(aluno); setShowEditModal(true); };

  const handleCloseEditModal = () => { setAlunoEdit(null); setShowEditModal(false); };

  const handleConfirmEdit = async (updatedAlunoData) => {
     // Cria um objeto apenas com os dados que podem ser editados
     const dataToUpdate = {
        nome: updatedAlunoData.nome,
        faculdade: updatedAlunoData.faculdade, // Assume que o formulário retorna o ID da faculdade
        viagem: updatedAlunoData.viagem,
        // Adicione outros campos editáveis do seu formulário aqui
    };
    try {
      setLocalError(null);
      await updateStudent(alunoEdit.id, dataToUpdate, selectedDate); // Passa selectedDate e SÓ os dados atualizados
      setShowEditModal(false);
      setAlunoEdit(null);
       // Lista atualizada pelo listener
    } catch (err) {
      console.error("Erro ao atualizar aluno:", err);
      setLocalError("Erro ao atualizar dados do aluno. Tente novamente.");
    }
  };

  const handleReadyClick = async (alunoId) => {
    try {
      setLocalError(null);
      const aluno = students.find((a) => a.id === alunoId);
      if (!aluno) {
          setLocalError("Aluno não encontrado.");
          return;
      }
      await toggleStudentStatus(alunoId, selectedDate); // Passa selectedDate
      // Lista atualizada pelo listener
    } catch (err) {
      console.error("Erro ao atualizar status do aluno:", err);
      setLocalError("Erro ao atualizar status do aluno. Tente novamente.");
    }
  };

  const handleEmbarcadoClick = async (alunoId) => {
    try {
      setLocalError(null);
      const aluno = students.find((a) => a.id === alunoId);
      if (!aluno) {
          setLocalError("Aluno não encontrado.");
          return;
      }
      await toggleEmbarcadoStatus(alunoId, selectedDate); // Passa selectedDate
      // Lista atualizada pelo listener
    } catch (err) {
      console.error("Erro ao atualizar status do aluno:", err);
      setLocalError("Erro ao atualizar status do aluno. Tente novamente.");
    }
  };

  // Limpa erro local se erro global mudar
  useEffect(() => {
    setLocalError(null);
  }, [error]);

  // --- Lógica de Agrupamento e Ordenação (CORRETA para ID em aluno.faculdade) ---

  // 1. Mapa de prioridade (usa ID como chave)
  const priorityLookup = useMemo(() => {
    const lookup = {};
    if (Array.isArray(faculdadesList)) {
      faculdadesList.forEach(fac => {
        if (fac && typeof fac.id === 'string' && typeof fac.indice === 'number' && !isNaN(fac.indice)) {
          // Mapeia ID (que é o que temos no aluno) para indice
          lookup[fac.id.toUpperCase()] = fac.indice;
        } else {
          if (fac && typeof fac.id === 'string') {
             lookup[fac.id.toUpperCase()] = Infinity; // Prioridade alta se indice inválido
          }
        }
      });
    }
    // console.log("priorityLookup:", lookup); // Descomente para debug
    return lookup;
  }, [faculdadesList]);

  // 2. Mapa para buscar Nome pelo ID
  const facultyNameLookup = useMemo(() => {
    const lookup = {};
    if (Array.isArray(faculdadesList)) {
      faculdadesList.forEach(fac => {
        if (fac && typeof fac.id === 'string' && typeof fac.nome === 'string') {
          // Mapeia ID para Nome
          lookup[fac.id.toUpperCase()] = fac.nome;
        }
      });
    }
    // console.log("facultyNameLookup:", lookup); // Descomente para debug
    return lookup;
  }, [faculdadesList]);

  // 3. Agrupa estudantes pelo ID da faculdade
  const groupedStudents = useMemo(() => {
    const grouped = {};
    if (Array.isArray(students)) {
      students.forEach((aluno) => {
        if (aluno && typeof aluno.faculdade === 'string') { // aluno.faculdade aqui é o ID
          const facultyId = aluno.faculdade.toUpperCase(); // Usa o ID como chave
          if (!grouped[facultyId]) {
            grouped[facultyId] = [];
          }
          grouped[facultyId].push(aluno);
        }
      });
    }
    // console.log("groupedStudents:", grouped); // Descomente para debug
    return grouped;
  }, [students]);

  // 4. Ordena as entradas das faculdades (usando 'indice' via priorityLookup pelo ID)
  const sortedFacultyEntries = useMemo(() => {
    if (typeof groupedStudents !== 'object' || groupedStudents === null) {
      return [];
    }
    const entries = Object.entries(groupedStudents);

    entries.sort(([facultyIdA], [facultyIdB]) => { // Ordena pelos IDs
      const priorityA = priorityLookup[facultyIdA] ?? Infinity;
      const priorityB = priorityLookup[facultyIdB] ?? Infinity;
      // console.log(`Comparando: ${facultyIdA} (Prio ${priorityA}) vs ${facultyIdB} (Prio ${priorityB})`); // Debug
      return priorityA - priorityB; // Ordena por indice ascendente
    });

    // console.log("sortedFacultyEntries:", entries); // Descomente para debug
    return entries;
  }, [groupedStudents, priorityLookup]);

  // --- Renderização ---

  if (loading) {
    return <div className="loading">Carregando lista de alunos...</div>;
  }

  if (error || localError) {
    return <div className="error-message">{error || localError}</div>;
  }

  return (
    <div className="container-lista-alunos">
      <div className='titulo-passagens'>
            <h3>Transporte fixo</h3>
        </div>
      <div className="lista-alunos">
        {sortedFacultyEntries.length === 0 ? (
          <p className="no-students-message">
            Nenhum estudante cadastrado para esta data.
          </p>
        ) : (
          // Mapeia as entradas JÁ ORDENADAS
          sortedFacultyEntries.map(([facultyId, facultyStudents]) => ( // 'facultyId' é o ID
            <ul className="ul-lista-alunos" key={facultyId}> {/* Usa ID como key */}
              <li className="li-college">
                {/* Usa facultyNameLookup para exibir o NOME */}
                <p className="paragraph-college">
                  {facultyNameLookup[facultyId] ?? facultyId}: {/* Busca o nome; fallback para ID */}
                </p>
              </li>
              {/* Mapeia os alunos dentro do grupo ordenado */}
              {facultyStudents.map((aluno, index) => (
                <li className="li-student" key={aluno.id}>
                  <div className="paragraph-area">
                    <p className="paragraph-student">
                      {index + 1}. {aluno.nome}{" "}
                      {aluno.liberado && (
                        <span className="stats-liberado">✅</span>
                      )}{" "}
                      {aluno.embarcado && (
                        <span className="stats-liberado">✅</span>
                      )}{" "}
                       {aluno.viagem === "ida" && (
                        <span className="stats-nao-volta">(ida)</span>
                      )}
                      {aluno.viagem === "volta" && (
                        <span className="stats-volta">(volta)</span>
                      )}
                    </p>
                  </div>
                  <div className="list-buttons">
                      

                    {facultyId.embarque && ( // <<< PROBLEMA AQUI
                      <button
                        className="button-ready" // Pode querer um nome diferente (ex: button-embarcado)
                        onClick={() => handleEmbarcadoClick(aluno.id)}
                      >
                        <BsCheckSquare />
                      </button>
                    )}
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

      {/* Modais */}
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
      {showEditModal && (
        <EditarAluno // Certifique-se que o nome e as props estão corretos
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          onConfirm={handleConfirmEdit}
          aluno={alunoEdit} // Passa o aluno para edição
        />
      )}
    </div>
  );
};

export default ListaAlunos;