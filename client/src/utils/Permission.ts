// Permission.ts
import { ACTIONS, USER_ROLES, type Action, type UserRole } from '@/type/auth';

export const rolePermissions = {
  [USER_ROLES.ADMIN]: {
    can: [
      ACTIONS.CREATE,
      ACTIONS.EDIT,
      ACTIONS.DELETE,
      ACTIONS.READ,
    ] as Action[],
  },
  [USER_ROLES.VENDOR]: {
    can: [ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.READ] as Action[],
  },
  [USER_ROLES.CUSTOMER]: {
    can: [ACTIONS.READ] as Action[],
  },
} as const;

export const permissionUtils = {
  // Check if user can perform a specific action
  canPerformAction: (
    userRole: UserRole | undefined,
    action: Action
  ): boolean => {
    if (!userRole) return false;
    const permissions = rolePermissions[userRole]?.can || [];
    return permissions.includes(action);
  },

  // Check if user has specific role
  hasRole: (userRole: UserRole | undefined, targetRole: UserRole): boolean =>
    userRole === targetRole,

  // Check if user has any of the specified roles
  hasAnyRole: (userRole: UserRole | undefined, roles: UserRole[]): boolean =>
    userRole ? roles.includes(userRole) : false,

  // Common permission checks (business logic)
  canCreate: (userRole: UserRole | undefined): boolean =>
    permissionUtils.canPerformAction(userRole, ACTIONS.CREATE),

  canEdit: (userRole: UserRole | undefined): boolean =>
    permissionUtils.canPerformAction(userRole, ACTIONS.EDIT),

  canDelete: (userRole: UserRole | undefined): boolean =>
    permissionUtils.canPerformAction(userRole, ACTIONS.DELETE),

  canRead: (userRole: UserRole | undefined): boolean =>
    permissionUtils.canPerformAction(userRole, ACTIONS.READ),

  // Convenience methods
  isAdmin: (userRole: UserRole | undefined): boolean =>
    userRole === USER_ROLES.ADMIN,

  isVendor: (userRole: UserRole | undefined): boolean =>
    userRole === USER_ROLES.VENDOR,

  isCustomer: (userRole: UserRole | undefined): boolean =>
    userRole === USER_ROLES.CUSTOMER,

  // Get default route based on role
  getDefaultRoute: (userRole: UserRole): string => {
    const routes: Record<UserRole, string> = {
      [USER_ROLES.ADMIN]: '/store-manager',
      [USER_ROLES.VENDOR]: '/shop',
      [USER_ROLES.CUSTOMER]: '/',
    };
    return routes[userRole] || '/';
  },

  // Get all permissions for a role
  getRolePermissions: (userRole: UserRole | undefined): Action[] => {
    if (!userRole) return [];
    return rolePermissions[userRole]?.can || [];
  },
};
