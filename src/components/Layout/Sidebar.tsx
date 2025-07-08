import React from 'react';
import { 
  Home, 
  Users, 
  BookOpen, 
  GraduationCap, 
  MapPin, 
  Calendar, 
  Settings, 
  Clock,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Layers,
  Zap,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  roles: ('admin' | 'teacher' | 'viewer')[];
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, roles: ['admin', 'teacher', 'viewer'] },
  { id: 'academic-years', label: 'Anos Letivos', icon: CalendarDays, roles: ['admin'] },
  { id: 'segments', label: 'Segmentos', icon: Layers, roles: ['admin'] },
  { id: 'teachers', label: 'Professores', icon: Users, roles: ['admin'] },
  { id: 'teacher-restrictions', label: 'Restrições', icon: UserCheck, roles: ['admin'] },
  { id: 'subjects', label: 'Disciplinas', icon: BookOpen, roles: ['admin'] },
  { id: 'classes', label: 'Turmas', icon: GraduationCap, roles: ['admin'] },
  { id: 'classrooms', label: 'Salas', icon: MapPin, roles: ['admin'] },
  { id: 'time-config', label: 'Config. Horários', icon: Clock, roles: ['admin'] },
  { id: 'schedule-engine', label: 'Motor de Geração', icon: Zap, roles: ['admin'] },
  { id: 'schedules', label: 'Horários', icon: Calendar, roles: ['admin', 'teacher', 'viewer'] },
  { id: 'reports', label: 'Relatórios', icon: BarChart3, roles: ['admin', 'teacher'] },
  { id: 'settings', label: 'Configurações', icon: Settings, roles: ['admin'] },
];

export default function Sidebar({ isCollapsed, onToggle, activeSection, onSectionChange }: SidebarProps) {
  const { user, logout } = useAuth();

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role || 'viewer')
  );

  return (
    <div className={`bg-white shadow-lg h-full flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-primary-600">SIGHE</h1>
              <p className="text-sm text-gray-500">Sistema de Horários</p>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* User Info */}
      {!isCollapsed && user && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user.role === 'admin' ? 'Administrador' : 
                 user.role === 'teacher' ? 'Professor' : 'Visualizador'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Menu Items */}
      <nav className="flex-1 p-2 overflow-y-auto">
        <ul className="space-y-1">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-gray-200">
        <button
          onClick={logout}
          className="w-full flex items-center px-3 py-2 text-left rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
          title={isCollapsed ? 'Sair' : undefined}
        >
          <LogOut className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
          {!isCollapsed && (
            <span className="text-sm font-medium">Sair</span>
          )}
        </button>
      </div>
    </div>
  );
}