import React, { useEffect, useState } from 'react'
import { updateFaculdade } from '../../../services/ajustesService';

const EditFaculdadeModal = ({isOpen, onClose, onConfirm, faculdade}) => {

  const[nome, setNome] = useState('');
  const[embarque, setEmbarque] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  if (!isOpen) {
    return null;
  }

  useEffect(() => {
    if(faculdade){
      setNome(faculdade.nome);
      setEmbarque(faculdade.embarque)
    }
  }, [faculdade]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!nome.trim()) {
      setError("O nome da instituição é obrigatório.");
      return;
    }

    try{
      setLoading(true);
      setError(null);

      const updatedFaculdade = await updateFaculdade(faculdade.id, {nome, embarque});
      onConfirm(updatedFaculdade);
    
    } catch (error) {
      console.error("Erro ao atualizar faculdade");
      setError("Erro ao atualizar faculdade. Tente novamente");
    }finally{
      setLoading(false);
    }
  };

  
  const handleOverlayClick = (e) => {
    if (!loading && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className='area-add-faculdade-overlay' onClick={handleOverlayClick}>
        <div className='add-faculdade-content' onClick={(e) => e.stopPropagation()}>
            <h3 className='h3-form-add-faculdade'>Editar Faculdade</h3>

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
                    />
                </label>
                <label className='form-group checkbox-group'>
                  <span>Embarque:</span>
                  <input
                      type="checkbox"
                      checked={embarque}
                      onChange={(e) => setEmbarque(e.target.checked)}
                      disabled={loading}
                  />
                </label>
                <div className='area-add-faculdade-buttons'>
                    <button
                      type="submit"
                      className='button-add-faculdade'
                      disabled={loading}
                    >
                      {loading ? "Salvando..." : "Salvar"}
                    </button>
                    <button
                      type="button"
                      className='button-cancel-add-faculdade'
                      onClick={onClose}
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

export default EditFaculdadeModal