import React from "react";

export default function Pagination({ currentPage, totalPages, onPageChange, totalElements, pageSize, onPageSizeChange }) {
  // Don't show pagination if there's only 1 page or no pages
  if (!totalPages || totalPages <= 1) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "20px",
        padding: "15px 0",
        borderTop: "1px solid #eee",
      }}
    >
      {/* Info text and page size selector */}
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        {totalElements !== undefined && (
          <div style={{ fontSize: "14px", color: "#666" }}>
            Showing page <strong>{currentPage + 1}</strong> of <strong>{totalPages}</strong>
            {totalElements > 0 && ` (${totalElements} total items)`}
          </div>
        )}

        {onPageSizeChange && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px", color: "#666" }}>Items per page:</span>
            <select
              value={pageSize || 10}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{
                padding: "6px 10px",
                border: "1px solid #e0e0e0",
                borderRadius: "4px",
                fontSize: "14px",
                backgroundColor: "#fff",
                color: "#333",
                cursor: "pointer",
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}
      </div>

      {/* Pagination buttons */}
      <div style={{ display: "flex", gap: "5px" }}>
        <button
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e0e0e0",
            borderRadius: "4px",
            padding: "8px 12px",
            cursor: currentPage === 0 ? "not-allowed" : "pointer",
            color: "#666",
            opacity: currentPage === 0 ? 0.5 : 1,
          }}
          onClick={() => onPageChange(0)}
          disabled={currentPage === 0}
          title="First page"
        >
          &lt;&lt;
        </button>
        <button
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e0e0e0",
            borderRadius: "4px",
            padding: "8px 12px",
            cursor: currentPage === 0 ? "not-allowed" : "pointer",
            color: "#666",
            opacity: currentPage === 0 ? 0.5 : 1,
          }}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          title="Previous page"
        >
          &lt;
        </button>

        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          // Tính toán số trang để hiển thị 5 nút phân trang quanh trang hiện tại
          const pageNumber =
            currentPage <= 2
              ? i // Nếu đang ở đầu, hiển thị 5 trang đầu
              : currentPage >= totalPages - 3
                ? totalPages - 5 + i // Nếu đang ở cuối, hiển thị 5 trang cuối
                : currentPage - 2 + i; // Nếu ở giữa, hiển thị 2 trang trước và 2 trang sau

          // Kiểm tra pageNumber có hợp lệ không
          if (pageNumber < 0 || pageNumber >= totalPages) return null;

          return (
            <button
              key={pageNumber}
              style={{
                backgroundColor:
                  currentPage === pageNumber ? "#ff5a5f" : "#ffffff",
                color: currentPage === pageNumber ? "white" : "#666",
                border: currentPage === pageNumber ? "none" : "1px solid #e0e0e0",
                borderRadius: "4px",
                padding: "8px 12px",
                cursor: "pointer",
                fontWeight: currentPage === pageNumber ? "bold" : "normal",
                minWidth: "40px",
              }}
              onClick={() => onPageChange(pageNumber)}
            >
              {pageNumber + 1}
            </button>
          );
        }).filter(Boolean)}

        <button
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e0e0e0",
            borderRadius: "4px",
            padding: "8px 12px",
            cursor: currentPage >= totalPages - 1 ? "not-allowed" : "pointer",
            color: "#666",
            opacity: currentPage >= totalPages - 1 ? 0.5 : 1,
          }}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          title="Next page"
        >
          &gt;
        </button>
        <button
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e0e0e0",
            borderRadius: "4px",
            padding: "8px 12px",
            cursor: currentPage >= totalPages - 1 ? "not-allowed" : "pointer",
            color: "#666",
            opacity: currentPage >= totalPages - 1 ? 0.5 : 1,
          }}
          onClick={() => onPageChange(totalPages - 1)}
          disabled={currentPage >= totalPages - 1}
          title="Last page"
        >
          &gt;&gt;
        </button>
      </div>
    </div>
  );
}
