import React, { useState, useEffect } from 'react';
import {
    subscribeToUsuarios,
    deleteUsuarioData, 
    getFaculdadesList, 
    setUserActivity
} from '../../../services/ajustesService';
import AddUsuarioModal from '../AddUsuarioModal/AddUsuarioModal'; 
import EditUsuarioModal from '../EditUsuarioModal/EditUsuarioModal'; 
import ModalDelete from '../../ModalDelete/ModalDelete.jsx';
import { BsPlusCircleFill, BsPencilSquare, BsTrash3Fill } from "react-icons/bs";
import './GerenciarUsuarios.css';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import { FaToggleOff, FaToggleOn } from 'react-icons/fa';
import Paginacao from '../../Paginacao/Paginacao.jsx';

function GerenciarUsuarios() {
    
    const { userProfile, loading: authLoading } = useAuth(); 
    const [usuarios, setUsuarios] = useState([]); 
    const [faculdades, setFaculdades] = useState([]); 
    const [loadingUsuarios, setLoadingUsuarios] = useState(true); 
    const [error, setError] = useState(null); 
    const [showAddModal, setShowAddModal] = useState(false); 
    const [showEditModal, setShowEditModal] = useState(false); 
    const [usuarioToEdit, setUsuarioToEdit] = useState(null); 
    const [showDeleteModal, setShowDeleteModal] = useState(false); 
    const [usuarioToDelete, setUsuarioToDelete] = useState(null);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [itensPorPagina] = useState(20);
    
    useEffect(() => {

        const fetchFaculdades = async () => {
            try {
                const lista = await getFaculdadesList();
                setFaculdades(lista);
            } catch (err) {
                console.error("Erro ao buscar lista de faculdades:", err);
                setError("Não foi possível carregar as faculdades.");
            }
        };
        fetchFaculdades();
    }, []);


    useEffect(() => {
        console.log("GerenciarUsuarios: useEffect de usuários executado. AuthLoading:", authLoading, "UserProfile:", userProfile);

        // Lógica condicional DENTRO do useEffect
        const isAdmin = userProfile?.regras?.admin === true;
        let unsubscribe = () => {}; // Função vazia para o caso de não iniciar o listener

        if (!authLoading) { // Só faz algo se o auth JÁ carregou
            if (isAdmin) {
                console.log("GerenciarUsuarios: Usuário é admin, iniciando listener...");
                setLoadingUsuarios(true); // Inicia o loading dos usuários
                
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
                        if (data && Array.isArray(data)) {
                        
                        const sortedData = [...data].sort((a, b) => {
                            const nomeCompletoA = `${a.nome} ${a.sobrenome}`.toLowerCase();
                            const nomeCompletoB = `${b.nome} ${b.sobrenome}`.toLowerCase();
                            return nomeCompletoA.localeCompare(nomeCompletoB);
                        });
                        setUsuarios(sortedData);
                    } else {
                        setUsuarios([]);
                    }
                    setError(null);
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

    useEffect(() => {
        const totalPages = Math.ceil(usuarios.length / itensPorPagina);
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [usuarios, currentPage, itensPorPagina]);

    const indexOfLastItem = currentPage * itensPorPagina;
    const indexOfFirstItem = indexOfLastItem - itensPorPagina;
    const currentUsers = usuarios.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    
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
                 {!loadingUsuarios && !error && currentUsers.length > 0 && currentUsers.map((user, index) => {
                    // O `index` aqui é relativo à página (de 0 a 9). Para o número global, fazemos:
                    const globalIndex = indexOfFirstItem + index;
                    return (
                        <li key={user.id || globalIndex}>
                            <span className="usuario-nome">{globalIndex + 1} - {user.nome} {user.sobrenome} ({user.email}) {user.isActive === false && '(Inativo)'}</span>
                            <span className="usuario-faculdade">Faculdade: {getFaculdadeName(user.faculdadeId)}</span>
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
                    );
                 })}
                 {/* Mensagem de 'nenhum usuário' apenas se não estiver carregando E não houver erro E array vazio */}
                 {!loadingUsuarios && !error && usuarios.length === 0 && <li className="no-users-message">Nenhum usuário encontrado ou acesso negado.</li>}
            </ul>
            <Paginacao
                itensPorPagina={itensPorPagina}
                totalItens={usuarios.length}
                paginate={paginate}
                currentPage={currentPage}
            />

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