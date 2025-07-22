import React from 'react';
import './Paginacao.css'; 

const Paginacao = ({ itensPorPagina, totalItens, paginate, currentPage }) => {
    const pageNumbers = [];

    for (let i = 1; i <= Math.ceil(totalItens / itensPorPagina); i++) {
        pageNumbers.push(i);
    }

    if (pageNumbers.length <= 1) {
        return null;
    }

    return (
        <nav>
            <ul className="pagination">
                {pageNumbers.map(number => (
                    <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                        <a onClick={() => paginate(number)} href="#!" className="page-link">
                            {number}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default Paginacao;