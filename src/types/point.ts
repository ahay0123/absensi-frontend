// ═══════════════════════════════════════════════════════════════════════════
// POINT SYSTEM TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

export type TransactionType = "EARN" | "PENALTY" | "SPEND" | "REWARD";

export type TokenStatus = "AVAILABLE" | "USED" | "EXPIRED";

export type ConditionType =
  | "arrival_time"
  | "lateness"
  | "absence"
  | "early_arrival";

export type ConditionOperator = "<" | ">" | "==" | "BETWEEN";

export type TargetRole = "guru" | "siswa" | "karyawan";

// ─────────────────────────────────────────────────────────────────────────

export interface PointBalance {
  user_id: number;
  name: string;
  balance: number;
}

export interface PointTransaction {
  id: number;
  user_id: number;
  transaction_type: TransactionType;
  amount: number;
  current_balance: number;
  description: string;
  related_attendance_id?: number | null;
  related_token_id?: number | null;
  created_at: string;
}

export interface PointHistory {
  data: PointTransaction[];
  pagination: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
  };
}

export interface PointSummary {
  balance: number;
  total_earned: number;
  total_penalty: number;
  total_spent: number;
}

// ─────────────────────────────────────────────────────────────────────────

export interface FlexibilityItem {
  id: number;
  item_name: string;
  point_cost: number;
  stock_limit: number | null;
  in_stock: boolean;
  can_afford: boolean;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceResponse {
  items: FlexibilityItem[];
  user_balance: number;
}

export interface RedeemResponse {
  token_id: number;
  item_name: string;
  status: TokenStatus;
  created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────

export interface UserToken {
  id: number;
  item_name: string;
  status: TokenStatus;
  created_at: string;
  used_at?: string;
  used_at_attendance_id?: number;
}

export interface MyTokensResponse {
  available: UserToken[];
  used: UserToken[];
  expired: UserToken[];
  summary: {
    available_count: number;
    used_count: number;
    expired_count: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────
// ADMIN TYPES
// ─────────────────────────────────────────────────────────────────────────

export interface PointRule {
  id: number;
  rule_name: string;
  target_role: TargetRole;
  condition_type: ConditionType;
  condition_operator: ConditionOperator;
  condition_value: string;
  point_modifier: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RulesResponse {
  data: PointRule[];
  pagination: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
  };
}

export interface CreateRulePayload {
  rule_name: string;
  target_role: TargetRole;
  condition_type: ConditionType;
  condition_operator: ConditionOperator;
  condition_value: string;
  point_modifier: number;
  is_active: boolean;
}

export interface UpdateRulePayload {
  rule_name?: string;
  target_role?: TargetRole;
  condition_type?: ConditionType;
  condition_operator?: ConditionOperator;
  condition_value?: string;
  point_modifier?: number;
  is_active?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────

export interface AdminFlexibilityItem {
  id: number;
  item_name: string;
  point_cost: number;
  stock_limit: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminItemsResponse {
  data: AdminFlexibilityItem[];
  pagination: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
  };
}

export interface CreateItemPayload {
  item_name: string;
  point_cost: number;
  stock_limit?: number | null;
  is_active: boolean;
}

export interface UpdateItemPayload {
  item_name?: string;
  point_cost?: number;
  stock_limit?: number | null;
  is_active?: boolean;
}
