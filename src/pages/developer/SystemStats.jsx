import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase as base44 } from '@/api/supabaseClient';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatsCard from '@/components/shared/StatsCard';
import { Database, Users, Brain, MessageSquare, FileText, Activity } from 'lucide-react';

export default function SystemStats() {
  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: () => base44.entities.Student.list() });
  const { data: predictions = [] } = useQuery({ queryKey: ['predictions'], queryFn: () => base44.entities.Prediction.list() });
  const { data: concerns = [] } = useQuery({ queryKey: ['concerns'], queryFn: () => base44.entities.Concern.list() });
  const { data: grades = [] } = useQuery({ queryKey: ['grades'], queryFn: () => base44.entities.SubjectGrade.list() });
  const { data: logs = [] } = useQuery({ queryKey: ['trainingLogs'], queryFn: () => base44.entities.TrainingLog.list() });
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: () => base44.entities.User.list() });

  return (
    <div>
      <PageHeader title="System Statistics" description="Overview of all system data" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard title="Users" value={users.length} icon={Users} color="primary" />
        <StatsCard title="Students" value={students.length} icon={Database} color="accent" />
        <StatsCard title="Subject Grades" value={grades.length} icon={FileText} color="success" />
        <StatsCard title="Predictions" value={predictions.length} icon={Brain} color="primary" />
        <StatsCard title="Concerns" value={concerns.length} icon={MessageSquare} color="destructive" />
        <StatsCard title="Training Logs" value={logs.length} icon={Activity} color="accent" />
      </div>
    </div>
  );
}