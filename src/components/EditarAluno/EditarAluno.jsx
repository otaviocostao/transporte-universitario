import React, { useState, useEffect } from 'react';
import { updateStudent } from '../../services/studentService';
import './EditarAluno.css'; // Certifique-se que o CSS existe e está correto
import { getFaculdadesList } from '../../services/ajustesService';

const EditarAluno = ({ isOpen, onClose, onConfirm, aluno }) => {
  // Estado para a lista de faculdades
  const [faculdadesList, setFaculdadesList] = useState([]);
  const [loadingFaculdades, setLoadingFaculdades] = useState(true);

  // Estados para os campos do formulário
  const [nome, setNome] = useState('');
  const [faculdade, setFaculdade] = useState(''); // Inicializa vazio
  const [viagem, setViagem] = useState('bate-volta');

  // Estados para controle do formulário
  const [loadingSubmit, setLoadingSubmit] = useState(false); // Renomeado para clareza
  const [error, setError] = useState(null);

  // --- Efeito 1: Buscar a lista de faculdades ao montar ---
  useEffect(() => {
    let isMounted = true;
    const fetchFaculdades = async () => {
      setLoadingFaculdades(true);
      setError(null); // Limpa erros anteriores ao buscar faculdades
      try {
        const lista = await getFaculdadesList();
        if (isMounted) {
          setFaculdadesList(lista || []); // Garante que seja um array
        }
      } catch (err) {
        console.error("Erro ao buscar lista de faculdades:", err);
        if (isMounted) {
          setError("Não foi possível carregar as faculdades.");
        }
      } finally {
        if (isMounted) {
          setLoadingFaculdades(false);
        }
      }
    };

    if (isOpen) { // Busca faculdades somente quando o modal está aberto
        fetchFaculdades();
    }

    // Função de limpeza
    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]); // Depende de isOpen para rebuscar se o modal reabrir (opcional)

  // --- Efeito 2: Preencher o formulário quando 'aluno' mudar (e o modal estiver aberto) ---
  useEffect(() => {
    if (isOpen && aluno) {
      setNome(aluno.nome || ''); // Garante que seja string
      setFaculdade(aluno.faculdade || ''); // Define com o ID da faculdade ATUAL do aluno
      setViagem(aluno.viagem || 'bate-volta'); // Define com a viagem atual ou padrão
      setError(null); // Limpa erros ao carregar novo aluno
    } else if (!isOpen) {
        // Opcional: Limpar campos quando o modal fecha
        setNome('');
        setFaculdade('');
        setViagem('bate-volta');
        setError(null);
        setLoadingSubmit(false); // Garante que o loading de submit seja resetado
    }
  }, [aluno, isOpen]); // Depende de 'aluno' e 'isOpen'

  // --- Renderização Condicional ---
  if (!isOpen) {
    return null;
  }

  // --- Submissão do Formulário ---
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!nome.trim()) {
      setError("O nome do aluno é obrigatório.");
      return;
    }
     if (!faculdade) { // Verifica se uma faculdade foi selecionada
      setError("Selecione uma faculdade.");
      return;
    }

    // Objeto apenas com os dados a serem atualizados
    const dataToUpdate = { nome, faculdade, viagem };

    try {
      setLoadingSubmit(true); // Usa o estado de loading do submit
      setError(null);

      await updateStudent(aluno.id, dataToUpdate); // Chama updateStudent
      onConfirm(dataToUpdate); // Passa os dados atualizados (ou poderia ser apenas onClose)

    } catch (err) { // Renomeado para 'err' para evitar conflito com 'error' do estado
      console.error("Erro ao atualizar aluno:", err);
      setError("Erro ao atualizar aluno. Tente novamente.");
    } finally {
      setLoadingSubmit(false); // Usa o estado de loading do submit
    }
  };

  // --- Fechar ao Clicar Fora ---
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Determina se o select deve estar desabilitado
  const isSelectDisabled = loadingFaculdades || !faculdadesList || faculdadesList.length === 0;

  return (
    <div className='area-edit-student-overlay' onClick={handleOverlayClick}>
      <div className='edit-student-content' onClick={(e) => e.stopPropagation()}>
        <h3 className='h3-form-edit-student'>Editar Aluno</h3>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Input Nome */}
          <label className='edit-text-area'>
            <span>Nome: </span>
            <input
              type="text"
              id='edit-name-aluno' // IDs devem ser únicos na página
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={loadingSubmit} // Desabilita durante o submit
            />
          </label>

          {/* Select Faculdade */}
          <label className='edit-select-area'>
            <span>Faculdade:</span>
            <select
              name="faculdade-aluno"
              id='edit-faculdade-aluno' // IDs devem ser únicos
              value={faculdade} // Vinculado ao estado 'faculdade'
              onChange={(e) => setFaculdade(e.target.value)}
              disabled={loadingSubmit || isSelectDisabled} // Desabilita se carregando faculdades ou submetendo
              required
            >
              {loadingFaculdades ? (
                <option value="" disabled>Carregando faculdades...</option>
              ) : !faculdadesList || faculdadesList.length === 0 ? (
                <option value="" disabled>Nenhuma faculdade encontrada</option>
              ) : (
                faculdadesList.map(fac => (
                  <option key={fac.id} value={fac.id}>{fac.nome}</option> // Usa ID como value
                ))
              )}
            </select>
          </label>

          {/* Select Viagem */}
          <label className='edit-select-area'>
            <span>Viagem:</span>
            <select
              name="viagem"
              id='edit-viagem' // IDs devem ser únicos
              value={viagem}
              onChange={(e) => setViagem(e.target.value)}
              disabled={loadingSubmit} // Desabilita durante o submit
            >
              <option value="bate-volta">Ida e volta</option>
              <option value="ida">Ida</option>
              <option value="volta">Volta</option>
            </select>
          </label>

          {/* Botões */}
          <div className='area-edit-student-buttons'>
            <button
              type="submit"
              className='button-edit-student'
              disabled={loadingSubmit || loadingFaculdades} // Desabilita se carregando faculdades ou submetendo
            >
              {loadingSubmit ? "Salvando..." : "Salvar"}
            </button>
            <button
              type="button"
              className='button-cancel-edit-student'
              onClick={onClose}
              disabled={loadingSubmit} // Desabilita durante o submit
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarAluno;