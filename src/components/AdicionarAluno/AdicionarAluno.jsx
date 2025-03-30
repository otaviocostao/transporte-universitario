import { useEffect, useState } from 'react';
import './AdicionarAluno.css';
import { addStudent } from '../../services/studentService';
import { getFaculdadesList } from '../../services/ajustesService';

const AdicionarAluno = ({ isOpen, onClose }) => {
  const [faculdadesList, setFaculdadesList] = useState([]);
  const [nome, setNome] = useState('');
  // 1. Inicialize 'faculdade' com uma string vazia ou null
  const [faculdade, setFaculdade] = useState('');
  const [viagem, setViagem] = useState('bate-volta');
  const [loadingFaculdades, setLoadingFaculdades] = useState(true); // Loading específico para faculdades
  const [loadingSubmit, setLoadingSubmit] = useState(false); // Loading para o submit
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true; // Flag para verificar se o componente ainda está montado
    const fetchFaculdades = async () => {
      setLoadingFaculdades(true); // Começa a carregar faculdades
      try {
        const lista = await getFaculdadesList();
        if (isMounted) { // Verifica se o componente ainda está montado
          setFaculdadesList(lista);
          // 2. Define o default AQUI, *depois* de buscar e se a lista não estiver vazia
          if (lista && lista.length > 0) {
            setFaculdade(lista[0].id); // Define o ID da primeira faculdade como default
          } else {
            setFaculdade(''); // Garante que fique vazio se a lista vier vazia
          }
        }
      } catch (err) {
        console.error("Erro ao buscar lista de faculdades:", err);
        if (isMounted) {
          setError("Não foi possível carregar as faculdades.");
        }
      } finally {
        if (isMounted) {
          setLoadingFaculdades(false); // Termina de carregar faculdades
        }
      }
    };
    fetchFaculdades();

    // Função de limpeza para evitar atualização de estado em componente desmontado
    return () => {
      isMounted = false;
    };
  }, []); // Array de dependências vazio, executa apenas uma vez ao montar

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!nome.trim()) {
      setError("O campo nome é obrigatório.");
      return;
    }
     if (!faculdade) { // Verifica se uma faculdade foi selecionada
      setError("Selecione uma faculdade.");
      return;
    }


    try {
      setLoadingSubmit(true); // Inicia loading do submit
      setError(null);

      await addStudent({ nome, faculdade, viagem }); // Chama addStudent

      // Limpa os campos após o sucesso
      setNome('');
      // 3. Reseta para o primeiro ID da lista atual OU para vazio
      setFaculdade(faculdadesList && faculdadesList.length > 0 ? faculdadesList[0].id : '');
      setViagem('bate-volta');
      onClose();

    } catch (err) {
      console.error("Erro ao adicionar aluno:", err);
      setError("Erro ao adicionar aluno. Tente novamente.");
    } finally {
      setLoadingSubmit(false); // Termina loading do submit
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Determina se o select deve estar desabilitado
  const isSelectDisabled = loadingFaculdades || !faculdadesList || faculdadesList.length === 0;

  return (
    <div className='area-add-student-overlay' onClick={handleOverlayClick}>
      <div className='add-student-content' onClick={(e) => e.stopPropagation()}>
        <h3 className='h3-form-add-student'>Adicionar nome na lista</h3>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label className='add-text-area'>
            <span>Nome: </span>
            <input
              type="text"
              id='name-aluno'
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={loadingSubmit} // Desabilita durante o submit
            />
          </label>
          <label className='add-select-area'>
            <span>Destino:</span>
            <select
              name="faculdade-aluno"
              id="faculdade-aluno"
              value={faculdade} // Vinculado ao estado 'faculdade'
              onChange={(e) => setFaculdade(e.target.value)}
              disabled={loadingSubmit || isSelectDisabled} // Desabilita no submit ou se carregando/vazio
              required // Torna o campo obrigatório no HTML
            >
              {loadingFaculdades ? (
                <option value="" disabled>Carregando faculdades...</option>
              ) : !faculdadesList || faculdadesList.length === 0 ? (
                <option value="" disabled>Nenhuma faculdade encontrada</option>
              ) : (
                // 4. Mapeia a lista usando o ID como 'value'
                faculdadesList.map(fac => (
                  <option key={fac.id} value={fac.id}>{fac.nome}</option>
                ))
              )}
            </select>
          </label>
          <label className='add-select-area'>
            <span>Viagem:</span>
            <select
              name="viagem"
              id="viagem"
              value={viagem}
              onChange={(e) => setViagem(e.target.value)}
              disabled={loadingSubmit} // Desabilita durante o submit
            >
              <option value="bate-volta">Ida e volta</option>
              <option value="ida">Ida</option>
              <option value="volta">Volta</option>
            </select>
          </label>
          <div className='area-add-student-buttons'>
            <button
              type="submit"
              className='button-add-student'
              disabled={loadingSubmit || isSelectDisabled} // Desabilita se carregando ou lista vazia
            >
              {loadingSubmit ? "Adicionando..." : "Adicionar"}
            </button>
            <button
              type="button"
              className='button-cancel-add-student'
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

export default AdicionarAluno;