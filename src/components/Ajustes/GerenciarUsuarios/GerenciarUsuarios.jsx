import React, { useState, useEffect } from 'react';
import {
    subscribeToUsuarios,// Lembre-se da questão do Auth
    updateUsuarioData,
    deleteUsuarioData, // Lembre-se da questão do Auth
    getFaculdadesList // Para o select no formulário
} from '../../../services/ajustesService';
import AddUsuarioModal from '../AddUsuarioModal/AddUsuarioModal'; // Crie
import EditUsuarioModal from '../EditUsuarioModal/EditUsuarioModal'; // Crie
import ModalDelete from '../../ModalDelete/ModalDelete.jsx';
import { BsPlusCircleFill, BsPencilSquare, BsTrash3Fill } from "react-icons/bs";
import './GerenciarUsuarios.css';

function GerenciarUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [faculdades, setFaculdades] = useState([]); // Para preencher o select
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [usuarioToEdit, setUsuarioToEdit] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [usuarioToDelete, setUsuarioToDelete] = useState(null);

    // Busca inicial das faculdades para o select
    useEffect(() => {
        const fetchFaculdades = async () => {
            try {
                const lista = await getFaculdadesList();
                setFaculdades(lista);
            } catch (err) {
                console.error("Erro ao buscar lista de faculdades:", err);
                setError("Não foi possível carregar as faculdades para o formulário.");
            }
        };
        fetchFaculdades();
    }, []);


    // Listener para usuários
    useEffect(() => {
        setLoading(true);
        const unsubscribe = subscribeToUsuarios((data, err) => {
            if (err) {
                setError(err.message || 'Erro ao carregar usuários.');
                setUsuarios([]);
            } else {
                setUsuarios(data || []);
                setError(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);



     const handleEditUsuario = async (updatedData) => {
        if (!usuarioToEdit) return;
        try {
            await updateUsuarioData(usuarioToEdit.id, updatedData);
            setShowEditModal(false);
            setUsuarioToEdit(null);
        } catch (err) {
            console.error("Erro ao editar usuário:", err);
            setError("Erro ao salvar alterações do usuário.");
        }
     };

     const handleDeleteUsuario = async () => {
        if (!usuarioToDelete) return;
        // !!! IMPORTANTE: Esta função deleta APENAS os dados do Realtime DB.
        // Você precisa de um processo separado (provavelmente via Admin SDK no backend)
        // para deletar a conta do Firebase Authentication.
        try {
            await deleteUsuarioData(usuarioToDelete.id);
            setShowDeleteModal(false);
            setUsuarioToDelete(null);
        } catch (err) {
            console.error("Erro ao deletar dados do usuário:", err);
            setError("Erro ao deletar dados do usuário.");
        }
     };


    // --- Funções para abrir modais ---
    const openAddModal = () => setShowAddModal(true);
    const openEditModal = (usuario) => {
        setUsuarioToEdit(usuario);
        setShowEditModal(true);
    };
    const openDeleteModal = (usuario) => {
        setUsuarioToDelete(usuario);
        setShowDeleteModal(true);
    };

   if (loading && usuarios.length === 0) return <div>Carregando usuários...</div>; // Melhor indicador de loading

    // Mapeia faculdadeId para nome para exibição
    const getFaculdadeName = (id) => {
        const fac = faculdades.find(f => f.id === id);
        return fac ? fac.nome : 'Desconhecida';
    }

    return (
        <div className="gerenciar-usuarios">
            <div className='header-gerenciar-faculdades'>
                <h2>Gerenciar Usuários</h2>
                <button onClick={openAddModal} className="add-button">
                    <BsPlusCircleFill /> Adicionar Usuário
                </button>
                {error && <div className="error-message">{error}</div>}
            </div>
            <p><i>Obs: A adição/exclusão completa de usuários (incluindo autenticação) deve ser gerenciada com cuidado (ex: via Admin SDK ou fluxo de convite).</i></p>


            <ul className="usuario-list">
                 {usuarios.map((user) => (
                    <li key={user.id}>
                        <span className="usuario-nome">{user.nome} {user.sobrenome} ({user.email})</span>
                        <span className="usuario-faculdade">Faculdade: {getFaculdadeName(user.faculdadeId)}</span>
                        <span className="usuario-regras">Regras: {user.regras?.join(', ') || 'user'}</span>
                        <div className="usuario-actions">
                             <button onClick={() => openEditModal(user)} title="Editar">
                                <BsPencilSquare />
                             </button>
                             <button onClick={() => openDeleteModal(user)} title="Excluir (Apenas Dados)">
                                <BsTrash3Fill />
                             </button>
                        </div>
                    </li>
                 ))}
                 {usuarios.length === 0 && !loading && <li>Nenhum usuário cadastrado.</li>}
            </ul>

            {/* Modais */}
             {showAddModal && (
                <AddUsuarioModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    faculdadesList={faculdades} // Passa a lista para o select
                />
             )}
            {showEditModal && usuarioToEdit && (
                <EditUsuarioModal
                    isOpen={showEditModal}
                    onClose={() => { setShowEditModal(false); setUsuarioToEdit(null); }}
                    onConfirm={handleEditUsuario}
                    usuario={usuarioToEdit}
                    faculdadesList={faculdades} // Passa a lista para o select
                />
            )}
             {showDeleteModal && usuarioToDelete && (
                <ModalDelete
                    isOpen={showDeleteModal}
                    onClose={() => { setShowDeleteModal(false); setUsuarioToDelete(null); }}
                    onConfirm={handleDeleteUsuario}
                    itemName={`${usuarioToDelete.nome} ${usuarioToDelete.sobrenome}`}
                    itemType="usuário (apenas dados)"
                />
            )}
        </div>
    );
}

export default GerenciarUsuarios;