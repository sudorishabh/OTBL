export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  STAFF: "staff",
  OPERATOR: "operator",
  VIEWER: "viewer",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_HIERARCHY: Record<Role, number> = {
  admin: 5,
  manager: 4,
  staff: 3,
  operator: 2,
  viewer: 1,
};

export const STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export const WO_PROCESS = {
  BIOREMEDIATION: "bioremediation",
  RESTORATION: "restoration",
} as const;

export type Status = (typeof STATUS)[keyof typeof STATUS];

export default { ROLES, STATUS, ROLE_HIERARCHY, WO_PROCESS };
