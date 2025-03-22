import { useState } from 'react';
import './AdicionarAluno.css';
import { addStudent } from '../../services/studentService';

const AdicionarAluno = ({ isOpen, onClose, selectedDate }) => {
  const [nome, setNome] = useState('');
  const [faculdade, setFaculdade] = useState('uefs');
  const [viagem, setViagem] = useState('bate-volta');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!nome.trim()) {
      setError("O nome do aluno é obrigatório");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await addStudent({
        nome,
        faculdade,
        viagem
      });
      
      // Resetar formulário
      setNome('');
      setFaculdade('uefs');
      setViagem('bate-volta');
      
      onClose();
    } catch (err) {
      console.error("Erro ao adicionar aluno:", err);
      setError("Erro ao adicionar aluno. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className='area-add-student-overlay' onClick={handleOverlayClick}>
      <div className='add-student-content' onClick={(e) => e.stopPropagation()}>
        <h3 className='h3-form-add-student'>Adicionar nome na lista</h3>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <label className='text-area'>
            <span>Nome: </span>
            <input
              type="text"
              id='name-aluno'
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={loading}
            />
          </label>
          <label className='select-area'>
            <span>Faculdade:</span>
            <select
              name="faculdade-aluno"
              id="faculdade-aluno"
              value={faculdade}
              onChange={(e) => setFaculdade(e.target.value)}
              disabled={loading}
            >
              <option value="uefs">UEFS</option>
              <option value="pitagoras">Pitagoras</option>
              <option value="unifan">UNIFAN</option>
              <option value="fat">FAT</option>
              <option value="unef">UNEF</option>
            </select>
          </label>
          <label className='select-area'>
            <span>Viagem:</span>
            <select
              name="viagem"
              id="viagem"
              value={viagem}
              onChange={(e) => setViagem(e.target.value)}
              disabled={loading}
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
              disabled={loading}
            >
              {loading ? "Adicionando..." : "Adicionar"}
            </button>
            <button 
              type="button" 
              className='button-cancel-add-student' 
              onClick={onClose}
              disabled={loading}
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