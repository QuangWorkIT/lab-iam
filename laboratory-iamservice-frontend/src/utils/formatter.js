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

/**
 * Format account banned date string to local format
 * Ex dateStr: 2025-11-08T11:13:38.988744500+07:00[Asia/Ho_Chi_Minh]
 * Return value: 2025-11-08T11:13:38.988744500
 */
export const formatBannedDate = (dateStr) => {
  if (!dateStr || dateStr === undefined || dateStr === "null") return "N/A"

  return dateStr.split("+")[0]
}

/**
 * Format remain time
 * Ex time: 7027922
 * Return value: 01:01:01s
 */
export const formatRemainTime = (time) => {
  if (!time) return "N/A";
  const seconds = Math.floor((time / 1000) % 60)
  const minutes = Math.floor((time / (1000 * 60)) % 60)
  const hours = Math.floor((time / (1000 * 60 * 60)) % 24)

  return hours.toString().padStart(2, "0") + ":" +
        minutes.toString().padStart(2, "0") + ":" +
        seconds.toString().padStart(2, "0") + "s"
}
/**
 * Truncate ID to show only first part with ellipsis
 */
export const truncateId = (id, maxLength = 8) => {
  if (!id) return "N/A";

  const idString = String(id);
  if (idString.length <= maxLength) return idString;

  return idString.substring(0, maxLength) + "...";
};

/**
 * Format user role
 */
export const getRoleName = (role) => {
  if (!role) return null;

  return role.substring(5)
}