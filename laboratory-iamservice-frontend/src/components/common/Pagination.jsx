import React from "react";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalElements,
  pageSize,
  onPageSizeChange,
}) {
  // Don't show pagination if there's only 1 page or no pages
  if (!totalPages || totalPages <= 1) {
    return null;
  }

  // Generate page numbers to display (max 3 pages)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 3;

    let startPage = Math.max(0, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);

    // Adjust if at start
    if (currentPage === 0) {
      endPage = Math.min(totalPages - 1, maxVisible - 1);
    }
    // Adjust if at end
    else if (currentPage === totalPages - 1) {
      startPage = Math.max(0, totalPages - maxVisible);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginTop: "20px",
        padding: "15px 0",
        borderTop: "1px solid #eee",
      }}
    >
      {/* Pagination buttons */}
      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        {/* First page button (<<) */}
        <button
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e0e0e0",
            borderRadius: "6px",
            padding: "8px 12px",
            cursor: currentPage === 0 ? "not-allowed" : "pointer",
            color: currentPage === 0 ? "#ccc" : "#666",
            opacity: currentPage === 0 ? 0.6 : 1,
            fontSize: "16px",
            fontWeight: "500",
            minWidth: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
          }}
          onClick={() => onPageChange(0)}
          disabled={currentPage === 0}
          title="First page"
          onMouseEnter={(e) => {
            if (currentPage !== 0) {
              e.currentTarget.style.borderColor = "#FF5A5A";
              e.currentTarget.style.backgroundColor = "#fff5f5";
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== 0) {
              e.currentTarget.style.borderColor = "#e0e0e0";
              e.currentTarget.style.backgroundColor = "#ffffff";
            }
          }}
        >
          «
        </button>

        {/* Page number buttons */}
        {pageNumbers.map((pageNum) => (
          <button
            key={pageNum}
            style={{
              backgroundColor: currentPage === pageNum ? "#FF5A5A" : "#ffffff",
              color: currentPage === pageNum ? "white" : "#666",
              border:
                currentPage === pageNum
                  ? "1px solid #FF5A5A"
                  : "1px solid #e0e0e0",
              borderRadius: "6px",
              padding: "8px 12px",
              cursor: "pointer",
              fontWeight: currentPage === pageNum ? "600" : "500",
              minWidth: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              transition: "all 0.2s ease",
            }}
            onClick={() => onPageChange(pageNum)}
            onMouseEnter={(e) => {
              if (currentPage !== pageNum) {
                e.currentTarget.style.borderColor = "#FF5A5A";
                e.currentTarget.style.backgroundColor = "#fff5f5";
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== pageNum) {
                e.currentTarget.style.borderColor = "#e0e0e0";
                e.currentTarget.style.backgroundColor = "#ffffff";
              }
            }}
          >
            {pageNum + 1}
          </button>
        ))}

        {/* Last page button (>>) */}
        <button
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e0e0e0",
            borderRadius: "6px",
            padding: "8px 12px",
            cursor: currentPage >= totalPages - 1 ? "not-allowed" : "pointer",
            color: currentPage >= totalPages - 1 ? "#ccc" : "#666",
            opacity: currentPage >= totalPages - 1 ? 0.6 : 1,
            fontSize: "16px",
            fontWeight: "500",
            minWidth: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
          }}
          onClick={() => onPageChange(totalPages - 1)}
          disabled={currentPage >= totalPages - 1}
          title="Last page"
          onMouseEnter={(e) => {
            if (currentPage < totalPages - 1) {
              e.currentTarget.style.borderColor = "#FF5A5A";
              e.currentTarget.style.backgroundColor = "#fff5f5";
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage < totalPages - 1) {
              e.currentTarget.style.borderColor = "#e0e0e0";
              e.currentTarget.style.backgroundColor = "#ffffff";
            }
          }}
        >
          »
        </button>
      </div>
    </div>
  );
}
