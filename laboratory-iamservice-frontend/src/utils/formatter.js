/**
 * Format date string to local format
 */
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  // Xử lý nếu dateString là date đơn giản (YYYY-MM-DD)
  if (dateString.length === 10) {
    const [year, month, day] = dateString.split("-");
    return `${day || "?"}/${month || "?"}/${year || "?"}`;
  }

  // Xử lý nếu dateString là ISO date string
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

/**
 * Format privileges array or string to display format
 */
export const formatPrivileges = (privileges) => {
  if (!privileges) return "N/A";

  // Nếu privileges đã là string, split nó
  if (typeof privileges === "string") {
    const privilegesArr = privileges.split(",");
    return (
      privilegesArr.slice(0, 3).join(", ") +
      (privilegesArr.length > 3 ? "..." : "")
    );
  }

  // Nếu privileges là array
  if (Array.isArray(privileges)) {
    return (
      privileges.slice(0, 3).join(", ") + (privileges.length > 3 ? "..." : "")
    );
  }

  return "N/A";
};
