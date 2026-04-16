// ═══════════════════════════════════════════════════════════════════════════
// ADMIN POINT SERVICE - API calls untuk admin management
// ═══════════════════════════════════════════════════════════════════════════

import api from "@/lib/axios";
import {
  AdminFlexibilityItem,
  AdminItemsResponse,
  CreateItemPayload,
  CreateRulePayload,
  PointRule,
  RulesResponse,
  TargetRole,
  UpdateItemPayload,
  UpdateRulePayload,
} from "@/types/point";

const POINT_RULES_URL = "/admin/point-rules";
const MARKETPLACE_URL = "/admin/marketplace/items";

// ═════════════════════════════════════════════════════════════════════════
// POINT RULES ENDPOINTS
// ═════════════════════════════════════════════════════════════════════════

/**
 * Get all point rules with filters
 * GET /api/admin/point-rules?role=guru&is_active=true&condition_type=lateness
 */
export const getRules = async (filters?: {
  role?: TargetRole;
  is_active?: boolean;
  condition_type?: string;
  page?: number;
  limit?: number;
}): Promise<RulesResponse> => {
  const { data } = await api.get<RulesResponse>(POINT_RULES_URL, {
    params: filters,
  });
  return data;
};

/**
 * Get single rule by ID
 * GET /api/admin/point-rules/{id}
 */
export const getRuleById = async (id: number): Promise<PointRule> => {
  const { data } = await api.get<{ data: PointRule }>(
    `${POINT_RULES_URL}/${id}`,
  );
  return data.data;
};

/**
 * Create new point rule
 * POST /api/admin/point-rules
 */
export const createRule = async (
  payload: CreateRulePayload,
): Promise<PointRule> => {
  const { data } = await api.post<{ data: PointRule }>(
    POINT_RULES_URL,
    payload,
  );
  return data.data;
};

/**
 * Update existing point rule
 * PUT /api/admin/point-rules/{id}
 */
export const updateRule = async (
  id: number,
  payload: UpdateRulePayload,
): Promise<PointRule> => {
  const { data } = await api.put<{ data: PointRule }>(
    `${POINT_RULES_URL}/${id}`,
    payload,
  );
  return data.data;
};

/**
 * Toggle rule active/inactive status
 * PATCH /api/admin/point-rules/{id}/toggle
 */
export const toggleRule = async (id: number): Promise<PointRule> => {
  const { data } = await api.patch<{ data: PointRule }>(
    `${POINT_RULES_URL}/${id}/toggle`,
  );
  return data.data;
};

/**
 * Delete point rule
 * DELETE /api/admin/point-rules/{id}
 */
export const deleteRule = async (id: number): Promise<void> => {
  await api.delete(`${POINT_RULES_URL}/${id}`);
};

// ═════════════════════════════════════════════════════════════════════════
// FLEXIBILITY MARKETPLACE ENDPOINTS
// ═════════════════════════════════════════════════════════════════════════

/**
 * Get all marketplace items (Admin)
 * GET /api/admin/marketplace/items?page=1&limit=20
 */
export const getMarketplaceItems = async (filters?: {
  is_active?: boolean;
  page?: number;
  limit?: number;
}): Promise<AdminItemsResponse> => {
  const { data } = await api.get<AdminItemsResponse>(MARKETPLACE_URL, {
    params: filters,
  });
  return data;
};

/**
 * Get single marketplace item by ID (Admin)
 * GET /api/admin/marketplace/items/{id}
 */
export const getItemById = async (
  id: number,
): Promise<AdminFlexibilityItem> => {
  const { data } = await api.get<AdminFlexibilityItem>(
    `${MARKETPLACE_URL}/${id}`,
  );
  return data;
};

/**
 * Create new marketplace item (Admin)
 * POST /api/admin/marketplace/items
 */
export const createItem = async (
  payload: CreateItemPayload,
): Promise<AdminFlexibilityItem> => {
  const { data } = await api.post<AdminFlexibilityItem>(
    MARKETPLACE_URL,
    payload,
  );
  return data;
};

/**
 * Update existing marketplace item (Admin)
 * PUT /api/admin/marketplace/items/{id}
 */
export const updateItem = async (
  id: number,
  payload: UpdateItemPayload,
): Promise<AdminFlexibilityItem> => {
  const { data } = await api.put<AdminFlexibilityItem>(
    `${MARKETPLACE_URL}/${id}`,
    payload,
  );
  return data;
};

/**
 * Toggle item active/inactive status (Admin)
 * PATCH /api/admin/marketplace/items/{id}/toggle
 */
export const toggleItem = async (id: number): Promise<AdminFlexibilityItem> => {
  const { data } = await api.patch<AdminFlexibilityItem>(
    `${MARKETPLACE_URL}/${id}/toggle`,
  );
  return data;
};

/**
 * Delete marketplace item (Admin)
 * DELETE /api/admin/marketplace/items/{id}
 */
export const deleteItem = async (id: number): Promise<void> => {
  await api.delete(`${MARKETPLACE_URL}/${id}`);
};

// ═════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═════════════════════════════════════════════════════════════════════════

export const formatConditionValue = (type: string, value: string): string => {
  if (type === "lateness" || type === "arrival_time") {
    return value; // Format waktu
  }
  if (type === "BETWEEN") {
    return value.split(",").join(" - ");
  }
  return value;
};

export const getConditionTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    arrival_time: "Waktu Tiba",
    lateness: "Keterlambatan",
    absence: "Absensi",
    early_arrival: "Kedatangan Awal",
  };
  return labels[type] || type;
};

export const getOperatorLabel = (op: string): string => {
  const labels: Record<string, string> = {
    "<": "Kurang dari",
    ">": "Lebih dari",
    "==": "Sama dengan",
    BETWEEN: "Antara",
  };
  return labels[op] || op;
};

export const getRoleLabel = (role: string): string => {
  const labels: Record<string, string> = {
    guru: "Guru",
    siswa: "Siswa",
    karyawan: "Karyawan",
  };
  return labels[role] || role;
};
