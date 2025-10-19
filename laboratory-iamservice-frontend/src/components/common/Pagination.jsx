import React from "react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        marginTop: "20px",
        gap: "5px",
      }}
    >
      <button
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e0e0e0",
          borderRadius: "4px",
          padding: "5px 10px",
          cursor: "pointer",
          color: "#666",
        }}
        onClick={() => onPageChange(0)}
      >
        &lt;&lt;
      </button>
      <button
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e0e0e0",
          borderRadius: "4px",
          padding: "5px 10px",
          cursor: "pointer",
          color: "#666",
        }}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
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
              padding: "5px 10px",
              cursor: "pointer",
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
          padding: "5px 10px",
          cursor: "pointer",
          color: "#666",
        }}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
      >
        &gt;
      </button>
      <button
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e0e0e0",
          borderRadius: "4px",
          padding: "5px 10px",
          cursor: "pointer",
          color: "#666",
        }}
        onClick={() => onPageChange(totalPages - 1)}
        disabled={currentPage >= totalPages - 1}
      >
        &gt;&gt;
      </button>
    </div>
  );
}
