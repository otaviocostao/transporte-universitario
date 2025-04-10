import React, { useState, useEffect, useMemo } from "react";
import "./ListaAlunos.css";
import { BsTrash3Fill, BsPencilSquare, BsCheckSquare, BsArrowUpSquare } from "react-icons/bs";
// IMPORTANTE: Adicionar a importação da nova função
import { toggleEmbarqueStatus } from "../../services/studentService";
import ModalDelete from "../ModalDelete/ModalDelete";
import EditarAluno from "../EditarAluno/EditarAluno";
import {
  deleteStudent,
  toggleStudentStatus,
  updateStudent,
  // Remova toggleEmbarcadoStatus daqui se importou acima
} from "../../services/studentService"; // Verifique se toggleEmbarcadoStatus está aqui ou importado separadamente

const ListaAlunos = ({ students, loading, error, faculdadesList, selectedDate }) => {
  const [showModal, setShowModal] = useState(false);
  const [alunoToDelete, setAlunoToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [alunoEdit, setAlunoEdit] = useState(null);
  const [localError, setLocalError] = useState(null);

  // --- Funções CRUD ---
  const handleDeleteClick = (aluno) => { setAlunoToDelete(aluno); setShowModal(true); };
  const handleConfirmDelete = async () => {
    try {
      setLocalError(null);
      await deleteStudent(alunoToDelete.id, selectedDate);
      setShowModal(false); setAlunoToDelete(null);
    } catch (err) {
      console.error("Erro ao excluir aluno:", err);
      setLocalError("Erro ao excluir aluno. Tente novamente.");
    }
  };
  const handleCloseModal = () => { setShowModal(false); setAlunoToDelete(null); };
  const handleEditClick = (aluno) => { setAlunoEdit(aluno); setShowEditModal(true); };
  const handleCloseEditModal = () => { setAlunoEdit(null); setShowEditModal(false); };
  const handleConfirmEdit = async (updatedAlunoData) => {
     const dataToUpdate = {
        nome: updatedAlunoData.nome,
        faculdade: updatedAlunoData.faculdade,
        viagem: updatedAlunoData.viagem,
    };
    try {
      setLocalError(null);
      await updateStudent(alunoEdit.id, dataToUpdate, selectedDate);
      setShowEditModal(false); setAlunoEdit(null);
    } catch (err) {
      console.error("Erro ao atualizar aluno:", err);
      setLocalError("Erro ao atualizar dados do aluno. Tente novamente.");
    }
  };
  const handleReadyClick = async (alunoId) => {
    try {
      setLocalError(null);
      await toggleStudentStatus(alunoId, selectedDate);
    } catch (err) {
      console.error("Erro ao atualizar status liberado:", err);
      setLocalError("Erro ao atualizar status liberado. Tente novamente.");
    }
  };
  // Função para o novo botão
  const handleEmbarcadoClick = async (alunoId) => {
    try {
      setLocalError(null);
      // Chamar a função correta do service
      await toggleEmbarqueStatus(alunoId, selectedDate);
    } catch (err) {
      console.error("Erro ao atualizar status embarcado:", err);
      setLocalError("Erro ao atualizar status embarcado. Tente novamente.");
    }
  };

  useEffect(() => { setLocalError(null); }, [error]);

  // --- Lógica de Agrupamento e Ordenação ---

  // 1. Mapa de prioridade (usa ID como chave) - MANTIDO
  const priorityLookup = useMemo(() => {
    const lookup = {};
    if (Array.isArray(faculdadesList)) {
      faculdadesList.forEach(fac => {
        if (fac && typeof fac.id === 'string') {
          lookup[fac.id.toUpperCase()] = typeof fac.indice === 'number' && !isNaN(fac.indice) ? fac.indice : Infinity;
        }
      });
    }
    return lookup;
  }, [faculdadesList]);

  // 2. NOVO: Mapa para buscar DADOS COMPLETOS da Faculdade pelo ID (incluindo 'embarque')
  const facultyDataLookup = useMemo(() => {
    const lookup = {};
    if (Array.isArray(faculdadesList)) {
      faculdadesList.forEach(fac => {
        if (fac && typeof fac.id === 'string') {
          // Armazena o objeto faculdade completo, chaveado pelo ID em maiúsculas
          lookup[fac.id.toUpperCase()] = fac;
        }
      });
    }
    return lookup;
  }, [faculdadesList]); // Depende apenas da lista de faculdades

  // 3. Agrupa estudantes pelo ID da faculdade (em maiúsculas) - MANTIDO
  const groupedStudents = useMemo(() => {
    const grouped = {};
    if (Array.isArray(students)) {
      students.forEach((aluno) => {
        // Garante que aluno.faculdade é uma string antes de usar toUpperCase
        if (aluno && typeof aluno.faculdade === 'string') {
          const facultyIdKey = aluno.faculdade.toUpperCase();
          if (!grouped[facultyIdKey]) {
            grouped[facultyIdKey] = [];
          }
          grouped[facultyIdKey].push(aluno);
        } else {
           // Opcional: Agrupar alunos sem faculdade definida ou com tipo inválido
           const unknownKey = '_SEM_FACULDADE_';
           if (!grouped[unknownKey]) grouped[unknownKey] = [];
           grouped[unknownKey].push(aluno);
        }
      });
    }
    return grouped;
  }, [students]);

  // 4. Ordena as entradas das faculdades - MANTIDO
  const sortedFacultyEntries = useMemo(() => {
    if (typeof groupedStudents !== 'object' || groupedStudents === null) {
      return [];
    }
    const entries = Object.entries(groupedStudents);
    entries.sort(([facultyIdA], [facultyIdB]) => {
      const priorityA = priorityLookup[facultyIdA] ?? Infinity;
      const priorityB = priorityLookup[facultyIdB] ?? Infinity;
      return priorityA - priorityB;
    });
    return entries;
  }, [groupedStudents, priorityLookup]);

  // --- Renderização ---

  if (loading) { return <div className="loading">Carregando lista de alunos...</div>; }
  if (error || localError) { return <div className="error-message">{error || localError}</div>; }

  return (
    <div className="container-lista-alunos">
      <div className='titulo-passagens'><h3>Transporte fixo</h3></div>
      <div className="lista-alunos">
        {sortedFacultyEntries.length === 0 ? (
          <p className="no-students-message">Nenhum estudante cadastrado para esta data.</p>
        ) : (
          sortedFacultyEntries.map(([facultyId, facultyStudents]) => {
            // Busca os dados da faculdade atual usando o novo mapa
            const currentFacultyData = facultyDataLookup[facultyId];
            // Define o nome a ser exibido (Nome da faculdade ou o ID como fallback)
            const facultyDisplayName = currentFacultyData?.nome ?? facultyId; // Usa Optional Chaining

            return (
              <ul className="ul-lista-alunos" key={facultyId}>
                <li className="li-college">
                  <p className="paragraph-college">{facultyDisplayName}:</p>
                </li>
                {facultyStudents.map((aluno, index) => (
                  <li className="li-student" key={aluno.id}>
                    <div className="paragraph-area">
                      <p className="paragraph-student">
                        {index + 1}. {aluno.nome}{" "}
                        {/* Mantém indicadores visuais como estavam */}
                        {aluno.liberado && (<span className="stats-liberado">✅</span>)}{" "}
                        {aluno.embarcado && (<span className="stats-liberado">✅</span>)} {/* Exemplo: Ícone diferente */}
                        {aluno.viagem === "ida" && (<span className="stats-nao-volta">(ida)</span>)}
                        {aluno.viagem === "volta" && (<span className="stats-volta">(volta)</span>)}
                      </p>
                    </div>
                    <div className="list-buttons">
                      {/* CONDIÇÃO CORRIGIDA: Verifica se a faculdade existe no lookup E se seu 'embarque' é true */}
                      {/* Botão de Liberado (mantido) */}
                      {currentFacultyData && currentFacultyData.embarque === true && aluno.viagem !== "ida" && (
                        <button
                          className="button-ready" // Classe CSS específica
                          onClick={() => handleEmbarcadoClick(aluno.id)}
                          title="Marcar/Desmarcar Embarque" // Tooltip útil
                        >
                          <BsArrowUpSquare />
                        </button>
                      )}
                      {aluno.viagem !== "ida" && (
                        <button
                          className="button-ready"
                          onClick={() => handleReadyClick(aluno.id)}
                          title="Marcar/Desmarcar Liberado"
                        >
                          <BsCheckSquare />
                        </button>
                      )}
                      {/* Botões de Editar e Deletar (mantidos) */}
                      <button className="button-edit" onClick={() => handleEditClick(aluno)}><BsPencilSquare /></button>
                      <button className="button-delete" onClick={() => handleDeleteClick(aluno)}><BsTrash3Fill /></button>
                    </div>
                  </li>
                ))}
              </ul>
            );
          }) // Fim do map sortedFacultyEntries
        )}
      </div>

      {/* Modais (mantidos como estavam) */}
      {showModal && (
        <ModalDelete isOpen={showModal} onClose={handleCloseModal} onConfirm={handleConfirmDelete}>
          <h3 className="h3-modal-delete">Confirmar Exclusão</h3>
          <p className="paragraph-modal-delete">Tem certeza de que deseja remover {alunoToDelete ? alunoToDelete.nome : ""} da lista?</p>
        </ModalDelete>
      )}
      {showEditModal && (
        <EditarAluno isOpen={showEditModal} onClose={handleCloseEditModal} onConfirm={handleConfirmEdit} aluno={alunoEdit} />
      )}
    </div>
  );
};

export default ListaAlunos;