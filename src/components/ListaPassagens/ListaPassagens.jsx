import React, { useState, useEffect } from "react";
import "./ListaPassagens.css";
import { BsTrash3Fill, BsPencilSquare } from "react-icons/bs";
import ModalDelete from "../ModalDelete/ModalDelete";
import EditarPassagem from "../EditarPassagem/EditarPassagem";
import { deletePassagem, updatePassagem } from "../../services/passagensService"; 

const ListaPassagens = ({ passagens, loading, selectedDate, error }) => {
  const [showModal, setShowModal] = useState(false);
  const [passagemToDelete, setPassagemToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [passagemEdit, setPassagemEdit] = useState(null);
  const [localError, setLocalError] = useState(null);

  const handleDeleteClick = (passagem) => {
    setPassagemToDelete(passagem); 
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setLocalError(null);
      await deletePassagem(passagemToDelete.id, selectedDate);
      setShowModal(false);
      setPassagemToDelete(null);
      
    } catch (err) {
      console.error("Erro ao excluir passagem:", err);
      setLocalError("Erro ao excluir passagem. Tente novamente");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setPassagemToDelete(null);
  };

  const handleEditClick = (passagem) => {
    setPassagemEdit(passagem);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setPassagemEdit(null);
    setShowEditModal(false);
  };

  const handleConfirmEdit = async (updatedPassagemData) => {
    try {
      setLocalError(null);
      await updatePassagem(passagemEdit.id, updatedPassagemData, selectedDate);
      setShowEditModal(false);
      setPassagemEdit(null);
    } catch (err) {
      console.error("Erro ao atualizar passagem:", err);
      setLocalError("Erro ao atualizar dados da passagem. Tente novamente.");
    }
  };

  // Limpa o erro local se o erro global (prop) mudar
  useEffect(() => {
    setLocalError(null);
  }, [error]);

  // Função para formatar a data 
  const formatDisplayDate = (date) => {
    if (!date) return "-";
    if (date instanceof Date) {
      return date.toLocaleDateString("pt-BR", { timeZone: "UTC" }); 
    }
    
    try {
        const [year, month, day] = date.split('-');
        if(year && month && day){
            
            const utcDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
            return utcDate.toLocaleDateString("pt-BR", { timeZone: "UTC" });
        }
    } catch(e){/* Ignora erro de formatação */}
    return date; 
  };


  if (loading) {
    return <div className="loading">Carregando lista de passagens...</div>;
  }

  if (error || localError) {
    return <div className="error-message">{error || localError}</div>;
  }

  return (
    <div className="lista-passagens-content">
      <table className="table-passagens">
        <thead className="header-table-passagens">
          <tr>
            <th className="cell-id-passagens">#</th>
            <th className="cell-nome-passagens">Nome</th>
            <th className="cell-destino-passagens">Destino</th>
            <th className="cell-viagem-passagens">Viagem</th>
            <th className="cell-data-passagens">Data</th>
            <th className="cell-valor-passagens">Valor</th>
            <th className="cell-actions-passagens"></th>
          </tr>
        </thead>
        <tbody className="table-rows-passagens">
          {!Array.isArray(passagens) || passagens.length === 0 ? (
            <tr>
              <td colSpan="7" className="no-students-message">
                Nenhuma passagem cadastrada para esta data.
              </td>
            </tr>
            ) : (
            passagens.map((passagem, index) => (
              <tr key={passagem.id}> 
                <td>{index + 1}</td>
                <td>{passagem.nome}</td>
                <td>{passagem.destino}</td>
                <td>{passagem.viagem}</td>
                <td>{formatDisplayDate(selectedDate)}</td>
                <td>{passagem.valor}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="button-edit"
                      onClick={() => handleEditClick(passagem)}
                    >
                      <BsPencilSquare />
                    </button>
                    <button
                      className="button-delete"
                      onClick={() => handleDeleteClick(passagem)}
                    >
                      <BsTrash3Fill />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

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
            {passagemToDelete ? passagemToDelete.nome : ""} da lista?
          </p>
        </ModalDelete>
      )}

      {showEditModal && (
        <EditarPassagem 
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          onConfirm={handleConfirmEdit}
          passagem={passagemEdit}
        />
      )}
    </div>
  );
};

export default ListaPassagens;