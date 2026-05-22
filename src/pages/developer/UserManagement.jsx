import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase as base44 } from '@/api/supabaseClient';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';

const roleColors = {
  admin: 'bg-primary/10 text-primary',
  dean: 'bg-accent/10 text-accent',
  developer: 'bg-emerald-50 text-emerald-700',
  student: 'bg-amber-50 text-amber-700',
  user: 'bg-muted text-muted-foreground',
};

export default function UserManagement() {
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: () => base44.entities.User.list() });

  const columns = [
    { key: 'full_name', label: 'Name', render: (row) => row.full_name || '—' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (row) => (
      <Badge className={`text-xs ${roleColors[row.role] || roleColors.user}`}>
        {(row.role || 'user').toUpperCase()}
      </Badge>
    )},
    { key: 'student_id', label: 'Student ID', render: (row) => row.student_id || '—' },
    { key: 'department', label: 'Department', render: (row) => row.department || '—' },
    { key: 'created_date', label: 'Created', render: (row) => (
      row.created_date ? new Date(row.created_date).toLocaleDateString() : '—'
    )},
  ];

  return (
    <div>
      <PageHeader title="User Management" description="View and manage all system users" />
      <DataTable columns={columns} data={users} searchField="email" />
    </div>
  );
}