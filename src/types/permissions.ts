export type Permission = 
  | 'surveys.view'
  | 'surveys.create' 
  | 'surveys.edit'
  | 'surveys.delete'
  | 'surveys.publish'
  | 'responses.view'
  | 'responses.export'
  | 'responses.delete'
  | 'users.view'
  | 'users.create'
  | 'users.edit'
  | 'users.delete'
  | 'users.manage_permissions'
  | 'analytics.view'
  | 'analytics.export'
  | 'integrations.view'
  | 'integrations.configure'
  | 'system.view'
  | 'system.configure'
  | 'admin.full_access'

export interface UserPermissions {
  userId: string
  permissions: Permission[]
  roleOverride?: 'USER' | 'ADMIN' | 'MODERATOR'
  restrictedSurveys?: string[]
  allowedDepartments?: string[]
}

export const DEFAULT_ROLE_PERMISSIONS: Record<'USER' | 'ADMIN' | 'MODERATOR', Permission[]> = {
  USER: [
    'surveys.view',
    'surveys.create',
    'responses.view'
  ],
  MODERATOR: [
    'surveys.view',
    'surveys.create',
    'surveys.edit',
    'surveys.publish',
    'responses.view',
    'responses.export',
    'analytics.view',
    'users.view'
  ],
  ADMIN: [
    'admin.full_access',
    'surveys.view',
    'surveys.create',
    'surveys.edit',
    'surveys.delete',
    'surveys.publish',
    'responses.view',
    'responses.export',
    'responses.delete',
    'users.view',
    'users.create',
    'users.edit',
    'users.delete',
    'users.manage_permissions',
    'analytics.view',
    'analytics.export',
    'integrations.view',
    'integrations.configure',
    'system.view',
    'system.configure'
  ]
}

export function hasPermission(
  userRole: 'USER' | 'ADMIN' | 'MODERATOR',
  permission: Permission,
  customPermissions?: Permission[]
): boolean {
  if (userRole === 'ADMIN' && permission !== 'admin.full_access') {
    return true
  }
  
  const permissions = customPermissions || DEFAULT_ROLE_PERMISSIONS[userRole]
  return permissions.includes(permission) || permissions.includes('admin.full_access')
}