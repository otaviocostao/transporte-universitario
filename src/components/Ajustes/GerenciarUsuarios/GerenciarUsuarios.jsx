// Em GerenciarUsuarios.jsx

import React, { useState, useEffect } from 'react';
import {
    subscribeToUsuarios,// Lembre-se da questão do Auth
    deleteUsuarioData, // Lembre-se da questão do Auth
    getFaculdadesList, // Para o select no formulário
    setUserActivity
} from '../../../services/ajustesService';
import AddUsuarioModal from '../AddUsuarioModal/AddUsuarioModal'; // Crie
import EditUsuarioModal from '../EditUsuarioModal/EditUsuarioModal'; // Crie
import ModalDelete from '../../ModalDelete/ModalDelete.jsx';
import { BsPlusCircleFill, BsPencilSquare, BsTrash3Fill } from "react-icons/bs";
import './GerenciarUsuarios.css';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import { FaToggleOff, FaToggleOn } from 'react-icons/fa';

function GerenciarUsuarios() {
    // --- Hooks SEMPRE na mesma ordem ---
    const { userProfile, loading: authLoading } = useAuth(); // Hook 1
    const [usuarios, setUsuarios] = useState([]);           // Hook 2
    const [faculdades, setFaculdades] = useState([]);       // Hook 3
    const [loadingUsuarios, setLoadingUsuarios] = useState(true); // Hook 4
    const [error, setError] = useState(null);               // Hook 5
    const [showAddModal, setShowAddModal] = useState(false); // Hook 6
    const [showEditModal, setShowEditModal] = useState(false); // Hook 7
    const [usuarioToEdit, setUsuarioToEdit] = useState(null); // Hook 8
    const [showDeleteModal, setShowDeleteModal] = useState(false); // Hook 9
    const [usuarioToDelete, setUsuarioToDelete] = useState(null); // Hook 10
    // --- Fim dos Hooks ---
    
    

    // useEffect para buscar faculdades (Chame este ANTES do de usuários se precisar dele primeiro)
    useEffect(() => {
        // console.log("GerenciarUsuarios: Buscando faculdades..."); // Para debug
        const fetchFaculdades = async () => {
            try {
                const lista = await getFaculdadesList();
                setFaculdades(lista);
            } catch (err) {
                console.error("Erro ao buscar lista de faculdades:", err);
                setError("Não foi possível carregar as faculdades."); // Pode sobrescrever erro de usuário
            }
        };
        fetchFaculdades();
    }, []); // Executa só uma vez

    // useEffect para ouvir usuários (Chamado incondicionalmente)
    useEffect(() => {
        console.log("GerenciarUsuarios: useEffect de usuários executado. AuthLoading:", authLoading, "UserProfile:", userProfile); // Debug

        // Lógica condicional DENTRO do useEffect
        const isAdmin = userProfile?.regras?.admin === true;
        let unsubscribe = () => {}; // Função vazia para o caso de não iniciar o listener

        if (!authLoading) { // Só faz algo se o auth JÁ carregou
            if (isAdmin) {
                console.log("GerenciarUsuarios: Usuário é admin, iniciando listener...");
                setLoadingUsuarios(true); // Inicia o loading dos usuários
                // Define a função de unsubscribe real
                unsubscribe = subscribeToUsuarios((data, err) => {
                    if (err) {
                        if (err.code === 'PERMISSION_DENIED') {
                            console.error("Erro de permissão ao ouvir usuários. Verifique as regras.");
                            setError("Você não tem permissão para ver a lista completa de usuários.");
                        } else {
                            setError(err.message || 'Erro ao carregar usuários.');
                        }
                        setUsuarios([]);
                    } else {
                        setUsuarios(data || []);
                        setError(null); // Limpa erro anterior se sucesso
                    }
                    setLoadingUsuarios(false); // Termina o loading dos usuários
                });

            } else {
                // Se auth carregou mas não é admin
                console.warn("GerenciarUsuarios: Usuário não é admin, não buscando lista.");
                // setError("Acesso não autorizado para visualizar usuários."); // Opcional: Mostrar erro
                setUsuarios([]); // Limpa a lista
                setLoadingUsuarios(false); // Termina o loading (sem dados)
            }
        } else {
             // Se authLoading for true, espera (e mantém loadingUsuarios como true)
             console.log("GerenciarUsuarios: Esperando AuthContext carregar...");
             setLoadingUsuarios(true);
        }

        // Função de limpeza do useEffect: será chamada quando o componente desmontar
        // ou ANTES da próxima execução do useEffect (se as dependências mudarem)
        return () => {
             console.log("GerenciarUsuarios: Limpeza do useEffect de usuários. Cancelando listener...");
             unsubscribe(); // Cancela o listener do Firebase
        };

    }, [authLoading, userProfile]); // Dependências corretas

    // --- Restante do componente ---

    // Funções para abrir modais (openAddModal, openEditModal, openDeleteModal)
    // ...
    const openAddModal = () => setShowAddModal(true);
    const openEditModal = (usuario) => { /* ... */ setUsuarioToEdit(usuario); setShowEditModal(true); };
    const openDeleteModal = (usuario) => { /* ... */ setUsuarioToDelete(usuario); setShowDeleteModal(true); };

    // Função de callback para onConfirm do EditModal
    const handleEditConfirmado = () => {
         setShowEditModal(false);
         setUsuarioToEdit(null);
    };

    // Função para deletar
    const handleToggleActivity = async (user) => {
        const newStatus = !(user.isActive === true); // Inverte o status (trata undefined como inativo)
        const userName = `${user.nome} ${user.sobrenome}`;
        const actionText = newStatus ? 'ativar' : 'inativar';
    
        // Confirmação opcional
        
    
        try {
          // Chama o serviço para atualizar APENAS o status
          await setUserActivity(user.id, newStatus);
          // A lista deve atualizar automaticamente pelo listener `subscribeToUsuarios`
          console.log(`Status de ${userName} alterado para ${newStatus}`);
        } catch (err) {
          console.error(`Erro ao ${actionText} usuário ${userName}:`, err);
          setError(`Erro ao ${actionText} usuário.`); // Define mensagem de erro
        }
    };
    

    // Função para obter nome da faculdade
    const getFaculdadeName = (id) => {
        const fac = faculdades.find(f => f.id === id);
        return fac ? fac.nome : 'N/A';
    }

    // Indicador de loading (usa o estado específico)
    if (loadingUsuarios && !error) return <div>Carregando usuários...</div>; // Mostra loading apenas se não houver erro

    // --- JSX ---
    return (
        <div className="gerenciar-usuarios">
            <div className='header-gerenciar-faculdades'>
                <h2>Gerenciar Usuários</h2>
                <button onClick={openAddModal} className="add-button" disabled={authLoading || !userProfile?.regras?.admin}> {/* Opcional: Desabilitar botão se não for admin */}
                    <BsPlusCircleFill /> Adicionar
                </button>
            </div>
            {/* Exibe erro SE existir E não estiver carregando */}
            {error && !loadingUsuarios && <div className="error-message">{error}</div>}


            <ul className="usuario-list">
                 {/* Renderiza a lista apenas se não estiver carregando E não houver erro E houver usuários */}
                 {!loadingUsuarios && !error && usuarios.length > 0 && usuarios.map((user, index) => (
                    <li key={user.id || index}> {/* Usa index como fallback de key se id não existir */}
                        <span className="usuario-nome">{index+1} - {user.nome} {user.sobrenome} ({user.email}) {user.isActive === false && '(Inativo)'}</span>
                        <span className="usuario-faculdade">Faculdade: {getFaculdadeName(user.faculdadeId)}</span>
                        {/* Lógica corrigida para regras como objeto */}
                        <span className="usuario-regras">
                           Regras: {user.regras && typeof user.regras === 'object'
                              ? Object.keys(user.regras).filter(regra => user.regras[regra] === true).join(', ')
                              : (Array.isArray(user.regras) ? user.regras.join(', ') : 'N/A')
                           }
                        </span>
                        <div className="usuario-actions">
                             <button onClick={() => openEditModal(user)} title="Editar">
                                <BsPencilSquare />
                             </button>
                             <button onClick={() => handleToggleActivity(user)} title={user.isActive === false ? 'Ativar Usuário' : 'Inativar Usuário'}>
                                {user.isActive === false ? <FaToggleOff color="grey"/> : <FaToggleOn color="green"/>}
                            </button>
                        </div>
                    </li>
                 ))}
                 {/* Mensagem de 'nenhum usuário' apenas se não estiver carregando E não houver erro E array vazio */}
                 {!loadingUsuarios && !error && usuarios.length === 0 && <li className="no-users-message">Nenhum usuário encontrado ou acesso negado.</li>}
            </ul>

            {/* Modais */}
             {showAddModal && (
                <AddUsuarioModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onConfirm={() => setShowAddModal(false)} // Apenas fecha
                    faculdadesList={faculdades}
                />
             )}
            {showEditModal && usuarioToEdit && (
                <EditUsuarioModal
                isOpen={showEditModal}
                onClose={() => { setShowEditModal(false); setUsuarioToEdit(null); }}
                onConfirm={handleEditConfirmado} // Chama a função que só fecha
                userToEdit={usuarioToEdit}
                faculdadesList={faculdades}
            />
            )}
             {showDeleteModal && usuarioToDelete && (
                <ModalDelete
                    isOpen={showDeleteModal}
                    onClose={() => { setShowDeleteModal(false); setUsuarioToDelete(null); }}
                    onConfirm={handleDeleteUsuario}
                    itemName={`${usuarioToDelete.nome} ${usuarioToDelete.sobrenome}`}
                    itemType="usuário (apenas dados)"
                >
                    <h3 className="h3-modal-delete">Confirmar Exclusão</h3>
                    <p className="paragraph-modal-delete">Tem certeza de que deseja remover: {usuarioToDelete ? usuarioToDelete.nome : ""}?</p>
                </ModalDelete>
            )}
        </div>
    );
}


export default GerenciarUsuarios;