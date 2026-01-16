/**
 * User roles - defines the hierarchy of roles in the system
 * Higher values mean more permissions
 */
export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  STAFF: "staff",
  OPERATOR: "operator",
  VIEWER: "viewer",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/**
 * Role hierarchy levels - used for permission checking
 */
export const ROLE_HIERARCHY: Record<Role, number> = {
  admin: 5,
  manager: 4,
  staff: 3,
  operator: 2,
  viewer: 1,
};

/**
 * Entity status values
 */
export const STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export type Status = (typeof STATUS)[keyof typeof STATUS];

export default { ROLES, STATUS, ROLE_HIERARCHY };
