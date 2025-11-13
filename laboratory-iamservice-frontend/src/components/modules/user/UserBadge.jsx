import React from "react";
import RoleBadge from "../role/RoleBadge";

/**
 * UserBadge - Wrapper component for displaying user roles
 * Uses RoleBadge internally to maintain consistent styling across the app
 * This wrapper exists to:
 * 1. Keep semantic clarity (UserBadge vs RoleBadge)
 * 2. Allow future customization specific to user contexts
 * 3. Maintain backward compatibility with existing code
 */
export default function UserBadge({ roleName }) {
  return <RoleBadge roleName={roleName} />;
}
