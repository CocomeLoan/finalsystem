import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase as base44 } from '@/api/supabaseClient';
import PageHeader from '@/components/shared/PageHeader';
import StatsCard from '@/components/shared/StatsCard';
import { Users, Database, Brain, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DeveloperDashboard() {
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: () => base44.entities.User.list() });
  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: () => base44.entities.Student.list() });
  const { data: predictions = [] } = useQuery({ queryKey: ['predictions'], queryFn: () => base44.entities.Prediction.list() });
  const { data: logs = [] } = useQuery({ queryKey: ['trainingLogs'], queryFn: () => base44.entities.TrainingLog.list() });

  const roleCounts = users.reduce((acc, u) => {
    acc[u.role || 'user'] = (acc[u.role || 'user'] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <PageHeader title="Developer Dashboard" description="System overview and management" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Total Users" value={users.length} icon={Users} color="primary" />
        <StatsCard title="Students" value={students.length} icon={Database} color="accent" />
        <StatsCard title="Predictions" value={predictions.length} icon={Brain} color="success" />
        <StatsCard title="Training Sessions" value={logs.length} icon={Activity} color="destructive" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Users by Role</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(roleCounts).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium capitalize">{role}</span>
                  <span className="text-sm font-bold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">System Info</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'Platform', value: 'SMCC' },
                { label: 'Auth System', value: 'Role-based (RBAC)' },
                { label: 'ML Engine', value: 'Python' },
                { label: 'Database', value: 'Supabase' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}