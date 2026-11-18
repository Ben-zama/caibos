import type { Role } from '@/types';

export interface Permission {
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canManageTeam: boolean;
  canViewSettings: boolean;
  canViewAllBusinesses: boolean;
}

const permissions: Record<Role, Permission> = {
  owner: {
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: true,
    canManageTeam: true,
    canViewSettings: true,
    canViewAllBusinesses: false,
  },
  admin: {
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: false,
    canManageTeam: false,
    canViewSettings: false,
    canViewAllBusinesses: false,
  },
  caibos: {
    canCreate: false,
    canRead: true,
    canUpdate: false,
    canDelete: false,
    canManageTeam: false,
    canViewSettings: false,
    canViewAllBusinesses: true,
  },
};

export function getPermissions(role: Role): Permission {
  return permissions[role];
}

export function can(role: Role, action: keyof Permission): boolean {
  return permissions[role][action];
}
