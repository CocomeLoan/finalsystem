import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, GraduationCap, Brain, BarChart3,
  MessageSquare, LogOut, FileText, Database,
  ChevronLeft, ChevronRight, ScrollText, ClipboardList, Settings as SettingsIcon
} from 'lucide-react';
import { usePortalAuth } from '@/lib/PortalAuthContext';
import { useNavigate } from 'react-router-dom';

const roleMenus = {
  admin: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { label: 'Students', icon: GraduationCap, path: '/admin/students' },
    { label: 'Predictions', icon: Brain, path: '/admin/predictions' },
    { label: 'Model Training', icon: Database, path: '/admin/training' },
    { label: 'Model Results', icon: BarChart3, path: '/admin/model-results' },
    { label: 'Training Logs', icon: ScrollText, path: '/admin/training-logs' },
    { label: 'Prediction Logs', icon: ClipboardList, path: '/admin/prediction-logs' },
    { label: 'Concerns', icon: MessageSquare, path: '/admin/concerns' },
    { label: 'Reports', icon: FileText, path: '/admin/reports' },
    { label: 'Settings', icon: SettingsIcon, path: '/admin/settings' },
  ],
  dean: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dean' },
    { label: 'Students', icon: GraduationCap, path: '/dean/students' },
    { label: 'Predictions', icon: Brain, path: '/dean/predictions' },
    { label: 'Model Training', icon: Database, path: '/dean/training' },
    { label: 'Model Results', icon: BarChart3, path: '/dean/model-results' },
    { label: 'Training Logs', icon: ScrollText, path: '/dean/training-logs' },
    { label: 'Prediction Logs', icon: ClipboardList, path: '/dean/prediction-logs' },
    { label: 'Concerns', icon: MessageSquare, path: '/dean/concerns' },
    { label: 'Settings', icon: SettingsIcon, path: '/dean/settings' },
  ],
  developer: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/developer' },
    { label: 'User Management', icon: Users, path: '/developer/users' },
    { label: 'System Stats', icon: BarChart3, path: '/developer/stats' },
    { label: 'Settings', icon: SettingsIcon, path: '/developer/settings' },
  ],
  student: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/student' },
    { label: 'My Grades', icon: FileText, path: '/student/grades' },
    { label: 'My Prediction', icon: Brain, path: '/student/prediction' },
    { label: 'Submit Concern', icon: MessageSquare, path: '/student/concerns' },
    { label: 'Settings', icon: SettingsIcon, path: '/student/settings' },
  ],
};

export default function Sidebar({ role, collapsed, onToggle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { portalUser, logout } = usePortalAuth();
  const menu = roleMenus[role] || [];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const roleLabels = {
    admin: 'Administrator',
    dean: 'Dean',
    developer: 'Developer',
    student: 'Student',
  };

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground flex flex-col z-50 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        {!collapsed && (
          <div>
            <h1 className="text-xs font-bold tracking-tight leading-tight">PSAS-ML XAI</h1>
            <p className="text-xs text-sidebar-foreground/60 mt-0.5">{roleLabels[role]} Panel</p>
          </div>
        )}
        <button onClick={onToggle} className="p-1.5 rounded-md hover:bg-sidebar-accent transition-colors">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {menu.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sm font-bold text-sidebar-primary-foreground">
              {(portalUser?.displayName || portalUser?.identifier || 'U')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{portalUser?.displayName || portalUser?.identifier}</p>
              <p className="text-xs text-sidebar-foreground/50 truncate capitalize">{portalUser?.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-destructive w-full transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}