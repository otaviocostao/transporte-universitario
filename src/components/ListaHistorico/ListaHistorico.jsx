import { useState } from "react";
import './ListaHistorico.css'

const ListaHistorico = ({students, loading, selectedDate}) => {
    const [error, setError] = useState(null);

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
    <div className='lista-historico-content'>
        <div className="historico-lista-alunos">
        {Object.keys(groupedStudents).length === 0 ? (
          <p className="no-students-message">Nenhum estudante cadastrado para esta data.</p>
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
                      {index + 1}. {aluno.nome}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ))
        )}
      </div>
    </div>
  )
}

export default ListaHistorico;
