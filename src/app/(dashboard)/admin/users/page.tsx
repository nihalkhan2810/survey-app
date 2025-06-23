'use client';

import { motion } from 'framer-motion';
import { 
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Shield,
  Mail,
  Calendar,
  Activity,
  MoreVertical,
  Eye,
  Lock,
  Unlock,
  UserCheck,
  Settings
} from 'lucide-react';
import { useState } from 'react';
import { hasPermission, Permission } from '@/types/permissions';
import { useSession } from 'next-auth/react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  createdAt: string;
  permissions: Permission[];
  department?: string;
  surveyCount: number;
  responseCount: number;
}

interface PermissionGroup {
  category: string;
  permissions: { key: Permission; label: string; description: string }[];
}

export default function UsersPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role || 'USER';
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  const users: User[] = [
    {
      id: '1',
      name: 'John Admin',
      email: 'admin@sayz.com',
      role: 'ADMIN',
      status: 'active',
      lastLogin: '2 hours ago',
      createdAt: '2024-01-01',
      permissions: ['admin.full_access'],
      department: 'IT',
      surveyCount: 25,
      responseCount: 1250
    },
    {
      id: '2',
      name: 'Sarah Moderator',
      email: 'sarah@sayz.com',
      role: 'MODERATOR',
      status: 'active',
      lastLogin: '1 day ago',
      createdAt: '2024-01-05',
      permissions: ['surveys.view', 'surveys.edit', 'responses.view', 'analytics.view'],
      department: 'Research',
      surveyCount: 12,
      responseCount: 450
    },
    {
      id: '3',
      name: 'Mike User',
      email: 'mike@sayz.com',
      role: 'USER',
      status: 'active',
      lastLogin: '3 hours ago',
      createdAt: '2024-01-10',
      permissions: ['surveys.view', 'surveys.create', 'responses.view'],
      department: 'Marketing',
      surveyCount: 8,
      responseCount: 320
    },
    {
      id: '4',
      name: 'Emily Pending',
      email: 'emily@sayz.com',
      role: 'USER',
      status: 'pending',
      lastLogin: 'Never',
      createdAt: '2024-01-20',
      permissions: ['surveys.view'],
      department: 'Sales',
      surveyCount: 0,
      responseCount: 0
    }
  ];

  const permissionGroups: PermissionGroup[] = [
    {
      category: 'Surveys',
      permissions: [
        { key: 'surveys.view', label: 'View Surveys', description: 'View all surveys and their details' },
        { key: 'surveys.create', label: 'Create Surveys', description: 'Create new surveys' },
        { key: 'surveys.edit', label: 'Edit Surveys', description: 'Modify existing surveys' },
        { key: 'surveys.delete', label: 'Delete Surveys', description: 'Remove surveys permanently' },
        { key: 'surveys.publish', label: 'Publish Surveys', description: 'Publish and distribute surveys' }
      ]
    },
    {
      category: 'Responses',
      permissions: [
        { key: 'responses.view', label: 'View Responses', description: 'Access survey responses and data' },
        { key: 'responses.export', label: 'Export Responses', description: 'Export response data to various formats' },
        { key: 'responses.delete', label: 'Delete Responses', description: 'Remove individual responses' }
      ]
    },
    {
      category: 'Users',
      permissions: [
        { key: 'users.view', label: 'View Users', description: 'View user accounts and profiles' },
        { key: 'users.create', label: 'Create Users', description: 'Create new user accounts' },
        { key: 'users.edit', label: 'Edit Users', description: 'Modify user accounts and settings' },
        { key: 'users.delete', label: 'Delete Users', description: 'Remove user accounts' },
        { key: 'users.manage_permissions', label: 'Manage Permissions', description: 'Assign and modify user permissions' }
      ]
    },
    {
      category: 'Analytics',
      permissions: [
        { key: 'analytics.view', label: 'View Analytics', description: 'Access analytics dashboard and reports' },
        { key: 'analytics.export', label: 'Export Analytics', description: 'Export analytics data and reports' }
      ]
    },
    {
      category: 'System',
      permissions: [
        { key: 'integrations.view', label: 'View Integrations', description: 'View integration settings' },
        { key: 'integrations.configure', label: 'Configure Integrations', description: 'Modify integration settings' },
        { key: 'system.view', label: 'View System', description: 'Access system information' },
        { key: 'system.configure', label: 'Configure System', description: 'Modify system settings' },
        { key: 'admin.full_access', label: 'Full Admin Access', description: 'Complete administrative control' }
      ]
    }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'MODERATOR':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'USER':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'inactive':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const canManageUser = (targetUser: User) => {
    if (userRole === 'ADMIN') return true;
    if (userRole === 'MODERATOR' && targetUser.role === 'USER') return true;
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Users className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">User Management</h1>
              <p className="text-blue-100 mt-1">
                Manage users, roles, and permissions
              </p>
            </div>
          </div>
          {hasPermission(userRole, 'users.create') && (
            <button className="flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors">
              <Plus className="h-4 w-4" />
              Add User
            </button>
          )}
        </div>
      </motion.div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-4">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="MODERATOR">Moderator</option>
              <option value="USER">User</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                        {user.department && (
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            {user.department}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="space-y-1">
                      <div>{user.surveyCount} surveys</div>
                      <div>{user.responseCount} responses</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.lastLogin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center gap-2 justify-end">
                      {hasPermission(userRole, 'users.view') && (
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      {hasPermission(userRole, 'users.manage_permissions') && canManageUser(user) && (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowPermissionModal(true);
                          }}
                          className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                        >
                          <Shield className="h-4 w-4" />
                        </button>
                      )}
                      {hasPermission(userRole, 'users.edit') && canManageUser(user) && (
                        <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {hasPermission(userRole, 'users.delete') && canManageUser(user) && (
                        <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permission Modal */}
      {showPermissionModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Manage Permissions - {selectedUser.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Configure user permissions and access levels
                </p>
              </div>
              <button
                onClick={() => setShowPermissionModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {permissionGroups.map((group) => (
                <div key={group.category}>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    {group.category}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {group.permissions.map((permission) => (
                      <div
                        key={permission.key}
                        className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
                      >
                        <input
                          type="checkbox"
                          checked={selectedUser.permissions.includes(permission.key)}
                          onChange={() => {}}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div>
                          <label className="text-sm font-medium text-gray-900 dark:text-white">
                            {permission.label}
                          </label>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {permission.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowPermissionModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}