import { ACTIONS, USER_ROLES, type Action, type UserRole } from '@/type/auth';

const rolePermissions: Record<UserRole, Action[]> = {
  [USER_ROLES.ADMIN]: [
    ACTIONS.CREATE,
    ACTIONS.EDIT,
    ACTIONS.DELETE,
    ACTIONS.READ,
  ],
  [USER_ROLES.VENDOR]: [ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.READ],
  [USER_ROLES.CUSTOMER]: [ACTIONS.READ],
};

const defaultRoutes: Record<UserRole, string> = {
  [USER_ROLES.ADMIN]: '/adminDashboard',
  [USER_ROLES.VENDOR]: '/store-manager',
  [USER_ROLES.CUSTOMER]: '/shop',
};

export const permissionUtils = {
  canPerformAction: (
    userRole: UserRole | undefined,
    action: Action
  ): boolean => {
    if (!userRole) return false;
    return rolePermissions[userRole]?.includes(action) || false;
  },

  hasAnyRole: (userRole: UserRole | undefined, roles: UserRole[]): boolean =>
    userRole ? roles.includes(userRole) : false,

  getDefaultRoute: (userRole: UserRole): string =>
    defaultRoutes[userRole] || '/',

  isAdmin: (userRole: UserRole | undefined): boolean =>
    userRole === USER_ROLES.ADMIN,
};

export const usePermissions = (userRole: UserRole | undefined) => {
  return {
    canCreate: permissionUtils.canPerformAction(userRole, ACTIONS.CREATE),
    canEdit: permissionUtils.canPerformAction(userRole, ACTIONS.EDIT),
    canDelete: permissionUtils.canPerformAction(userRole, ACTIONS.DELETE),
    canRead: permissionUtils.canPerformAction(userRole, ACTIONS.READ),
    isAdmin: permissionUtils.isAdmin(userRole),
    hasRole: (roles: UserRole[]) => permissionUtils.hasAnyRole(userRole, roles),
    getDefaultRoute: () => permissionUtils.getDefaultRoute(userRole!),
  };
};
