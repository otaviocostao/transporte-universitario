import React, { useState, useMemo, useEffect } from "react"; // Adicionado React, useMemo, useEffect
import './ListaHistorico.css';

// Recebe faculdadesList e error (opcional, mas bom para consistência se vier do pai)
const ListaHistorico = ({ students, loading, error, faculdadesList, selectedDate }) => {
    // Mantém um erro local caso algo específico daqui falhe, mas usa o erro global se existir
    const [localError, setLocalError] = useState(null);

    // Limpa erro local se erro global mudar (boa prática vinda do ListaAlunos)
    useEffect(() => {
        setLocalError(null);
    }, [error]);

    // --- Lógica de Agrupamento e Ordenação (Adaptada do ListaAlunos.jsx) ---

    // 1. Mapa de prioridade (usa ID como chave)
    const priorityLookup = useMemo(() => {
        const lookup = {};
        if (Array.isArray(faculdadesList)) {
            faculdadesList.forEach(fac => {
                if (fac && typeof fac.id === 'string' && typeof fac.indice === 'number' && !isNaN(fac.indice)) {
                    lookup[fac.id.toUpperCase()] = fac.indice;
                } else {
                    if (fac && typeof fac.id === 'string') {
                        lookup[fac.id.toUpperCase()] = Infinity; // Prioridade baixa se indice inválido
                    }
                }
            });
        }
        return lookup;
    }, [faculdadesList]);

    // 2. Mapa para buscar Nome pelo ID
    const facultyNameLookup = useMemo(() => {
        const lookup = {};
        if (Array.isArray(faculdadesList)) {
            faculdadesList.forEach(fac => {
                if (fac && typeof fac.id === 'string' && typeof fac.nome === 'string') {
                    lookup[fac.id.toUpperCase()] = fac.nome;
                }
            });
        }
        return lookup;
    }, [faculdadesList]);

    // 3. Agrupa estudantes pelo ID da faculdade
    const groupedStudents = useMemo(() => {
        const grouped = {};
        if (Array.isArray(students)) {
            students.forEach((aluno) => {
                if (aluno && typeof aluno.faculdade === 'string') { // aluno.faculdade é o ID
                    const facultyId = aluno.faculdade.toUpperCase(); // Usa o ID como chave
                    if (!grouped[facultyId]) {
                        grouped[facultyId] = [];
                    }
                    grouped[facultyId].push(aluno);
                } else {
                    // Opcional: Agrupar alunos sem faculdade definida ou com formato inválido
                    const unknownFacultyKey = 'SEM_FACULDADE';
                     if (!grouped[unknownFacultyKey]) {
                        grouped[unknownFacultyKey] = [];
                    }
                    grouped[unknownFacultyKey].push(aluno);
                }
            });
        }
        return grouped;
    }, [students]);

    // 4. Ordena as entradas das faculdades (usando 'indice' via priorityLookup pelo ID)
    const sortedFacultyEntries = useMemo(() => {
        if (typeof groupedStudents !== 'object' || groupedStudents === null) {
            return [];
        }
        const entries = Object.entries(groupedStudents);

        entries.sort(([facultyIdA], [facultyIdB]) => { // Ordena pelos IDs
             // Trata o caso 'SEM_FACULDADE' para ficar por último
            if (facultyIdA === 'SEM_FACULDADE') return 1;
            if (facultyIdB === 'SEM_FACULDADE') return -1;

            const priorityA = priorityLookup[facultyIdA] ?? Infinity;
            const priorityB = priorityLookup[facultyIdB] ?? Infinity;
            return priorityA - priorityB; // Ordena por indice ascendente
        });

        return entries;
    }, [groupedStudents, priorityLookup]);

    // --- Renderização ---

    if (loading) {
        return <div className="loading">Carregando histórico de alunos...</div>; // Mensagem um pouco diferente
    }

    // Exibe erro global ou local
    if (error || localError) {
        return <div className="error-message">{error || localError}</div>;
    }

    // Usa sortedFacultyEntries para verificar se há alunos
    const hasStudents = sortedFacultyEntries.length > 0 && sortedFacultyEntries.some(([_, facultyStudents]) => facultyStudents.length > 0);

    return (
        <div className='lista-historico-content'>
            <div className="historico-lista-alunos">
                {!hasStudents ? ( // Verifica se a lista ordenada está vazia
                    <p className="no-students-message">Nenhum estudante registrado para esta data no histórico.</p>
                ) : (
                    // Mapeia as entradas JÁ ORDENADAS
                    sortedFacultyEntries.map(([facultyId, facultyStudents]) => {
                        // Não renderiza a seção se não houver alunos para essa faculdade
                        if (facultyStudents.length === 0) return null;

                        // Define o nome a ser exibido
                        let facultyDisplayName = facultyNameLookup[facultyId] ?? facultyId;
                        if (facultyId === 'SEM_FACULDADE') {
                            facultyDisplayName = "Alunos sem faculdade definida";
                        }


                        return (
                            <ul className="ul-lista-alunos" key={facultyId}> {/* Usa ID como key */}
                                <li className="li-college">
                                    {/* Usa facultyNameLookup para exibir o NOME */}
                                    <p className="paragraph-college">
                                        {facultyDisplayName}: {/* Busca o nome; fallback para ID */}
                                    </p>
                                </li>
                                {facultyStudents.map((aluno, index) => (
                                    <li className="li-student" key={aluno.id}>
                                        <div className="paragraph-area">
                                            <p className="paragraph-student">
                                                {index + 1}. {aluno.nome}
                                                {aluno.viagem === "ida" && (
                                                    <span className="stats-nao-volta">(ida)</span>
                                                )}
                                                {aluno.viagem === "volta" && (
                                                    <span className="stats-volta">(volta)</span>
                                                )}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ListaHistorico;