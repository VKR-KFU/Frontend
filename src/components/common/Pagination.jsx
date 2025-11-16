import React from "react";

function Pagination({ page, totalPages, onChange }) {
    if (!totalPages || totalPages <= 1) return null;

    return (
        <div className="pagination">
            <button
                className="btn"
                disabled={page <= 1}
                onClick={() => onChange(page - 1)}
            >
                Назад
            </button>
            <span className="pagination-info">
        Страница {page} из {totalPages}
      </span>
            <button
                className="btn"
                disabled={page >= totalPages}
                onClick={() => onChange(page + 1)}
            >
                Вперёд
            </button>
        </div>
    );
}

export default Pagination;
