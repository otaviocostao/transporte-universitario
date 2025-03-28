import React, { useState, useEffect, useMemo } from 'react'; // Import useMemo
import AddPassagem from '../../components/AddPassagem/AddPassagem';
import BarraNavegacao from '../../components/BarraNavegacao/BarraNavegacao';
import FiltroPassagens from '../../components/FiltroPassagens/FiltroPassagens';
import ListaPassagens from '../../components/ListaPassagens/ListaPassagens';
import './Passagens.css';
// Importe a função de serviço ADAPTADA para buscar no RANGE
import { subscribeToPassagensInRange } from '../../services/passagensService'; // <<---- MUDE AQUI

// Função auxiliar para obter a data de hoje no formato YYYY-MM-DD local
const getTodayString = () => {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  const adjustedDate = new Date(today.getTime() - (offset * 60 * 1000));
  return adjustedDate.toISOString().split('T')[0];
};

function Passagens() {
  const today = getTodayString();
  // Estados para os filtros
  const [startDate, setStartDate] = useState(today); // String YYYY-MM-DD
  const [endDate, setEndDate] = useState(today);     // String YYYY-MM-DD
  const [viagemFilter, setViagemFilter] = useState('todos'); // Filtro de viagem

  // Estados para os dados
  const [allPassagens, setAllPassagens] = useState([]); // Armazena TODAS as passagens do range
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Efeito para buscar/subscrever dados QUANDO o range de datas mudar
  useEffect(() => {
    setLoading(true);
    setError(null);

    // Validação básica das datas
    if (!startDate || !endDate || startDate > endDate) {
        setError("Período de datas inválido.");
        setLoading(false);
        setAllPassagens([]);
        return () => {};
    }

    // Converte as strings de data para objetos Date antes de passar
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T23:59:59'); // Inclui o dia final completo

     if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        setError('Datas inválidas selecionadas.');
        setLoading(false);
        setAllPassagens([]);
        return () => {};
    }

    // Chama a função de serviço adaptada para buscar/subscrever NO RANGE
    const unsubscribe = subscribeToPassagensInRange(start, end, (fetchedPassagens, err) => {
      if (err) {
        setError(err.message || 'Erro ao carregar passagens.');
        setAllPassagens([]); // Limpa em caso de erro
      } else {
        setAllPassagens(fetchedPassagens || []); // Garante que seja sempre um array
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Limpa a subscrição

  }, [startDate, endDate]); // Depende APENAS do range de datas

  // Filtra as passagens (client-side) baseado no viagemFilter
  const filteredPassagens = useMemo(() => {
    if (viagemFilter === 'todos') {
      return allPassagens;
    }
    return allPassagens.filter(p => p.viagem === viagemFilter);
  }, [allPassagens, viagemFilter]);

  // Handlers para atualizar os filtros (serão passados para FiltroPassagens)
  const handleStartDateChange = (dateString) => {
    setStartDate(dateString);
  };

  const handleEndDateChange = (dateString) => {
    setEndDate(dateString);
  };

  const handleViagemChange = (viagem) => {
    setViagemFilter(viagem);
  };

  const handleClearFilters = () => {
    setStartDate(today);
    setEndDate(today);
    setViagemFilter('todos');
  };

  return (
    <div className="passagens-container">
      <BarraNavegacao />
      <div className='passagens-content'>
        <main className="passagens-content">
             <AddPassagem /> 

          <FiltroPassagens
            startDate={startDate}
            endDate={endDate}
            viagemFilter={viagemFilter}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
            onViagemChange={handleViagemChange}
            onClearFilters={handleClearFilters}
          />

          {/* Passa os dados FILTRADOS para ListaPassagens */}
          <ListaPassagens
            passagens={filteredPassagens}
            loading={loading}
            error={error}
            // selectedDate não é mais passado, a menos que ListaPassagens precise por outro motivo
          />
        </main>
      </div>
    </div>
  );
}

export default Passagens;