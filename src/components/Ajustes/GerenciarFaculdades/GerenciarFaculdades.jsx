import React, { useState, useEffect, useCallback } from 'react';
import {
  subscribeToFaculdades,
  addFaculdade,
  updateFaculdade,
  deleteFaculdade,
  updateFaculdadeOrder // Importa a função de ordem
} from '../../../services/ajustesService';
import AddFaculdadeModal from '../AddFaculdadeModal/AddFaculdadeModal'; // Crie este modal
import EditFaculdadeModal from '../EditFaculdadeModal/EditFaculdadeModal'; // Crie este modal
import ModalDelete from '../../ModalDelete/ModalDelete.jsx';
import { BsPlusCircleFill, BsPencilSquare, BsTrash3Fill, BsArrowUp, BsArrowDown } from "react-icons/bs";
// Opcional: Para Drag and Drop
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import './GerenciarFaculdades.css';

function GerenciarFaculdades() {
  const [faculdades, setFaculdades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [faculdadeToEdit, setFaculdadeToEdit] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [faculdadeToDelete, setFaculdadeToDelete] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToFaculdades((data, err) => {
      if (err) {
        setError(err.message || 'Erro ao carregar faculdades.');
        setFaculdades([]);
      } else {
        setFaculdades(data || []); // Garante que seja array
        setError(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- Handlers CRUD ---
  const handleAddFaculdade = async (newData) => {
    try {
        // Define o índice inicial como o próximo número disponível
        const nextIndex = faculdades.length;
        await addFaculdade({...newData, indice: nextIndex});
        setShowAddModal(false);
    } catch (err) {
        console.error("Erro ao adicionar faculdade:", err);
        setError("Erro ao salvar faculdade."); // Mostrar erro no modal seria melhor
    }
  };

  const handleEditFaculdade = async (updatedData) => {
     if (!faculdadeToEdit) return;
     try {
         await updateFaculdade(faculdadeToEdit.id, updatedData);
         setShowEditModal(false);
         setFaculdadeToEdit(null);
     } catch (err) {
         console.error("Erro ao editar faculdade:", err);
         setError("Erro ao salvar alterações.");
     }
  };

  const handleDeleteFaculdade = async () => {
    if (!faculdadeToDelete) return;
    try {
        await deleteFaculdade(faculdadeToDelete.id);
        // Reordenar índices após exclusão (importante!)
        const remainingFaculdades = faculdades.filter(f => f.id !== faculdadeToDelete.id);
        const ordered = remainingFaculdades.sort((a, b) => a.indice - b.indice); // Garante ordem
        await updateFaculdadeOrder(ordered); // Atualiza os índices dos restantes

        setShowDeleteModal(false);
        setFaculdadeToDelete(null);
    } catch (err) {
        console.error("Erro ao deletar faculdade:", err);
        setError("Erro ao deletar faculdade.");
    }
  };

  // --- Handlers de Ordem (Exemplo com Botões Up/Down) ---
  const moveFaculdade = async (index, direction) => {
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= faculdades.length) return; // Limites do array

      const newFaculdades = [...faculdades]; // Cria cópia
      // Troca os elementos de posição
      [newFaculdades[index], newFaculdades[newIndex]] = [newFaculdades[newIndex], newFaculdades[index]];

      // Atualiza os índices baseado na nova posição no array
      const faculdadesToUpdate = newFaculdades.map((f, i) => ({ ...f, indice: i }));

      try {
          setLoading(true); // Mostra loading durante a reordenação
          setError(null);
          await updateFaculdadeOrder(faculdadesToUpdate);
          // O listener vai atualizar o estado 'faculdades' automaticamente
      } catch(err) {
          console.error("Erro ao reordenar faculdades:", err);
          setError("Erro ao salvar nova ordem.");
      } finally {
          setLoading(false);
      }
  };


  // --- Funções para abrir modais ---
  const openAddModal = () => setShowAddModal(true);
  const openEditModal = (faculdade) => {
    setFaculdadeToEdit(faculdade);
    setShowEditModal(true);
  };
   const openDeleteModal = (faculdade) => {
    setFaculdadeToDelete(faculdade);
    setShowDeleteModal(true);
  };

  if (loading) return <div>Carregando faculdades...</div>;

  return (
    <div className="gerenciar-faculdades">
      {error && <div className="error-message">{error}</div>}
      <div className='header-gerenciar-faculdades'>
        <h2>Gerenciar Faculdades</h2>
        <button onClick={openAddModal} className="add-button">
          <BsPlusCircleFill /> Adicionar
        </button>
      </div>

      <ul className="faculdade-list">
        {!Array.isArray(faculdades) || faculdades.map((fac, index) => (
          <li key={fac.id}>
            <span className="faculdade-indice">{fac.indice + 1}.</span> {/* Mostra índice + 1 */}
            <span className="faculdade-nome">{fac.nome}</span>
            <div className="faculdade-actions">
              <button onClick={() => moveFaculdade(index, -1)} disabled={index === 0} title="Mover para cima">
                <BsArrowUp />
              </button>
              <button onClick={() => moveFaculdade(index, 1)} disabled={index === faculdades.length - 1} title="Mover para baixo">
                <BsArrowDown />
              </button>
              <button onClick={() => openEditModal(fac)} title="Editar">
                <BsPencilSquare />
              </button>
              <button onClick={() => openDeleteModal(fac)} title="Excluir">
                <BsTrash3Fill />
              </button>
            </div>
          </li>
        ))}
      </ul>
         {!Array.isArray(faculdades) || faculdades.length === 0 && !loading && <li>Nenhuma faculdade cadastrada.</li>}

      {/* Modais */}
      {showAddModal && (
        <AddFaculdadeModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onConfirm={handleAddFaculdade}
        />
      )}
       {showEditModal && faculdadeToEdit && (
        <EditFaculdadeModal
          isOpen={showEditModal}
          onClose={() => { setShowEditModal(false); setFaculdadeToEdit(null); }}
          onConfirm={handleEditFaculdade}
          faculdade={faculdadeToEdit}
        />
      )}
        {showDeleteModal && faculdadeToDelete && (
        <ModalDelete 
          isOpen={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setFaculdadeToDelete(null); }}
          onConfirm={handleDeleteFaculdade}
          itemName={faculdadeToDelete.nome} // Passa o nome para o modal de confirmação
          itemType="faculdade"
        >
          <h3 className="h3-modal-delete">Confirmar Exclusão</h3>
          <p className="paragraph-modal-delete">
            Tem certeza de que deseja remover{" "}
            {faculdadeToDelete ? faculdadeToDelete.nome : ""} da lista?
          </p>
          </ModalDelete>
      )}
    </div>
  );
}

export default GerenciarFaculdades;