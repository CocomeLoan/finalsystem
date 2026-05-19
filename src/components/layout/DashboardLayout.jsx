import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ role, user }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar role={role} collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={cn(
        "transition-all duration-300 min-h-screen",
        collapsed ? "ml-16" : "ml-64"
      )}>
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}