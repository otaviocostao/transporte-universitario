import './AddFaculdadeModal.css';
// addFaculdade NÃO é mais importado aqui, será chamado pelo componente pai
import { useState } from 'react';

const AddFaculdadeModal = ({ isOpen, onClose, onConfirm }) => { 
    const [nome, setNome] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) {
        return null;
    }

    const handleOverlayClick = (e) => {
        
        if (!loading && e.target === e.currentTarget) {
          onClose();
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!nome.trim()) {
          setError("O nome da instituição é obrigatório.");
          return;
        }

        setLoading(true);
        setError(null);

        try {
          await onConfirm({ nome });
          setNome('');

        } catch (err) {
          console.error("Erro originado ao tentar adicionar faculdade:", err);
          setError(err.message || "Erro ao adicionar faculdade. Tente novamente.");
        } finally {
          setLoading(false); 
        }
      };

  return (
    // Usa handleOverlayClick para fechar ao clicar fora
    <div className='area-add-faculdade-overlay' onClick={handleOverlayClick}>
        <div className='add-faculdade-content' onClick={(e) => e.stopPropagation()}>
            <h3 className='h3-form-add-faculdade'>Adicionar Faculdade na Rota</h3>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
                <label className='add-text-area'>
                    <span>Instituição: </span>
                    <input
                      type="text"
                      id='name-faculdade'
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      disabled={loading}
                      placeholder="Nome da Faculdade" // Placeholder é útil
                    />
                </label>
                <div className='area-add-faculdade-buttons'>
                    <button
                      type="submit"
                      className='button-add-faculdade'
                      disabled={loading}
                    >
                      {loading ? "Adicionando..." : "Adicionar"}
                    </button>
                    <button
                      type="button"
                      className='button-cancel-add-faculdade'
                      onClick={onClose} // Botão cancelar sempre chama onClose
                      disabled={loading}
                    >
                      Cancelar
                    </button>
                </div>
            </form>
        </div>
    </div>
  )
}

export default AddFaculdadeModal;