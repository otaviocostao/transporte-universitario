import React, { useState } from 'react'

const AddUsuarioModal = ({}) => {
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [faculdadeId, setFaculdadeId] = useState('');
  const [timeStampCriacao, setTimeStampCriacao] = useState('');
  const [ultimoLogin, setUltimoLogin] = useState('');
  const [regras, setRegras] = useState('');
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

  return (
    <div className='area-add-usuario-overlay' onClick={handleOverlayClick}>
      <div className='add-usuario-content' onClick={(e) => e.stopPropagation()}>
        <h3 className='h3-form-add-usuario'>Adicionar usuário</h3>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
                <label className='add-text-area'>
                    <span>Nome: </span>
                    <input
                      type="text"
                      id='nome-usuario'
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      disabled={loading}
                      placeholder="Nome do usuario"
                    />
                </label>
                <label className='add-text-area'>
                    <span>Sobrenome: </span>
                    <input
                      type="text"
                      id='sobrenome-usuario'
                      value={sobrenome}
                      onChange={(e) => setSobrenome(e.target.value)}
                      disabled={loading}
                      placeholder="Sobrenome do usuario"
                    />
                </label>
                <label className='add-text-area'>
                    <span>Email: </span>
                    <input
                      type="text"
                      id='email-usuario'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      placeholder="E-mail do usuario"
                    />
                </label>
                <label className='add-text-area'>
                    <span>Senha: </span>
                    <input
                      type="text"
                      id='senha-faculdade'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      placeholder="Senha do usuario"
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

export default AddUsuarioModal