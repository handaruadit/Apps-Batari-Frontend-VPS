//===== (Imports) ======
import {
  normalizePlantAccessRole,
  PLANT_ACCESS_ROLE_VALUES,
} from "@/services/plantService";

//===== (getParamValue) ======
export function getParamValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

//===== (formatAccessRole) ======
export function formatAccessRole(role) {
  if (role === "owner") return "Owner";

  const normalizedRole = normalizePlantAccessRole(role);

  if (normalizedRole === PLANT_ACCESS_ROLE_VALUES.MANAGE_ACCESS) {
    return "Owner";
  }

  if (normalizedRole === PLANT_ACCESS_ROLE_VALUES.VIEW_ONLY) {
    return "View Only";
  }

  return "-";
}

//===== (getAccessUserId) ======
export function getAccessUserId(user) {
  return user?.userId ?? user?.user_id ?? user?.id ?? null;
}
