# Plano de Implementação do Firebase com Realtime Database

Este plano detalha como implementar o Firebase com Realtime Database no projeto de Transporte Universitário.

## 1. Configuração Inicial do Firebase

### Passo 1: Instalar dependências

```bash
npm install firebase react-router-dom
```

### Passo 2: Criar o arquivo de configuração

```javascript
// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Substitua com as suas próprias configurações do Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL, // Importante para Realtime Database
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

export { db, auth };
```

### Passo 3: Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```
VITE_FIREBASE_API_KEY=seu-api-key
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://seu-projeto-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu-messaging-sender-id
VITE_FIREBASE_APP_ID=seu-app-id
```

## 2. Contexto de Autenticação

```javascript
// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Função para cadastro
  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  // Função para login
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Função para logout
  function logout() {
    return signOut(auth);
  }

  // Configura o listener de estado da autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
```

## 3. Serviço de Dados para Alunos (Usando Realtime Database)

```javascript
// src/services/studentService.js
import { 
  ref, 
  set, 
  push, 
  update, 
  remove, 
  query, 
  orderByChild, 
  equalTo, 
  get, 
  onValue
} from 'firebase/database';
import { db } from '../firebase/config';

// Referência para a coleção de alunos
const studentsRef = ref(db, 'students');

// Formatar data como string YYYY-MM-DD para usar como chave
const formatDateKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Obter todos os alunos para uma data específica
export const getStudents = async (date = new Date()) => {
  const dateKey = formatDateKey(date);
  const dateRef = ref(db, `students/${dateKey}`);
  
  return new Promise((resolve, reject) => {
    onValue(dateRef, (snapshot) => {
      const students = [];
      snapshot.forEach((childSnapshot) => {
        students.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      resolve(students);
    }, {
      onlyOnce: true
    }, (error) => {
      reject(error);
    });
  });
};

// Configurar listener em tempo real para uma data específica
export const subscribeToStudents = (date, callback) => {
  const dateKey = formatDateKey(date);
  const dateRef = ref(db, `students/${dateKey}`);
  
  const unsubscribe = onValue(dateRef, (snapshot) => {
    const students = [];
    snapshot.forEach((childSnapshot) => {
      students.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });
    callback(students);
  });
  
  // Retornar função para cancelar a inscrição
  return unsubscribe;
};

// Adicionar um novo aluno
export const addStudent = async (studentData) => {
  const dateKey = formatDateKey(new Date());
  const newStudentRef = push(ref(db, `students/${dateKey}`));
  
  const studentWithMetadata = {
    ...studentData,
    timestamp: Date.now(),
    liberado: false
  };
  
  await set(newStudentRef, studentWithMetadata);
  
  return {
    id: newStudentRef.key,
    ...studentWithMetadata
  };
};

// Atualizar um aluno
export const updateStudent = async (id, studentData, date = new Date()) => {
  const dateKey = formatDateKey(date);
  const studentRef = ref(db, `students/${dateKey}/${id}`);
  
  const updates = {
    ...studentData,
    updatedAt: Date.now()
  };
  
  await update(studentRef, updates);
  
  return {
    id,
    ...updates
  };
};

// Excluir um aluno
export const deleteStudent = async (id, date = new Date()) => {
  const dateKey = formatDateKey(date);
  const studentRef = ref(db, `students/${dateKey}/${id}`);
  await remove(studentRef);
  return id;
};

// Alternar o status "liberado" de um aluno
export const toggleStudentStatus = async (id, currentStatus, date = new Date()) => {
  const dateKey = formatDateKey(date);
  const studentRef = ref(db, `students/${dateKey}/${id}`);
  
  await update(studentRef, {
    liberado: !currentStatus,
    updatedAt: Date.now()
  });
  
  return {
    id,
    liberado: !currentStatus
  };
};
```

## 4. Componentes da Aplicação

### 4.1 App.jsx (Componente Principal com Rotas)

```javascript
// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Inicio from './pages/Inicio/Inicio.jsx';
import Login from './pages/Login/Login.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

// Componente de rota protegida
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Inicio />
              </ProtectedRoute>
            } 
          />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

### 4.2 Página de Login

```javascript
// src/pages/Login/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Falha ao fazer login. Verifique suas credenciais.');
      console.error(err);
    }
    
    setLoading(false);
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Transporte Universitário</h2>
        <h3>Login</h3>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Senha:</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button 
            type="submit" 
            className="login-button" 
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
```

```css
/* src/pages/Login/Login.css */
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fb;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 30px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.login-card h2 {
  text-align: center;
  color: #4a6cf7;
  margin-bottom: 10px;
}

.login-card h3 {
  text-align: center;
  color: #393939;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #393939;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
}

.form-group input:focus {
  border-color: #4a6cf7;
  outline: none;
}

.login-button {
  width: 100%;
  padding: 12px;
  background-color: #4a6cf7;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login-button:hover {
  background-color: #405ed9;
}

.login-button:disabled {
  background-color: #a0a0a0;
  cursor: not-allowed;
}

.error-message {
  color: #d9534f;
  margin-bottom: 15px;
  padding: 10px;
  background-color: rgba(217, 83, 79, 0.1);
  border-radius: 5px;
  text-align: center;
}
```

### 4.3 Componente Inicio (Página Principal)

```javascript
// src/pages/Inicio/Inicio.jsx
import React, { useState, useEffect } from 'react';
import BarraNavegacao from '../../components/BarraNavegacao/BarraNavegacao'; 
import AddButton from '../../components/AddButton/AddButton';
import ListaAlunos from '../../components/ListaAlunos/ListaAlunos';
import { subscribeToStudents } from '../../services/studentService';
import './Inicio.css';

function Inicio() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Configurar listener em tempo real para alunos
        const unsubscribe = subscribeToStudents(selectedDate, (updatedStudents) => {
            setStudents(updatedStudents);
            setLoading(false);
        });
        
        // Limpar listener ao desmontar
        return () => unsubscribe();
    }, [selectedDate]);

    const handleDateChange = (date) => {
        setSelectedDate(date);
        setLoading(true);
    };

    return (
        <div className="inicio-container">
            <BarraNavegacao />
            <div className='inicio-content'>
                <main className="inicio-content">
                    <AddButton 
                        onDateChange={handleDateChange} 
                        selectedDate={selectedDate} 
                    />
                    <ListaAlunos 
                        students={students}
                        loading={loading}
                        selectedDate={selectedDate}
                    />
                </main>
            </div>
        </div>
    );
}

export default Inicio;
```

### 4.4 Componente ListaAlunos

```javascript
// src/components/ListaAlunos/ListaAlunos.jsx
import { useState } from "react";
import "./ListaAlunos.css";
import { BsTrash3Fill, BsFillPencilFill, BsCheckLg } from "react-icons/bs";
import ModalDelete from "../ModalDelete/ModalDelete";
import EditarAluno from "../EditarAluno/EditarAluno";
import { deleteStudent, toggleStudentStatus, updateStudent } from "../../services/studentService";

const ListaAlunos = ({ students, loading, selectedDate }) => {
  const [error, setError] = useState(null);
  
  const [showModal, setShowModal] = useState(false);
  const [alunoToDelete, setAlunoToDelete] = useState(null);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [alunoEdit, setAlunoEdit] = useState(null);

  // Lidar com exclusão de aluno
  const handleDeleteClick = (aluno) => {
    setAlunoToDelete(aluno);
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteStudent(alunoToDelete.id, selectedDate);
      setShowModal(false);
      setAlunoToDelete(null);
    } catch (err) {
      console.error("Erro ao excluir aluno:", err);
      setError("Erro ao excluir aluno. Tente novamente.");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setAlunoToDelete(null);
  };

  // Lidar com mudança de status do aluno
  const handleReadyClick = async (alunoId) => {
    try {
      const aluno = students.find(a => a.id === alunoId);
      await toggleStudentStatus(alunoId, aluno.liberado, selectedDate);
    } catch (err) {
      console.error("Erro ao atualizar status do aluno:", err);
      setError("Erro ao atualizar status do aluno. Tente novamente.");
    }
  };

  // Lidar com edição de aluno
  const handleEditClick = (aluno) => {
    setAlunoEdit(aluno);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setAlunoEdit(null);
    setShowEditModal(false);
  };

  const handleConfirmEdit = async (updatedAluno) => {
    try {
      await updateStudent(updatedAluno.id, updatedAluno, selectedDate);
      setShowEditModal(false);
      setAlunoEdit(null);
    } catch (err) {
      console.error("Erro ao atualizar aluno:", err);
      setError("Erro ao atualizar dados do aluno. Tente novamente.");
    }
  };

  // Função para agrupar alunos por faculdade
  const groupStudentsByFaculty = () => {
    const grouped = {};
    
    students.forEach(aluno => {
      const faculty = aluno.faculdade.toUpperCase();
      if (!grouped[faculty]) {
        grouped[faculty] = [];
      }
      grouped[faculty].push(aluno);
    });
    
    return grouped;
  };

  if (loading) {
    return <div className="loading">Carregando lista de alunos...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const groupedStudents = groupStudentsByFaculty();

  return (
    <div className="container-lista-alunos">
      <div className="lista-alunos">
        {Object.keys(groupedStudents).length === 0 ? (
          <p className="no-students-message">Nenhum aluno cadastrado para esta data.</p>
        ) : (
          Object.entries(groupedStudents).map(([faculty, facultyStudents]) => (
            <ul className="ul-lista-alunos" key={faculty}>
              <li className="li-college">
                <p className="paragraph-college">{faculty}:</p>
              </li>
              {facultyStudents.map((aluno, index) => (
                <li className="li-student" key={aluno.id}>
                  <div className="paragraph-area">
                    <p className="paragraph-student">
                      {index + 1}. {aluno.nome} {aluno.liberado && "✅"}
                    </p>
                  </div>
                  <div className="list-buttons">
                    <button 
                      className="button-ready" 
                      onClick={() => handleReadyClick(aluno.id)}
                    >
                      <BsCheckLg />
                    </button>
                    <button 
                      className="button-edit" 
                      onClick={() => handleEditClick(aluno)}
                    >
                      <BsFillPencilFill />
                    </button>
                    <button
                      className="button-delete"
                      onClick={() => handleDeleteClick(aluno)}
                    >
                      <BsTrash3Fill />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ))
        )}
      </div>

      {showModal && (
        <ModalDelete
          isOpen={showModal}
          onClose={handleCloseModal}
          onConfirm={handleConfirmDelete}
        >
          <h3 className="h3-modal-delete">Confirmar Exclusão</h3>
          <p className="paragraph-modal-delete">
            Tem certeza de que deseja remover {alunoToDelete ? alunoToDelete.nome : ''} da lista?
          </p>
        </ModalDelete>
      )}

      {showEditModal && (
        <EditarAluno 
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          onConfirm={handleConfirmEdit}
          aluno={alunoEdit}
        />
      )}
    </div>
  );
};

export default ListaAlunos;
```

### 4.5 Componente AddButton

```javascript
// src/components/AddButton/AddButton.jsx
import { useState } from 'react'
import './AddButton.css'
import AdicionarAluno from '../AdicionarAluno/AdicionarAluno';

const AddButton = ({ onDateChange, selectedDate }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  
  const handleClickAddForm = () => {
    setShowAddForm(true);
  }

  const handleCloseAddForm = () => {
    setShowAddForm(false);
  }
  
  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    if (onDateChange) {
      onDateChange(newDate);
    }
  };
  
  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR');
  };
  
  const getISODate = (date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className='add-button-area'>
      <div className="date-area">
        <p className='paragraph-date'>Lista do dia: </p>
        <input 
          type="date" 
          value={getISODate(selectedDate)} 
          onChange={handleDateChange} 
          className="date-selector"
        />
        <span>{formatDate(selectedDate)}</span>
      </div>
      <button className='add-button' onClick={() => handleClickAddForm()}>
        Adicionar
      </button>

      {showAddForm && (
        <AdicionarAluno 
          isOpen={showAddForm}
          onClose={handleCloseAddForm}
          selectedDate={selectedDate}
        />
      )}
    </div>
  )
}

export default AddButton;
```

### 4.6 Componente AdicionarAluno

```javascript
// src/components/AdicionarAluno/AdicionarAluno.jsx
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
```

### 4.7 Componente EditarAluno

```javascript
// src/components/EditarAluno/EditarAluno.jsx
import React, { useState, useEffect } from 'react';
import './EditarAluno.css';

const EditarAluno = ({ isOpen, onClose, onConfirm, aluno }) => {
  const [nome, setNome] = useState('');
  const [faculdade, setFaculdade] = useState('uefs');
  const [viagem, setViagem] = useState('bate-volta');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (aluno) {
      setNome(aluno.nome);
      setFaculdade(aluno.faculdade);
      setViagem(aluno.viagem);
    }
  }, [aluno]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    
    const updatedAluno = {
      id: aluno.id,
      nome,
      faculdade,
      viagem
    };
    
    onConfirm(updatedAluno);
    setLoading(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className='area-edit-student-overlay' onClick={handleOverlayClick}>
      <div className='edit-student-content' onClick={(e) => e.stopPropagation()}>
        <h3 className='h3-form-edit-student'>Editar</h3>
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
          <div className='area-edit-student-buttons'>
            <button 
              type="submit" 
              className='button-edit-student'
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
            <button 
              type="button" 
              className='button-cancel-edit-student' 
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

export default EditarAluno;
```

### 4.8 Componente BarraNavegacao

```javascript
// src/components/BarraNavegacao/BarraNavegacao.jsx
import { useState } from 'react';
import './BarraNavegacao.css'
import { BsList } from "react-icons/bs";
import MenuLateral from '../MenuLateral/MenuLateral';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const BarraNavegacao = () => {
  const [showMenu, setShowMenu] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleMenuClick = () => {
    setShowMenu(true);
  };
  
  const handleCloseMenu = () => {
    setShowMenu(false);
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };
  
  return (
    <div className="nav-bar">
      <h2>Transporte universitário</h2>
      <div className="navbar-user-area">
        {currentUser && (
          <span className="user-email">{currentUser.email}</span>
        )}
        <button className='menu-button' onClick={() => handleMenuClick()}>
          <BsList />
        </button>
      </div>
      
      {showMenu && (
        <MenuLateral 
          isOpen={showMenu}
          onClose={handleCloseMenu}
          onLogout={handleLogout}
        />
      )}
    </div>
  )
}

export default BarraNavegacao;
```

### 4.9 Componente MenuLateral

```javascript
// src/components/MenuLateral/MenuLateral.jsx
import './MenuLateral.css'
import { BsArrowLeft, BsBoxArrowRight } from "react-icons/bs";

const MenuLateral = ({ isOpen, onClose, onLogout }) => {
  if(!isOpen) {
    return null;
  }

  return (
    <div className='menu-area-overlay' onClick={onClose}>
      <div className='menu-content' onClick={(e) => e.stopPropagation()}>
        <div className='back-button-area'>
          <button className='back-button' onClick={onClose}>
            <BsArrowLeft />
            <p>Voltar</p>
          </button>
        </div>
        <div className='menu-buttons-area'>
          <div className='area-sidebar-button'>
            <a href="/" className='menu-sidebar-button'>Início</a>
          </div>
          <div className='area-sidebar-button'>
            <a href="/historico" className='menu-sidebar-button'>Histórico</a>
          </div>
          <div className='area-sidebar-button'>
            <a href="/passagens" className='menu-sidebar-button'>Passagens</a>
          </div>
          <div className='area-sidebar-button'>
            <a href="/pagamentos" className='menu-sidebar-button'>Pagamentos</a>
          </div>
          <div className='area-sidebar-button logout-button-area'>
            <button 
              className='menu-sidebar-button logout-button' 
              onClick={onLogout}
            >
              <span className="logout-text">Sair</span>
              <BsBoxArrowRight className="logout-icon" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MenuLateral;
```

## 5. Regras de Segurança do Realtime Database

Configure as regras de segurança no console do Firebase para o Realtime Database:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "students": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

## 6. Passos para Implementação

1. **Criar projeto no Firebase**:
   - Acesse o console do Firebase (https://console.firebase.google.com/)
   - Crie um novo projeto
   - Configure a autenticação com email/senha
   - Crie um Realtime Database (importante: não Firestore!)
   - Configure as regras de segurança
   
2. **Obter as credenciais**:
   - No console do Firebase, vá para Configurações do projeto > Seus aplicativos
   - Adicione um aplicativo da web
   - Copie as credenciais de configuração para o arquivo `.env.local`
   
3. **Instalar dependências**:
   ```bash
   npm install firebase react-router-dom
   ```

4. **Criar estrutura de diretórios**:
   ```
   src/
     ├── firebase/
     │    └── config.js
     ├── contexts/
     │    └── AuthContext.jsx
     ├── services/
     │    └── studentService.js
     ├── pages/
     │    ├── Inicio/
     │    └── Login/
     ├── components/
     │    ├── BarraNavegacao/
     │    ├── AddButton/
     │    ├── ListaAlunos/
     │    ├── AdicionarAluno/
     │    ├── EditarAluno/
     │    ├── MenuLateral/
     │    └── ModalDelete/
     ```

5. **Criar usuários de teste**:
   - No console do Firebase, vá para Authentication > Usuários
   - Adicione um novo usuário com email e senha

6. **Testar o aplicativo**:
   - Execute `npm run dev` para iniciar o servidor de desenvolvimento
   - Teste as funcionalidades de login, adição, edição e exclusão de alunos
   - Verifique a sincronização em tempo real entre diferentes dispositivos/navegadores

## 7. Principais Características da Implementação

1. **Autenticação de usuários**:
   - Login com email/senha
   - Proteção de rotas
   - Logout

2. **Sincronização em tempo real**:
   - Atualização instantânea dos dados entre diferentes dispositivos
   - Listeners para detecção de mudanças

3. **Persistência de dados**:
   - Armazenamento no Realtime Database do Firebase
   - Organização dos dados por data

4. **Filtro por data**:
   - Possibilidade de selecionar datas diferentes para visualizar ou adicionar dados

5. **Operações CRUD completas**:
   - Criar (Create): Adicionar novos alunos
   - Ler (Read): Carregar e atualizar lista de alunos em tempo real
   - Atualizar (Update): Editar informações e status de alunos
   - Excluir (Delete): Remover alunos

## 8. Estrutura do Banco de Dados

```
students/
  ├── 2025-03-17/  # Data formatada como YYYY-MM-DD
  │    ├── -NvxYZ123abc/  # ID gerado pelo Firebase
  │    │    ├── nome: "João"
  │    │    ├── faculdade: "uefs"
  │    │    ├── viagem: "bate-volta"
  │    │    ├── liberado: true
  │    │    ├── timestamp: 1710673200000
  │    │    └── updatedAt: 1710673300000
  │    └── ...
  ├── 2025-03-18/
  └── ...
```

Esta implementação permitirá adicionar, visualizar, editar e excluir alunos da lista de transporte universitário, com atualizações em tempo real e dados persistentes no Realtime Database do Firebase.
